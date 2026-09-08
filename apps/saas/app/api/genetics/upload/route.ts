import { createHash } from "node:crypto";

import { auth } from "@repo/auth/auth";
import { db, replaceCurrentBioPlanningProfile } from "@repo/database";
import { NextResponse } from "next/server";

import type { HouseholdFinancialState } from "../../../../../../packages/api/modules/financial/household/types";
import { interpretAvailableModels } from "../../../../../../packages/api/modules/genetics/evidence/interpretationDispatcher";
import { observationsFrom23andMeRaw } from "../../../../../../packages/api/modules/genetics/observations/from23andMe";
import { SNP_REFERENCE } from "../../../../../../packages/api/modules/genetics/snp-reference";
import { buildGeneticHighlights } from "../../../../../../packages/api/modules/planning/geneticHighlightEngine";
import { biologicalInsightToPlanningExposures } from "../../../../../../packages/api/modules/planning/geneticsBridge";
import { buildPlanningInsights } from "../../../../../../packages/api/modules/planning/planningInsightEngine";
import {
	buildPlanningProfileV1,
	PLANNING_PROFILE_VERSION,
} from "../../../../../../packages/api/modules/planning/planningProfile";

const PARSER_VERSION = "23andme-parser-v1";
const PIPELINE_VERSION = "genetics-evidence-v1";

async function getPrimaryHousehold(userId: string) {
	return db.bioHousehold.findFirst({
		where: {
			ownerUserId: userId,
		},
		orderBy: {
			createdAt: "asc",
		},
	});
}

export async function POST(req: Request) {
	const session = await auth.api.getSession({
		headers: req.headers,
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;

	const household = await getPrimaryHousehold(userId);

	if (!household) {
		return NextResponse.json({ error: "Bioanalytix household not found" }, { status: 404 });
	}

	const form = await req.formData();
	const fileValue = form.get("file");

	if (!(fileValue instanceof File)) {
		return NextResponse.json({ error: "DNA file is required" }, { status: 400 });
	}

	const file = fileValue;
	const raw = await file.text();

	if (!raw.trim()) {
		return NextResponse.json({ error: "DNA file is empty" }, { status: 400 });
	}

	const sha256 = createHash("sha256").update(raw).digest("hex");

	/*
	 * We are not yet persisting the original raw DNA file to object storage.
	 * The storageKey therefore records the intended logical location only.
	 *
	 * Raw-file storage should be added separately with explicit retention,
	 * deletion and consent policy rather than being hidden inside this route.
	 */
	const storageKey = ["bioanalytix", household.id, "genetics", `${sha256}.txt`].join("/");

	const upload = await db.bioGeneticUpload.create({
		data: {
			householdId: household.id,
			storageKey,
			originalFileName: file.name,
			provider: "23andMe",
			fileFormat: "23andMe raw genotype data",
			sha256,
			status: "UPLOADED",
			parserVersion: PARSER_VERSION,
			pipelineVersion: PIPELINE_VERSION,
			processingMetadata: {
				fileSize: file.size,
				mimeType: file.type || null,
			},
		},
	});

	try {
		await db.bioGeneticUpload.update({
			where: {
				id: upload.id,
			},
			data: {
				status: "PARSING",
			},
		});

		const observations = observationsFrom23andMeRaw(raw, {
			parserVersion: PARSER_VERSION,
			provider: "23andMe",
		});

		await db.bioGeneticUpload.update({
			where: {
				id: upload.id,
			},
			data: {
				status: "INTERPRETING",
			},
		});

		const insights = interpretAvailableModels(observations);

		const geneticHighlights = buildGeneticHighlights(insights);

		const planningExposures = insights.flatMap((insight) =>
			biologicalInsightToPlanningExposures(insight),
		);

		const planningInsights = buildPlanningInsights({
			insights,
			geneticUploadId: upload.id,
			governanceContext: "development",
		});

		/*
		 * Keep only called observations in the temporary legacy projection.
		 * The authoritative evidence representation remains the observation /
		 * insight data recorded against BioGeneticUpload processingMetadata.
		 */
		const relevantRsids = new Set(SNP_REFERENCE.map((item) => item.rsid));

		const snps = Object.fromEntries(
			observations
				.filter(
					(observation) =>
						observation.callStatus === "called" &&
						Boolean(observation.genotype) &&
						relevantRsids.has(observation.rsid),
				)
				.map((observation) => [observation.rsid, observation.genotype as string]),
		);

		await db.bioGeneticUpload.update({
			where: {
				id: upload.id,
			},
			data: {
				status: "READY",
				processingMetadata: {
					fileSize: file.size,
					mimeType: file.type || null,

					observationCount: observations.length,
					insightCount: insights.length,
					geneticHighlightCount: geneticHighlights.length,
					planningExposureCount: planningExposures.length,
					planningInsightCount: planningInsights.length,

					modelIds: insights.map((insight) => insight.model.id),

					planningDomains: [
						...new Set(planningExposures.map((exposure) => exposure.domain)),
					],
				},
			},
		});

		if (household.financialState) {
			const planningProfile = buildPlanningProfileV1({
				household: household.financialState as unknown as HouseholdFinancialState,

				geneticUploadId: upload.id,

				modelIds: insights.map((insight) => insight.model.id),

				exposures: planningExposures,

				geneticHighlights,

				planningInsights,
			});

			await replaceCurrentBioPlanningProfile({
				householdId: household.id,
				geneticUploadId: upload.id,
				profileVersion: PLANNING_PROFILE_VERSION,
				profile: planningProfile,
			});
		}

		const diseaseRisks = insights
			.filter((insight) => insight.result.direction === "higher")
			.map((insight) => ({
				disease: insight.model.id,
				score: 0,
				label: "moderate" as const,
				explanation:
					"An evidence-backed genetic association was identified. This does not establish that the condition is present or will occur.",
				contributingMarkers: [],
			}));

		return NextResponse.json({
			data: {
				uploadId: upload.id,
				status: "READY",

				snps,

				processingSummary: {
					observationCount: observations.length,

					insightCount: insights.length,

					geneticHighlightCount: geneticHighlights.length,

					planningExposureCount: planningExposures.length,

					planningInsightCount: planningInsights.length,

					modelIds: insights.map((insight) => insight.model.id),

					planningDomains: [
						...new Set(planningExposures.map((exposure) => exposure.domain)),
					],
				},

				/*
				 * Temporary GeneticProfile-compatible fields.
				 */
				longevityScore: 0,
				diseaseRisks: diseaseRisks,
				traitInsights: [],
				geneticStrengths: [],
				longevityFactors: [],
				suggestedRetirementAge: null,
				retirementYears: null,
				riskPosture: null,
			},
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown genetics processing error";

		await db.bioGeneticUpload.update({
			where: {
				id: upload.id,
			},
			data: {
				status: "FAILED",
				errorMessage: message,
			},
		});

		console.error("Genetics processing failed:", error);

		return NextResponse.json(
			{
				error: "Unable to process DNA file",
				uploadId: upload.id,
			},
			{ status: 500 },
		);
	}
}

import { createHash } from "node:crypto";

import { auth } from "@repo/auth/auth";
import { db } from "@repo/database";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { interpretAvailableModels } from "../../../../../../packages/api/modules/genetics/evidence/interpretationDispatcher";
import { observationsFrom23andMeRaw } from "../../../../../../packages/api/modules/genetics/observations/from23andMe";
import { SNP_REFERENCE } from "../../../../../../packages/api/modules/genetics/snp-reference";
import { biologicalInsightToPlanningExposures } from "../../../../../../packages/api/modules/planning/geneticsBridge";

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

		const planningExposures = insights.flatMap((insight) =>
			biologicalInsightToPlanningExposures(insight),
		);

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
					planningExposureCount: planningExposures.length,

					modelIds: insights.map((insight) => insight.model.id),

					planningDomains: [
						...new Set(planningExposures.map((exposure) => exposure.domain)),
					],
				},
			},
		});

		/*
		 * TEMPORARY COMPATIBILITY PROJECTION
		 *
		 * DnaProfileClient currently reads /api/genetic-profile, which in turn
		 * reads user_genetic_profile from Supabase.
		 *
		 * Keep that screen working while BioGeneticUpload becomes the
		 * authoritative genetics processing record.
		 *
		 * This block will be removed when the read route is migrated.
		 */
		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!,
		);

		const legacyDiseaseRisks = insights
			.filter((insight) => insight.result.direction === "higher")
			.map((insight) => ({
				name: insight.model.id,
				risk: insight.result.direction,
			}));

		const { error: legacyError } = await supabase.from("user_genetic_profile").upsert({
			user_id: userId,
			snps,
			longevity_score: 0,
			suggested_retirement_age: null,
			retirement_years: null,
			risk_posture: null,
			disease_risks: legacyDiseaseRisks,
			trait_insights: [],
			genetic_strengths: [],
			longevity_factors: [],
		});

		if (legacyError) {
			console.error("Legacy genetic profile projection failed:", legacyError);
		}

		return NextResponse.json({
			data: {
				uploadId: upload.id,
				status: "READY",

				snps,

				processingSummary: {
					observationCount: observations.length,
					insightCount: insights.length,
					planningExposureCount: planningExposures.length,
					modelIds: insights.map((insight) => insight.model.id),
					planningDomains: [
						...new Set(planningExposures.map((exposure) => exposure.domain)),
					],
				},

				/*
				 * Temporary GeneticProfile-compatible fields.
				 */
				longevityScore: 0,
				diseaseRisks: legacyDiseaseRisks,
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

import { auth } from "@repo/auth/auth";
import {
	db,
	getCurrentBioGeneticDataProcessingConsent,
	grantBioGeneticDataProcessingConsent,
	replaceCurrentBioPlanningProfile,
} from "@repo/database";
import { NextResponse } from "next/server";

import { getBioanalytixUserEntitlements } from "../../../../../../packages/api/modules/bioanalytix/server-entitlements";
import type { HouseholdFinancialState } from "../../../../../../packages/api/modules/financial/household/types";
import { interpretAvailableModels } from "../../../../../../packages/api/modules/genetics/evidence/interpretationDispatcher";
import { observationsFrom23andMeRecords } from "../../../../../../packages/api/modules/genetics/observations/from23andMe";
import type { Parsed23andMeGenotype } from "../../../../../../packages/api/modules/genetics/parser";
import { SNP_REFERENCE } from "../../../../../../packages/api/modules/genetics/snp-reference";
import { SUPPORTED_GENETIC_RSID_SET } from "../../../../../../packages/api/modules/genetics/supported-rsids";
import { buildGeneticHighlights } from "../../../../../../packages/api/modules/planning/geneticHighlightEngine";
import { biologicalInsightToPlanningExposures } from "../../../../../../packages/api/modules/planning/geneticsBridge";
import { buildPlanningInsights } from "../../../../../../packages/api/modules/planning/planningInsightEngine";
import {
	buildPlanningProfileV1,
	PLANNING_PROFILE_VERSION,
} from "../../../../../../packages/api/modules/planning/planningProfile";

const PARSER_VERSION = "23andme-parser-v1";
const PIPELINE_VERSION = "genetics-evidence-v1";
const MAX_DNA_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const ALLOWED_DNA_FILE_EXTENSIONS = [".txt", ".csv"];
const MAX_EXTRACTED_GENOTYPE_RECORDS = 100;

interface ClientGenotypeRecord {
	rsid: string;
	chromosome: string;
	position: string;
	genotype: string;
	lineNumber: number;
}

interface GeneticUploadRequest {
	records: ClientGenotypeRecord[];
	geneticDataProcessingConsent: string;
	source: {
		originalFileName: string;
		fileSize: number;
		mimeType: string | null;
		sourceLineCount: number;
		validGenotypeCount: number;
		sha256: string;
	};
}

function isValidClientGenotypeRecord(value: unknown): value is ClientGenotypeRecord {
	if (!value || typeof value !== "object") {
		return false;
	}

	const record = value as Record<string, unknown>;

	return (
		typeof record.rsid === "string" &&
		/^rs\d+$/i.test(record.rsid) &&
		SUPPORTED_GENETIC_RSID_SET.has(record.rsid.toLowerCase()) &&
		typeof record.chromosome === "string" &&
		record.chromosome.length > 0 &&
		typeof record.position === "string" &&
		record.position.length > 0 &&
		typeof record.genotype === "string" &&
		/^[ACGT]{2}$/.test(record.genotype.toUpperCase()) &&
		typeof record.lineNumber === "number" &&
		Number.isInteger(record.lineNumber) &&
		record.lineNumber > 0
	);
}

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

	const entitlements = await getBioanalytixUserEntitlements(userId);

	if (!entitlements.capabilities.dnaUpload) {
		return NextResponse.json(
			{ error: "DNA upload requires an Individual Bioanalytix plan." },
			{ status: 403 },
		);
	}

	const household = await getPrimaryHousehold(userId);

	if (!household) {
		return NextResponse.json({ error: "Bioanalytix household not found" }, { status: 404 });
	}

	let body: GeneticUploadRequest;

	try {
		body = (await req.json()) as GeneticUploadRequest;
	} catch {
		return NextResponse.json({ error: "Invalid genetic upload request." }, { status: 400 });
	}

	if (body.geneticDataProcessingConsent !== "granted") {
		return NextResponse.json(
			{
				error: "Consent to process genetic data is required before uploading DNA data.",
			},
			{ status: 400 },
		);
	}

	if (!body.source || typeof body.source !== "object") {
		return NextResponse.json({ error: "DNA source metadata is required." }, { status: 400 });
	}

	const { originalFileName, fileSize, mimeType, sourceLineCount, validGenotypeCount, sha256 } =
		body.source;

	if (
		typeof originalFileName !== "string" ||
		!originalFileName.trim() ||
		typeof fileSize !== "number" ||
		!Number.isFinite(fileSize) ||
		fileSize <= 0 ||
		typeof sourceLineCount !== "number" ||
		!Number.isInteger(sourceLineCount) ||
		sourceLineCount <= 0 ||
		typeof validGenotypeCount !== "number" ||
		!Number.isInteger(validGenotypeCount) ||
		validGenotypeCount < 0 ||
		typeof sha256 !== "string" ||
		!/^[a-f0-9]{64}$/i.test(sha256)
	) {
		return NextResponse.json({ error: "Invalid DNA source metadata." }, { status: 400 });
	}

	if (fileSize > MAX_DNA_FILE_SIZE_BYTES) {
		return NextResponse.json({ error: "DNA file must be 25 MB or smaller." }, { status: 413 });
	}

	const fileName = originalFileName.toLowerCase();

	if (!ALLOWED_DNA_FILE_EXTENSIONS.some((extension) => fileName.endsWith(extension))) {
		return NextResponse.json(
			{ error: "DNA file must be a .txt or .csv file." },
			{ status: 400 },
		);
	}

	if (!Array.isArray(body.records) || body.records.length === 0) {
		return NextResponse.json(
			{ error: "No supported Bioanalytix genetic markers were provided." },
			{ status: 400 },
		);
	}

	if (body.records.length > MAX_EXTRACTED_GENOTYPE_RECORDS) {
		return NextResponse.json(
			{ error: "Too many genetic marker records were provided." },
			{ status: 400 },
		);
	}

	if (!body.records.every(isValidClientGenotypeRecord)) {
		return NextResponse.json({ error: "Invalid genetic marker data." }, { status: 400 });
	}

	const records: Parsed23andMeGenotype[] = body.records.map((record) => ({
		rsid: record.rsid.toLowerCase(),
		chromosome: record.chromosome,
		position: record.position,
		genotype: record.genotype.toUpperCase(),
		lineNumber: record.lineNumber,
		sourceRecord: [record.rsid, record.chromosome, record.position, record.genotype].join("\t"),
	}));

	let consent = await getCurrentBioGeneticDataProcessingConsent(userId);

	if (!consent) {
		consent = await grantBioGeneticDataProcessingConsent(userId);
	}

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
			originalFileName,
			provider: "23andMe",
			fileFormat: "23andMe raw genotype data",
			sha256,
			status: "UPLOADED",
			parserVersion: PARSER_VERSION,
			pipelineVersion: PIPELINE_VERSION,
			processingMetadata: {
				fileSize,
				mimeType,
				sourceLineCount,
				validGenotypeCount,
				extractedRecordCount: records.length,
				rawFileUploaded: false,
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

		const observations = observationsFrom23andMeRecords(records, {
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
		const relevantRsids = new Set<string>(SNP_REFERENCE.map((item) => item.rsid));

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
					fileSize,
					mimeType,
					sourceLineCount,
					validGenotypeCount,
					extractedRecordCount: records.length,
					rawFileUploaded: false,

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

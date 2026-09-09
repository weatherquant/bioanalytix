import { auth } from "@repo/auth/auth";
import { db } from "@repo/database";
import { NextResponse } from "next/server";

type ProcessingMetadata = {
	relevantSnps?: Record<string, string>;
	insights?: Array<{
		model?: {
			id?: string;
		};
		result?: {
			direction?: string;
		};
	}>;
	planningExposures?: unknown[];
};

type PlanningProfileGeneticHighlight = {
	id: string;

	title: string;

	domain: string;

	direction: "higher" | "reference" | "lower" | "indeterminate";

	evidenceStrength: "established" | "strong" | "moderate" | "limited" | "insufficient";

	category:
		| "health_risk"
		| "carrier"
		| "protective"
		| "trait"
		| "pharmacogenomic"
		| "nutrition_metabolism"
		| "ageing_longevity";

	summary: string;

	explanation: string;

	planningRelevance: {
		level: "informational" | "potential" | "material";

		label: string;

		meaning: string;

		whyItMatters: string;

		planningDomains: string[];

		suggestedQuestion?: string;

		scenarioEligible: boolean;
	};

	model: {
		id: string;
		version: string;
	};

	limitations: string[];

	provenance: {
		evidenceIds: string[];
		engineVersion: string;
		generatedAt: string;
	};
};

type PlanningProfilePayload = {
	geneticHighlights?: PlanningProfileGeneticHighlight[];
};

export async function GET(req: Request) {
	const session = await auth.api.getSession({
		headers: req.headers,
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const household = await db.bioHousehold.findFirst({
		where: {
			ownerUserId: session.user.id,
		},
		orderBy: {
			createdAt: "asc",
		},
	});

	if (!household) {
		return NextResponse.json({
			data: null,
		});
	}

	const upload = await db.bioGeneticUpload.findFirst({
		where: {
			householdId: household.id,
			status: "READY",
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	if (!upload) {
		return NextResponse.json({
			data: null,
		});
	}

	const planningProfileRecord = await db.bioPlanningProfile.findFirst({
		where: {
			householdId: household.id,
			current: true,
		},
		orderBy: {
			updatedAt: "desc",
		},
	});

	const metadata = (upload.processingMetadata ?? {}) as ProcessingMetadata;

	const planningProfile = (planningProfileRecord?.profile ?? {}) as PlanningProfilePayload;

	const geneticHighlights = planningProfile.geneticHighlights ?? [];

	const insights = metadata.insights ?? [];

	const diseaseRisks = insights
		.filter((insight) => insight.result?.direction === "higher")
		.map((insight) => ({
			disease: insight.model?.id ?? "Genetic association",

			score: 0,

			label: "moderate" as const,

			explanation:
				"An evidence-backed genetic association was identified. This does not establish that the condition is present or will occur.",

			contributingMarkers: [],
		}));

	return NextResponse.json({
		data: {
			longevityScore: 0,

			diseaseRisks,

			traitInsights: [],

			geneticHighlights,

			geneticStrengths: [],

			longevityFactors: [],

			suggestedRetirementAge: null,

			retirementYears: null,

			riskPosture: null,

			snps: metadata.relevantSnps ?? {},

			updatedAt: upload.updatedAt.toISOString(),

			upload: {
				id: upload.id,
				fileName: upload.originalFileName,
				provider: upload.provider,
				status: upload.status,
				parserVersion: upload.parserVersion,
				pipelineVersion: upload.pipelineVersion,
			},
		},
	});
}

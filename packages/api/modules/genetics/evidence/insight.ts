import type { EvidenceClass, EvidenceStrength, GenomeBuild } from "./types";

export type InsightDirection = "lower" | "reference" | "higher" | "indeterminate";

export type PopulationApplicability =
	| "validated"
	| "partially_validated"
	| "not_validated"
	| "unknown";

export interface BiologicalInsight {
	id: string;

	domain:
		| "cardiovascular"
		| "metabolic"
		| "neurological"
		| "cancer"
		| "thrombosis"
		| "longevity"
		| "pharmacogenomic"
		| "other";

	title: string;

	model: {
		id: string;
		version: string;
		evidenceClass: EvidenceClass;
	};

	result: {
		direction: InsightDirection;

		genotype?: string;
		haplotype?: string;

		relativeEffect?: number;
		absoluteRisk?: number;
		percentile?: number;
	};

	confidence: {
		evidenceStrength: EvidenceStrength;

		genotypeCoverage: number;

		populationApplicability: PopulationApplicability;
	};

	input: {
		genomeBuild: GenomeBuild;

		source: "consumer_raw_data" | "clinical_test" | "unknown";

		confirmationStatus: "unconfirmed" | "confirmed" | "not_applicable";
	};

	limitations: string[];

	provenance: {
		evidenceIds: string[];

		generatedAt: string;

		engineVersion: string;
	};
}

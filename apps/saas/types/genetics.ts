export type GeneticRiskTier = "low" | "average" | "moderate" | "elevated" | "high";

export type GeneticEvidenceLevel = "limited" | "emerging" | "moderate" | "strong";

export interface ContributingMarker {
	gene: string;
	rsid: string;
	trait: string;
	category: string;
	subcategory?: string;

	effectSize?: number;
	effectDirection?: "increased" | "decreased";

	description?: string;
	riskAlleles?: string[];
}

export interface DiseaseRisk {
	disease: string;
	score: number;

	label: "low" | "average" | "moderate" | "elevated" | "high";

	explanation: string;

	contributingMarkers: ContributingMarker[];
}

export interface TraitMarker {
	snp: ContributingMarker;
	userGenotype: string;
	interpretation: string;
}

export interface TraitInsight {
	trait: string;
	summary: string;
	markers: TraitMarker[];
}

export interface GeneticStrength {
	id?: string;
	name: string;
	score?: number;
	description?: string;
}

export interface LongevityFactor {
	id?: string;
	name: string;
	impact?: number;

	direction?: "positive" | "negative" | "neutral";

	description?: string;
}

export type GeneticHighlightDirection = "higher" | "reference" | "lower" | "indeterminate";

export type GeneticHighlightCategory =
	| "health_risk"
	| "carrier"
	| "protective"
	| "trait"
	| "pharmacogenomic"
	| "nutrition_metabolism"
	| "ageing_longevity";

export type GeneticPlanningRelevanceLevel = "informational" | "potential" | "material";

export interface GeneticPlanningRelevance {
	level: GeneticPlanningRelevanceLevel;

	label: string;

	meaning: string;

	whyItMatters: string;

	planningDomains: string[];

	suggestedQuestion?: string;

	scenarioEligible: boolean;
}

export interface GeneticHighlight {
	id: string;

	title: string;

	domain: string;

	direction: GeneticHighlightDirection;

	evidenceStrength: "established" | "strong" | "moderate" | "limited" | "insufficient";

	category: GeneticHighlightCategory;

	summary: string;

	explanation: string;

	planningRelevance: GeneticPlanningRelevance;

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
}

export interface GeneticProfile {
	/**
	 * Experimental genetic longevity signal.
	 *
	 * Internal representation is 0–1.
	 * This is NOT a life-expectancy estimate.
	 */
	longevityScore: number;

	diseaseRisks: DiseaseRisk[];
	traitInsights: TraitInsight[];

	/**
	 * Evidence-backed genetic findings generated from
	 * the current Bioanalytix planning profile.
	 */
	geneticHighlights: GeneticHighlight[];
	geneticStrengths: GeneticStrength[];
	longevityFactors: LongevityFactor[];

	/**
	 * Legacy prototype fields.
	 *
	 * Retained temporarily for backwards compatibility.
	 * Bioanalytix v2 should not use these fields
	 * as genetic-based financial advice.
	 */
	suggestedRetirementAge?: number | null;
	retirementYears?: number | null;

	riskPosture?: "capital_preservation" | "balanced" | "growth" | null;

	/**
	 * Relevant parsed SNP observations retained
	 * from the uploaded genotype file.
	 */
	snps?: Record<string, string>;

	updatedAt?: string | null;

	upload?: {
		id: string;
		fileName: string;
		provider?: string | null;
		status: string;
		parserVersion?: string | null;
		pipelineVersion?: string | null;
	};
}

export type GeneticHighlightDirection = "higher" | "reference" | "lower" | "indeterminate";

export type GeneticHighlightEvidenceStrength =
	| "established"
	| "strong"
	| "moderate"
	| "limited"
	| "insufficient";

export type GeneticHighlightCategory =
	| "health_risk"
	| "carrier"
	| "protective"
	| "trait"
	| "pharmacogenomic"
	| "nutrition_metabolism"
	| "ageing_longevity";

export type GeneticPlanningRelevanceLevel = "informational" | "potential" | "material";

export type GeneticPlanningDomain =
	| "health_costs"
	| "care_dependency"
	| "healthy_working_life"
	| "premature_mortality"
	| "longevity"
	| "income_interruption"
	| "insurance"
	| "estate"
	| "family";

export interface GeneticPlanningRelevance {
	/**
	 * Internal classification.
	 *
	 * "material" should generally only be assigned once
	 * household context has also been assessed.
	 */
	level: GeneticPlanningRelevanceLevel;

	/**
	 * User-facing label.
	 *
	 * Examples:
	 * - "For your awareness"
	 * - "Worth considering"
	 * - "Important to your planning"
	 */
	label: string;

	/**
	 * Plain-English explanation of what the classification means.
	 */
	meaning: string;

	/**
	 * The Bioanalytix "so what?"
	 *
	 * This should explain why the finding may or may not matter
	 * to the user's financial, insurance or estate planning.
	 */
	whyItMatters: string;

	/**
	 * Areas that may warrant further consideration.
	 *
	 * These do not imply that the user's plan should change.
	 */
	planningDomains: GeneticPlanningDomain[];

	/**
	 * Optional question the user may choose to explore.
	 */
	suggestedQuestion?: string;

	/**
	 * True only when it is reasonable to offer a financial
	 * scenario for the user to explore.
	 */
	scenarioEligible: boolean;
}

export interface GeneticHighlight {
	id: string;

	title: string;

	domain: string;

	direction: GeneticHighlightDirection;

	evidenceStrength: GeneticHighlightEvidenceStrength;

	category: GeneticHighlightCategory;

	/**
	 * Short consumer-facing interpretation.
	 *
	 * This is informational genetics, not diagnosis,
	 * prognosis or financial advice.
	 */
	summary: string;

	/**
	 * Additional context about what the result means.
	 */
	explanation: string;

	/**
	 * Explicit connection between the genetic finding and
	 * financial / insurance / estate planning.
	 */
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

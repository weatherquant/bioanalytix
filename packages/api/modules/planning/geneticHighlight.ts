export type GeneticHighlightDirection = "higher" | "reference" | "lower" | "indeterminate";

export type GeneticHighlightEvidenceStrength =
	| "established"
	| "strong"
	| "moderate"
	| "limited"
	| "insufficient";

export interface GeneticHighlight {
	id: string;

	title: string;

	domain: string;

	direction: GeneticHighlightDirection;

	evidenceStrength: GeneticHighlightEvidenceStrength;

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

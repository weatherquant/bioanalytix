/**
 * A genetics-informed financial planning insight.
 *
 * PlanningInsight is deliberately NOT a financial recommendation.
 *
 * Genetic evidence may change which financial questions are worth exploring,
 * but it must not directly change a household's financial assumptions,
 * strategy or saved plan.
 */

export type PlanningInsightDomain =
	| "late_life_care"
	| "health_costs"
	| "longevity"
	| "insurance"
	| "estate";

export type PlanningInsightSignificance = "low" | "moderate" | "high";

export type PlanningInsightEvidenceStrength = "limited" | "emerging" | "moderate" | "strong";

export type PlanningInsightDirection = "higher" | "lower" | "neutral";

export interface PlanningInsightEvidence {
	/**
	 * Genetics evidence models contributing to this insight.
	 *
	 * These IDs provide provenance back to the genetics evidence layer.
	 */
	modelIds: string[];

	/**
	 * Strength of the underlying evidence.
	 *
	 * This describes evidence quality, NOT the magnitude of financial impact.
	 */
	strength: PlanningInsightEvidenceStrength;

	direction?: PlanningInsightDirection;

	/**
	 * Optional quantitative measures.
	 *
	 * These must only be populated where the underlying evidence model
	 * legitimately supports them. They must never be inferred merely from
	 * a genotype or qualitative risk direction.
	 */
	relativeRisk?: number;
	absoluteProbability?: number;

	explanation: string;
}

export interface PlanningInsightFinancialRange {
	low: number;
	central: number;
	high: number;

	currency: string;
}

export interface PlanningInsightFinancialImpact {
	significance: PlanningInsightSignificance;

	/**
	 * Areas of the household plan that may be worth exploring.
	 *
	 * These are planning areas, not recommended actions.
	 */
	affectedPlanAreas: string[];

	/**
	 * Optional illustrative financial range.
	 *
	 * Any values here must come from explicit financial assumptions or
	 * financial modelling. They must NOT be derived directly from a genotype.
	 */
	estimatedRange?: PlanningInsightFinancialRange;

	explanation: string;
}

export interface PlanningInsightExploration {
	id: string;
	label: string;
	description: string;
}

export interface PlanningInsightProvenance {
	/**
	 * Version of the planning-insight logic that generated the result.
	 */
	insightVersion: string;

	/**
	 * Evidence model IDs used when generating the insight.
	 */
	modelIds: string[];

	geneticUploadId?: string;

	generatedAt: string;
}

export interface PlanningInsight {
	id: string;

	domain: PlanningInsightDomain;

	title: string;

	/**
	 * Short user-facing explanation of why this deserves attention.
	 */
	summary: string;

	evidence: PlanningInsightEvidence;

	financialImpact: PlanningInsightFinancialImpact;

	/**
	 * Things the user may choose to investigate.
	 *
	 * These should not contain prescriptive financial recommendations.
	 */
	explorations: PlanningInsightExploration[];

	provenance: PlanningInsightProvenance;
}

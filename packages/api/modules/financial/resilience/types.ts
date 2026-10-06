import type { ScenarioResult } from "../scenarios/types";

export const RESILIENCE_LEVELS = ["resilient", "strained", "unfunded"] as const;

export type ResilienceLevel = (typeof RESILIENCE_LEVELS)[number];

export interface ResilienceThresholds {
	/**
	 * Minimum proportion of gross scenario cost that
	 * should remain covered without creating additional
	 * unfunded need for the household to be classified
	 * as resilient.
	 *
	 * Example:
	 * 0.8 means at least 80% of scenario cost is absorbed.
	 */
	resilientAbsorptionRatio: number;
}

export const DEFAULT_RESILIENCE_THRESHOLDS: ResilienceThresholds = {
	resilientAbsorptionRatio: 0.8,
};

export interface ResilienceAssessment {
	scenarioId: string;

	scenarioName: string;

	level: ResilienceLevel;

	/**
	 * Total financial demand introduced by the scenario.
	 */
	grossScenarioCost: number;

	/**
	 * Explicit insurance or other support included in
	 * the scenario.
	 */
	scenarioSupport: number;

	/**
	 * Additional unmet financial need created by the
	 * scenario across the projection.
	 */
	additionalUnfundedNeed: number;

	/**
	 * Existing baseline unmet need reduced by scenario
	 * support.
	 */
	reducedBaselineUnfundedNeed: number;

	/**
	 * Gross scenario cost that did not become additional
	 * unfunded need.
	 *
	 * This is a resilience measure, not a claim that
	 * every dollar was funded from a particular asset.
	 */
	absorbedScenarioCost: number;

	/**
	 * absorbedScenarioCost / grossScenarioCost.
	 *
	 * Returns 1 when there is no scenario cost.
	 */
	absorptionRatio: number;

	/**
	 * Lowest stressed liquid wealth observed during the
	 * projection.
	 */
	minimumStressedLiquidWealth: number;

	/**
	 * Liquid wealth remaining at the end of the
	 * projection.
	 */
	endingStressedLiquidWealth: number;

	/**
	 * Difference between stressed and baseline ending
	 * liquid wealth.
	 */
	endingLiquidWealthImpact: number;

	/**
	 * Difference between stressed and baseline ending
	 * net worth.
	 */
	endingNetWorthImpact: number;

	/**
	 * First date on which the scenario creates
	 * additional unmet financial need.
	 */
	firstAdditionalUnfundedDate?: string;

	/**
	 * Human-readable reasons supporting the
	 * classification.
	 *
	 * These are financial planning statements only.
	 */
	reasons: string[];
}

export interface ResilienceAssessmentInput {
	scenarioResult: ScenarioResult;

	thresholds?: ResilienceThresholds;
}

export class ResilienceAssessmentError extends Error {
	readonly reasons: string[];

	constructor(message: string, reasons: string[]) {
		super(message);

		this.name = "ResilienceAssessmentError";

		this.reasons = reasons;
	}
}

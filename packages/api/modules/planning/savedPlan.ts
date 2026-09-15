import type { PlanningArea } from "./planningSummary";
import type { PlanningExposureDomain, PlanningSignificance } from "./types";

export const SAVED_PLAN_VERSION = "1.0.0";

export type PlanningQuestionSource =
	| "genetic_profile"
	| "household"
	| "estate"
	| "insurance"
	| "longevity"
	| "user";

export interface SavedPlanningQuestion {
	id: string;

	source: PlanningQuestionSource;

	domain: PlanningExposureDomain;

	title: string;

	question: string;

	rationale: string;

	significance: PlanningSignificance;

	selected: boolean;

	sourceInsightIds?: string[];
}

export interface PlanScenarioAssumptions {
	incomeInterruptionMonths?: number;

	essentialSpendingIncreasePercent?: number;

	additionalAnnualHealthCosts?: number;
	healthCostDurationYears?: number;

	additionalAnnualCareCosts?: number;
	careCostDurationYears?: number;

	retirementYearsExtension?: number;

	retirementAgeToTest?: number;

	earlierDeathAge?: number;

	insuranceShortfall?: number;
}

export type PlanningReviewStatus = "to_review" | "reviewed";

export interface SavedPlanningAreaReview {
	area: PlanningArea;

	status: PlanningReviewStatus;

	reviewedAt?: string;
}

export interface SavedBioanalytixPlanV1 {
	version: typeof SAVED_PLAN_VERSION;

	/**
	 * Planning-profile version from which this plan was
	 * most recently refreshed.
	 */
	planningProfileId?: string;

	questions: SavedPlanningQuestion[];

	areaReviews?: SavedPlanningAreaReview[];

	assumptions: PlanScenarioAssumptions;

	priorities: string[];

	notes: string;

	lastSavedAt?: string;
}

export function emptySavedPlan(): SavedBioanalytixPlanV1 {
	return {
		version: SAVED_PLAN_VERSION,

		questions: [],

		areaReviews: [],

		assumptions: {},

		priorities: [],

		notes: "",
	};
}

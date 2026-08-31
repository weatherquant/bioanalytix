export type PlanningExposureDomain =
	| "healthy_working_life"
	| "health_costs"
	| "care_dependency"
	| "premature_mortality"
	| "longevity"
	| "income_interruption"
	| "estate"
	| "partner_dependency";

export type PlanningSignificance = "low" | "moderate" | "high";

export type PlanningExposureBasis =
	| "biological_insight"
	| "baseline_resilience"
	| "user_context"
	| "scenario_assumption";

export interface PlanningExposure {
	domain: PlanningExposureDomain;

	significance: PlanningSignificance;

	basis: PlanningExposureBasis;

	rationale: string;

	sourceInsightIds: string[];
}

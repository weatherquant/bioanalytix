import type { PopulationApplicability } from "../genetics/evidence/insight";
import type { EvidenceStrength } from "../genetics/evidence/types";
import type { ConfirmationStatus, GenotypeSource } from "../genetics/observations/types";

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

export interface PlanningExposureUncertainty {
	/**
	 * Scientific evidence strength supporting the
	 * source insight where the exposure originates
	 * from biological evidence.
	 */
	evidenceStrength?: EvidenceStrength;

	/**
	 * Applicability of the underlying evidence to the
	 * relevant population.
	 */
	populationApplicability?: PopulationApplicability;

	/**
	 * Whether the underlying biological input has been
	 * clinically confirmed.
	 *
	 * This is retained so downstream presentation can
	 * preserve uncertainty. It must not be interpreted
	 * as permission for medical action.
	 */
	confirmationStatus?: ConfirmationStatus;

	/**
	 * Source category of the underlying biological
	 * observation.
	 *
	 * No genotype, rsID, allele or haplotype is carried
	 * across the planning boundary.
	 */
	sourceType?: GenotypeSource;
}

export interface PlanningExposureConstraints {
	/**
	 * A planning exposure must never be interpreted as
	 * a diagnosis or expected clinical outcome.
	 */
	diagnosticInferencePermitted: false;

	/**
	 * The financial layer must not derive a personal
	 * absolute disease probability from this exposure.
	 */
	absoluteRiskConversionPermitted: false;

	/**
	 * The exposure must not directly modify survival or
	 * longevity assumptions.
	 */
	directLongevityAdjustmentPermitted: false;

	/**
	 * The exposure must not directly or deterministically
	 * modify a financial-plan parameter.
	 *
	 * It may activate or inform a resilience scenario.
	 */
	deterministicFinancialAdjustmentPermitted: false;
}

export interface PlanningExposure {
	/**
	 * Stable planning-domain identifier.
	 *
	 * This is deliberately independent of any genetic
	 * model identifier.
	 */
	id: string;

	domain: PlanningExposureDomain;

	significance: PlanningSignificance;

	basis: PlanningExposureBasis;

	/**
	 * Financial-planning rationale for considering the
	 * exposure.
	 *
	 * This must describe scenario relevance rather than
	 * predict that a biological event will occur.
	 */
	rationale: string;

	/**
	 * Qualifications inherited from planning
	 * eligibility and relevant to downstream
	 * presentation or scenario interpretation.
	 */
	qualifications: string[];

	/**
	 * Scientific uncertainty that must remain visible
	 * when the exposure originates from biological
	 * evidence.
	 *
	 * The financial engine must not reinterpret these
	 * fields as disease probabilities.
	 */
	uncertainty?: PlanningExposureUncertainty;

	/**
	 * Explicit semantic restrictions governing how
	 * downstream financial engines may use the
	 * exposure.
	 */
	constraints: PlanningExposureConstraints;
}

export const PLANNING_EXPOSURE_CONSTRAINTS: PlanningExposureConstraints = {
	diagnosticInferencePermitted: false,

	absoluteRiskConversionPermitted: false,

	directLongevityAdjustmentPermitted: false,

	deterministicFinancialAdjustmentPermitted: false,
};

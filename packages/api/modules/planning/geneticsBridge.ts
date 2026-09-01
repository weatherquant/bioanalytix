import type { BiologicalInsight } from "../genetics/evidence/insight";
import { assessPlanningEligibility, type PlanningGovernanceContext } from "./planningEligibility";
import {
	PLANNING_EXPOSURE_CONSTRAINTS,
	type PlanningExposure,
	type PlanningExposureDomain,
	type PlanningSignificance,
} from "./types";

interface ExposureDefinition {
	id: string;

	domain: PlanningExposureDomain;

	significance: PlanningSignificance;

	rationale: string;
}

function isHigher(insight: BiologicalInsight): boolean {
	return insight.result.direction === "higher";
}

/**
 * Planning eligibility operates inside the genetics /
 * governance boundary and may contain model-specific
 * identifiers.
 *
 * PlanningExposure is the finance-facing boundary.
 * Internal model identifiers must therefore not pass
 * through in free-text qualifications.
 */
function planningQualificationsForExposure(
	insight: BiologicalInsight,
	qualifications: string[],
): string[] {
	const modelId = insight.model.id.toLowerCase();

	return qualifications.map((qualification) => {
		const normalized = qualification.toLowerCase();

		if (normalized.includes(modelId) && normalized.includes("scientific approval")) {
			return "The underlying biological model has not yet completed scientific approval and is being exercised in development only.";
		}

		if (normalized.includes(modelId) && normalized.includes("production release")) {
			return "The underlying biological model has not yet been approved for production release.";
		}

		/**
		 * Any remaining model identifier is removed
		 * defensively rather than exposed across the
		 * planning boundary.
		 */
		return qualification.replace(
			new RegExp(escapeRegExp(insight.model.id), "gi"),
			"the underlying biological model",
		);
	});
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createBiologicalExposure(
	insight: BiologicalInsight,
	definition: ExposureDefinition,
	qualifications: string[],
): PlanningExposure {
	return {
		id: definition.id,

		domain: definition.domain,

		significance: definition.significance,

		basis: "biological_insight",

		rationale: definition.rationale,

		qualifications: planningQualificationsForExposure(insight, qualifications),

		uncertainty: {
			evidenceStrength: insight.confidence.evidenceStrength,

			populationApplicability: insight.confidence.populationApplicability,

			confirmationStatus: insight.input.confirmationStatus,

			sourceType: insight.input.source,
		},

		constraints: {
			...PLANNING_EXPOSURE_CONSTRAINTS,
		},
	};
}

/**
 * Translate an eligible BiologicalInsight into
 * financial-resilience planning exposures.
 *
 * This function is the genetics-to-planning boundary.
 *
 * Genotype, rsID, haplotype, model identifiers,
 * absolute-risk values and other model-specific
 * biological details deliberately do not cross this
 * boundary.
 *
 * Development is the default only so scientific and
 * engineering validation can exercise models that have
 * not yet completed production-release governance.
 *
 * User-facing production callers must explicitly pass
 * "production".
 */
export function biologicalInsightToPlanningExposures(
	insight: BiologicalInsight,
	context: PlanningGovernanceContext = "development",
): PlanningExposure[] {
	const eligibility = assessPlanningEligibility(insight, context);

	/**
	 * Planning eligibility is fail-closed.
	 *
	 * An insight may remain scientifically displayable
	 * even when it is not permitted to create a
	 * genotype-attributed financial planning exposure.
	 */
	if (!eligibility.eligible) {
		return [];
	}

	switch (insight.id) {
		case "factor-v-leiden-vte":
			return factorVLeidenPlanningExposures(insight, eligibility.qualifications);

		case "apoe-alzheimer-susceptibility":
			return apoePlanningExposures(insight, eligibility.qualifications);

		default:
			return [];
	}
}

function factorVLeidenPlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	if (!isHigher(insight)) {
		return [];
	}

	return [
		createBiologicalExposure(
			insight,
			{
				id: "healthy-working-life-resilience",

				domain: "healthy_working_life",

				significance: "moderate",

				rationale:
					"A health event associated with this biological risk signal could interrupt employment or reduce healthy working capacity. The exposure supports resilience stress-testing and does not predict that an event will occur.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "health-cost-resilience",

				domain: "health_costs",

				significance: "moderate",

				rationale:
					"A health event associated with this biological risk signal could create healthcare, recovery or household costs. The exposure supports scenario planning rather than estimating personal medical expenditure.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "premature-mortality-resilience",

				domain: "premature_mortality",

				significance: "moderate",

				rationale:
					"A severe health event could have mortality consequences. This exposure supports household resilience stress-testing and is not a mortality forecast.",
			},
			qualifications,
		),
	];
}

function apoePlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	/**
	 * Reference and indeterminate results do not create
	 * genotype-attributed planning exposures.
	 *
	 * Baseline cognitive-decline and care-dependency
	 * resilience remain relevant independently of the
	 * genetic result.
	 */
	if (!isHigher(insight)) {
		return [];
	}

	return [
		createBiologicalExposure(
			insight,
			{
				id: "care-dependency-resilience",

				domain: "care_dependency",

				significance: "high",

				rationale:
					"A later-life care-dependency event could materially increase household care requirements and financial needs. This exposure supports resilience stress-testing and does not predict that cognitive impairment will occur.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "healthy-working-life-resilience",

				domain: "healthy_working_life",

				significance: "moderate",

				rationale:
					"A health event occurring before planned retirement could shorten healthy working life. This exposure supports resilience stress-testing rather than predicting such an event.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "estate-resilience",

				domain: "estate",

				significance: "moderate",

				rationale:
					"A future incapacity scenario can make estate, decision-making and financial-authority resilience relevant. The exposure does not predict that incapacity will occur.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "partner-dependency-resilience",

				domain: "partner_dependency",

				significance: "moderate",

				rationale:
					"A long-term care or incapacity scenario could create additional care and financial responsibilities for a partner or household. The exposure represents scenario relevance rather than an expected outcome.",
			},
			qualifications,
		),
	];
}

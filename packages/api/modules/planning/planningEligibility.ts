import type { BiologicalInsight } from "../genetics/evidence/insight";
import { getModelPolicy, type ModelGovernance } from "../genetics/evidence/modelPolicy";

export interface PlanningEligibilityAssessment {
	/**
	 * Whether this particular biological insight may
	 * contribute to genotype-attributed financial
	 * resilience scenarios.
	 */
	eligible: boolean;

	/**
	 * Hard reasons why planning use is not permitted.
	 */
	reasons: string[];

	/**
	 * Qualifications that must remain conceptually
	 * attached to the planning use but do not, by
	 * themselves, prohibit it.
	 */
	qualifications: string[];
}

function assessPolicy(
	policy: ModelGovernance | undefined,
	insight: BiologicalInsight,
): PlanningEligibilityAssessment {
	const reasons: string[] = [];
	const qualifications: string[] = [];

	if (!policy) {
		return {
			eligible: false,
			reasons: [`No governance policy exists for model ${insight.model.id}.`],
			qualifications,
		};
	}

	if (!policy.permissions.generatePlanningExposures) {
		reasons.push(`Model ${insight.model.id} is not permitted to generate planning exposures.`);
	}

	if (policy.status !== "approved") {
		reasons.push(`Model ${insight.model.id} is not approved for planning use.`);
	}

	if (insight.result.direction === "indeterminate") {
		reasons.push(
			"The biological result is indeterminate and cannot support a genotype-attributed planning exposure.",
		);
	}

	/**
	 * A reference finding is analytically meaningful,
	 * but it does not justify attributing a planning
	 * exposure to this genetic finding.
	 *
	 * Baseline population risks remain relevant and
	 * should be modelled independently elsewhere.
	 */
	if (insight.result.direction === "reference") {
		reasons.push(
			"A reference genetic finding does not justify a genotype-attributed planning exposure.",
		);
	}

	/**
	 * Unconfirmed consumer data does not automatically
	 * prevent financial resilience planning.
	 *
	 * It does prevent Bioanalytix from treating the
	 * result as clinically established.
	 */
	if (insight.input.confirmationStatus !== "confirmed") {
		qualifications.push(
			"The genetic result is unconfirmed and must be treated as a risk signal for scenario planning rather than as a clinically established finding.",
		);
	}

	if (insight.input.source === "consumer_raw_data") {
		qualifications.push(
			"Consumer raw genotype data is being used only to inform financial resilience scenarios and not for diagnosis or medical decision-making.",
		);
	}

	if (!policy.permissions.calculateAbsoluteRisk) {
		qualifications.push(
			"This model is not permitted to convert the genetic finding into a personal absolute disease probability.",
		);
	}

	if (!policy.permissions.modifyFinancialParameters) {
		qualifications.push(
			"The genetic finding must not directly or deterministically alter financial-plan parameters.",
		);
	}

	if (!policy.permissions.useInLongevityModel) {
		qualifications.push(
			"The genetic finding must not directly alter survival or longevity assumptions.",
		);
	}

	return {
		eligible: reasons.length === 0,
		reasons,
		qualifications,
	};
}

/**
 * Assess whether a BiologicalInsight may contribute
 * to genotype-attributed financial resilience
 * scenarios.
 *
 * This assessment deliberately distinguishes:
 *
 * - biological evidence from expected disease;
 * - planning relevance from clinical actionability;
 * - a risk signal from a deterministic financial
 *   assumption.
 */
export function assessPlanningEligibility(
	insight: BiologicalInsight,
): PlanningEligibilityAssessment {
	const policy = getModelPolicy(insight.model.id);

	return assessPolicy(policy, insight);
}

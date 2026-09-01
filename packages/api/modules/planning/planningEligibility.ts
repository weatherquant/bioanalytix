import type { BiologicalInsight } from "../genetics/evidence/insight";
import { getModelPolicy, type ModelGovernance } from "../genetics/evidence/modelPolicy";

export type PlanningGovernanceContext = "development" | "production";

export interface PlanningEligibilityAssessment {
	/**
	 * Whether this particular biological insight may
	 * contribute to genotype-attributed financial
	 * resilience scenarios in the requested governance
	 * context.
	 */
	eligible: boolean;

	/**
	 * Hard reasons why planning use is not permitted.
	 */
	reasons: string[];

	/**
	 * Qualifications that remain attached to the
	 * planning use but do not, by themselves, prohibit
	 * scenario planning.
	 */
	qualifications: string[];
}

function assessLifecycle(
	policy: ModelGovernance,
	context: PlanningGovernanceContext,
	reasons: string[],
	qualifications: string[],
): void {
	if (policy.lifecycle.implementation === "retired") {
		reasons.push(`Model ${policy.modelId} is retired and cannot generate planning exposures.`);

		return;
	}

	/**
	 * Development execution and production release
	 * deliberately have different thresholds.
	 *
	 * Development:
	 * - implemented models may exercise the planning
	 *   pipeline when their explicit permissions allow it;
	 * - scientific review may still be pending.
	 *
	 * Production:
	 * - scientific approval is required;
	 * - production-release approval is also required.
	 */
	if (context === "production") {
		if (policy.review.status !== "approved") {
			reasons.push(
				`Model ${policy.modelId} has not received scientific approval for production planning use.`,
			);
		}

		if (policy.lifecycle.release !== "approved_for_release") {
			reasons.push(`Model ${policy.modelId} is not approved for production release.`);
		}

		return;
	}

	/**
	 * During development we make the pending lifecycle
	 * state visible without blocking validation of the
	 * planning pipeline.
	 */
	if (policy.review.status !== "approved") {
		qualifications.push(
			`Model ${policy.modelId} has not yet completed scientific approval and is being exercised in development only.`,
		);
	}

	if (policy.lifecycle.release !== "approved_for_release") {
		qualifications.push(
			`Model ${policy.modelId} has not yet been approved for production release.`,
		);
	}
}

function assessPolicy(
	policy: ModelGovernance | undefined,
	insight: BiologicalInsight,
	context: PlanningGovernanceContext,
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

	assessLifecycle(policy, context, reasons, qualifications);

	if (insight.result.direction === "indeterminate") {
		reasons.push(
			"The biological result is indeterminate and cannot support a genotype-attributed planning exposure.",
		);
	}

	/**
	 * A reference finding is analytically meaningful,
	 * but it does not justify attributing an additional
	 * planning exposure to this genetic result.
	 *
	 * Baseline population risks remain relevant and
	 * belong in the general resilience model.
	 */
	if (insight.result.direction === "reference") {
		reasons.push(
			"A reference genetic finding does not justify a genotype-attributed planning exposure.",
		);
	}

	/**
	 * Clinical confirmation and financial scenario
	 * planning are deliberately separate thresholds.
	 *
	 * Unconfirmed consumer data may support a qualified
	 * resilience scenario where governance permits it,
	 * but it must not be represented as a clinically
	 * established diagnosis or prognosis.
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
 * The default is deliberately "development" so unit
 * tests and scientific validation can exercise an
 * implemented model before it has completed formal
 * production-release governance.
 *
 * User-facing production code must explicitly request
 * the "production" context.
 */
export function assessPlanningEligibility(
	insight: BiologicalInsight,
	context: PlanningGovernanceContext = "development",
): PlanningEligibilityAssessment {
	const policy = getModelPolicy(insight.model.id);

	return assessPolicy(policy, insight, context);
}

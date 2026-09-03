import type {
	RetirementSafetyNetInput,
	RetirementSafetyNetPolicy,
	RetirementSafetyNetResult,
} from "./retirementSafetyNet";

export interface RetirementSafetyNetAssessmentContext {
	projectionDate: string;

	primaryAge: number;

	cashAssets: number;

	nonSuperInvestableWealth: number;

	superannuation: number;

	liabilities: number;

	afterTaxIncomeBeforeSafetyNet: number;
}

export interface LifecycleRetirementSafetyNet {
	policy: RetirementSafetyNetPolicy;

	/**
	 * Converts lifecycle financial state into the inputs
	 * required by the selected retirement safety-net policy.
	 *
	 * Jurisdiction-specific asset and income treatment belongs
	 * here, not in the lifecycle simulation engine.
	 */
	mapAssessmentInput: (context: RetirementSafetyNetAssessmentContext) => RetirementSafetyNetInput;
}

export interface LifecycleSafetyNetAssessment {
	input: RetirementSafetyNetInput;

	result: RetirementSafetyNetResult;
}

export function assessLifecycleSafetyNet(
	safetyNet: LifecycleRetirementSafetyNet,
	context: RetirementSafetyNetAssessmentContext,
): LifecycleSafetyNetAssessment {
	const input = safetyNet.mapAssessmentInput(context);

	const result = safetyNet.policy.calculate(input);

	if (!Number.isFinite(result.annualIncome) || result.annualIncome < 0) {
		throw new Error("Retirement safety-net policy returned invalid annual income.");
	}

	return {
		input,
		result,
	};
}

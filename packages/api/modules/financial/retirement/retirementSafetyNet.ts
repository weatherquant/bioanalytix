export type RetirementHouseholdType = "single" | "couple";

export interface RetirementSafetyNetInput {
	/**
	 * Date for which the safety-net entitlement is being
	 * assessed.
	 *
	 * Country adapters can use this to select or validate
	 * the relevant policy version.
	 */
	assessmentDate: string;

	age: number;

	householdType: RetirementHouseholdType;

	/**
	 * Assets assessable under the applicable country's
	 * public retirement-income rules.
	 *
	 * The core lifecycle engine does not determine which
	 * assets are assessable. That belongs in a country or
	 * household adapter.
	 */
	assessableAssets: number;

	/**
	 * Financial assets where a country's policy needs to
	 * distinguish them from other assessable assets.
	 */
	financialAssets: number;

	/**
	 * Other annual income assessable under the applicable
	 * public retirement-income rules.
	 */
	otherAssessableAnnualIncome: number;
}

export interface RetirementSafetyNetResult {
	policyId: string;

	countryCode: string;

	annualIncome: number;

	eligible: boolean;

	/**
	 * Human-readable income source.
	 *
	 * Examples:
	 * - Australian Age Pension
	 * - State Pension
	 * - Social Security
	 * - No public retirement safety net
	 */
	source: string;

	qualifications: string[];
}

export interface RetirementSafetyNetPolicy {
	readonly id: string;

	readonly countryCode: string;

	calculate(input: RetirementSafetyNetInput): RetirementSafetyNetResult;
}

/**
 * Generic policy for households where no public retirement
 * safety net should be included in the simulation.
 *
 * This also provides a safe fallback for jurisdictions for
 * which Bioanalytix does not yet have an implemented policy
 * model.
 */
export const NO_RETIREMENT_SAFETY_NET: RetirementSafetyNetPolicy = {
	id: "NO_RETIREMENT_SAFETY_NET",

	countryCode: "NONE",

	calculate(_input: RetirementSafetyNetInput): RetirementSafetyNetResult {
		return {
			policyId: "NO_RETIREMENT_SAFETY_NET",

			countryCode: "NONE",

			annualIncome: 0,

			eligible: false,

			source: "No public retirement safety net",

			qualifications: [
				"No public retirement safety-net income has been included in this simulation.",
			],
		};
	},
};

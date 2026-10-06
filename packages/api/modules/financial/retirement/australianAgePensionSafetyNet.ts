import { calculateAustralianAgePension } from "./australianAgePension";
import { AUSTRALIAN_AGE_PENSION_POLICY_2026_07 } from "./australianAgePensionPolicy";
import type {
	RetirementSafetyNetInput,
	RetirementSafetyNetPolicy,
	RetirementSafetyNetResult,
} from "./retirementSafetyNet";
import type { AgePensionHomeownershipStatus } from "./types";
import { AgePensionCalculationError } from "./types";

export interface AustralianAgePensionSafetyNetConfig {
	homeownershipStatus: AgePensionHomeownershipStatus;

	/**
	 * One where only one member of a couple is eligible,
	 * two where both are eligible.
	 *
	 * Single households must use one.
	 */
	eligibleRecipients: 1 | 2;

	/**
	 * Represents satisfaction of Australian residency and
	 * other non-financial eligibility requirements.
	 */
	residencyEligible: boolean;
}

function isDateWithinPolicyPeriod(date: string): boolean {
	const policy = AUSTRALIAN_AGE_PENSION_POLICY_2026_07;

	return date >= policy.effectiveFrom && date <= policy.effectiveTo;
}

export function createAustralianAgePensionSafetyNet(
	config: AustralianAgePensionSafetyNetConfig,
): RetirementSafetyNetPolicy {
	return {
		id: AUSTRALIAN_AGE_PENSION_POLICY_2026_07.id,

		countryCode: "AU",

		calculate(input: RetirementSafetyNetInput): RetirementSafetyNetResult {
			if (!isDateWithinPolicyPeriod(input.assessmentDate)) {
				throw new AgePensionCalculationError(
					"Australian Age Pension policy is not valid for the requested assessment date.",
					[
						`Assessment date ${input.assessmentDate} falls outside policy period ${AUSTRALIAN_AGE_PENSION_POLICY_2026_07.effectiveFrom} to ${AUSTRALIAN_AGE_PENSION_POLICY_2026_07.effectiveTo}.`,
					],
				);
			}

			const result = calculateAustralianAgePension({
				age: input.age,

				relationshipStatus: input.householdType,

				homeownershipStatus: config.homeownershipStatus,

				eligibleRecipients: config.eligibleRecipients,

				assessableAssets: input.assessableAssets,

				financialAssets: input.financialAssets,

				otherAssessableAnnualIncome: input.otherAssessableAnnualIncome,

				residencyEligible: config.residencyEligible,
			});

			return {
				policyId: result.policyId,

				countryCode: "AU",

				annualIncome: result.annualEntitlement,

				eligible: result.receivesAgePension,

				source: "Australian Age Pension",

				qualifications: result.qualifications,
			};
		},
	};
}

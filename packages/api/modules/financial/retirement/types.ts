export type AgePensionRelationshipStatus = "single" | "couple";

export type AgePensionHomeownershipStatus = "homeowner" | "non_homeowner";

export interface AgePensionAssessmentInput {
	/**
	 * Age at the assessment date.
	 */
	age: number;

	relationshipStatus: AgePensionRelationshipStatus;

	homeownershipStatus: AgePensionHomeownershipStatus;

	/**
	 * Number of people in the couple who are Age Pension
	 * eligible.
	 *
	 * Single households must use 1.
	 *
	 * Couple households may use:
	 * - 1 where only one partner is eligible
	 * - 2 where both partners are eligible
	 */
	eligibleRecipients: 1 | 2;

	/**
	 * Total assessable assets for the relevant Centrelink
	 * household unit.
	 *
	 * IMPORTANT:
	 * The principal residence should already be excluded.
	 *
	 * This module does not attempt to infer Centrelink asset
	 * treatment from the general household balance sheet.
	 */
	assessableAssets: number;

	/**
	 * Financial assets subject to deeming.
	 *
	 * Examples can include cash, bank accounts, shares,
	 * managed investments and relevant superannuation.
	 *
	 * This is deliberately supplied separately from total
	 * assessable assets.
	 */
	financialAssets: number;

	/**
	 * Annual assessable income other than deemed income.
	 *
	 * Examples may include employment income and other
	 * assessable income.
	 *
	 * Work Bonus is NOT applied in v1.
	 */
	otherAssessableAnnualIncome: number;

	/**
	 * Whether residency and other non-financial eligibility
	 * requirements are assumed to be satisfied.
	 *
	 * Bioanalytix should not silently assume residency.
	 */
	residencyEligible: boolean;
}

export interface AgePensionPolicyPeriod {
	id: string;

	effectiveFrom: string;

	effectiveTo: string;

	sourceJurisdiction: "Australia";

	agePensionAge: number;
}

export interface AgePensionTestResult {
	maximumFortnightlyRate: number;

	fortnightlyRateAfterTest: number;

	annualRateAfterTest: number;

	reductionPerFortnight: number;
}

export interface DeemingResult {
	financialAssets: number;

	lowerThreshold: number;

	lowerRate: number;

	upperRate: number;

	annualDeemedIncome: number;

	fortnightlyDeemedIncome: number;
}

export type AgePensionLimitingTest = "age" | "residency" | "income" | "assets" | "maximum_rate";

export interface AgePensionAssessmentResult {
	policyId: string;

	eligibleByAge: boolean;

	eligibleByResidency: boolean;

	maximumFortnightlyRate: number;

	maximumAnnualRate: number;

	deeming: DeemingResult;

	totalAssessableAnnualIncome: number;

	totalAssessableFortnightlyIncome: number;

	incomeTest: AgePensionTestResult;

	assetsTest: AgePensionTestResult;

	fortnightlyEntitlement: number;

	annualEntitlement: number;

	limitingTest: AgePensionLimitingTest;

	/**
	 * True when the model calculates some Age Pension
	 * entitlement.
	 */
	receivesAgePension: boolean;

	/**
	 * These qualifications are intentionally returned with
	 * the calculation so downstream UI cannot lose important
	 * modelling assumptions.
	 */
	qualifications: string[];
}

export class AgePensionCalculationError extends Error {
	constructor(
		message: string,
		public readonly reasons: readonly string[],
	) {
		super(message);

		this.name = "AgePensionCalculationError";
	}
}

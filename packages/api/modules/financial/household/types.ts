export type PersonRole = "primary" | "partner" | "dependant" | "other";

export type EmploymentStatus =
	| "employed"
	| "self_employed"
	| "not_employed"
	| "retired"
	| "student"
	| "other";

export type IncomeType =
	| "employment"
	| "business"
	| "investment"
	| "pension"
	| "government"
	| "other";

export type AssetType = "cash" | "investment" | "property" | "business" | "vehicle" | "other";

export type LiabilityType = "mortgage" | "investment_debt" | "personal_loan" | "credit" | "other";

export type InsuranceType =
	| "life"
	| "total_and_permanent_disability"
	| "income_protection"
	| "trauma"
	| "other";

export type FinancialGoalType =
	| "retirement"
	| "education"
	| "property"
	| "estate"
	| "debt_reduction"
	| "liquidity"
	| "care"
	| "other";

export type GoalPriority = "low" | "medium" | "high";

export interface Person {
	id: string;

	role: PersonRole;

	/**
	 * ISO date in YYYY-MM-DD format.
	 *
	 * Age is derived from dateOfBirth and the relevant
	 * projection date. Age itself is not stored.
	 */
	dateOfBirth: string;

	employmentStatus: EmploymentStatus;

	isFinanciallyDependent?: boolean;
}

export interface IncomeSource {
	id: string;

	/**
	 * Required for employment income.
	 *
	 * Other income may be household-level where there
	 * is no meaningful individual owner for planning.
	 */
	personId?: string;

	type: IncomeType;

	description?: string;

	/**
	 * Current annualised amount as at the household
	 * as-of date.
	 */
	annualAmount: number;

	taxable: boolean;
}

export interface ExpenseProfile {
	/**
	 * Current recurring annual household expenditure.
	 */
	essentialAnnual: number;

	discretionaryAnnual: number;

	/**
	 * Known one-off expenditure expected during the
	 * first projection year.
	 *
	 * It is not treated as recurring expenditure.
	 */
	oneOffAnnual?: number;
}

export interface Asset {
	id: string;

	type: AssetType;

	description?: string;

	value: number;

	/**
	 * Undefined means household-level or currently
	 * unallocated ownership.
	 */
	ownerPersonIds?: string[];

	liquid: boolean;

	investable: boolean;

	incomeProducing: boolean;
}

export interface SuperAccount {
	id: string;

	personId: string;

	balance: number;

	/**
	 * Current recurring contribution arrangement.
	 *
	 * Contribution source and tax treatment are not
	 * inferred here.
	 */
	annualContribution?: number;

	preserved: boolean;
}

export interface Liability {
	id: string;

	type: LiabilityType;

	description?: string;

	balance: number;

	/**
	 * Current contractual or observed rate.
	 */
	annualInterestRate?: number;

	/**
	 * Current recurring annual repayment arrangement.
	 */
	annualRepayment?: number;

	ownerPersonIds?: string[];
}

export interface InsuranceCover {
	id: string;

	personId: string;

	type: InsuranceType;

	sumInsured?: number;

	annualBenefit?: number;

	annualPremium: number;

	/**
	 * Current contractual expiry age where known.
	 */
	endAge?: number;
}

export interface EstatePosition {
	hasWill?: boolean;

	hasEnduringPowerOfAttorney?: boolean;

	hasSuperBeneficiaryNomination?: boolean;
}

export interface FinancialGoal {
	id: string;

	type: FinancialGoalType;

	/**
	 * Optional because some objectives are household
	 * level while others relate to a specific person.
	 */
	personId?: string;

	description?: string;

	targetAmount?: number;

	targetAge?: number;

	priority: GoalPriority;
}

export interface HouseholdFinancialState {
	id: string;

	/**
	 * Date on which this household state is measured.
	 */
	asOfDate: string;

	currency: string;

	country?: string;

	people: Person[];

	income: IncomeSource[];

	expenses: ExpenseProfile;

	assets: Asset[];

	superannuation: SuperAccount[];

	liabilities: Liability[];

	insurance: InsuranceCover[];

	estate: EstatePosition;

	goals: FinancialGoal[];
}

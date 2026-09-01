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

export interface Person {
	id: string;

	role: PersonRole;

	dateOfBirth: string;

	employmentStatus: EmploymentStatus;

	expectedRetirementAge?: number;

	isFinanciallyDependent?: boolean;
}

export interface IncomeSource {
	id: string;

	personId?: string;

	type: IncomeType;

	description?: string;

	annualAmount: number;

	taxable: boolean;

	startAge?: number;

	endAge?: number;
}

export interface ExpenseProfile {
	essentialAnnual: number;

	discretionaryAnnual: number;

	oneOffAnnual?: number;
}

export interface Asset {
	id: string;

	type: AssetType;

	description?: string;

	value: number;

	ownerPersonIds?: string[];

	liquid: boolean;

	investable: boolean;

	incomeProducing: boolean;
}

export interface SuperAccount {
	id: string;

	personId: string;

	balance: number;

	annualContribution?: number;

	preserved: boolean;
}

export interface Liability {
	id: string;

	type: LiabilityType;

	description?: string;

	balance: number;

	annualInterestRate?: number;

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

	endAge?: number;
}

export interface EstatePosition {
	hasWill?: boolean;

	hasEnduringPowerOfAttorney?: boolean;

	hasSuperBeneficiaryNomination?: boolean;

	intendedEstateValue?: number;

	immediateLiquidityTarget?: number;
}

export interface FinancialGoal {
	id: string;

	type: FinancialGoalType;

	description?: string;

	targetAmount?: number;

	targetAge?: number;

	priority?: "low" | "medium" | "high";
}

export interface FinancialAssumptions {
	inflationRate: number;

	wageGrowthRate: number;

	investmentReturnRate: number;

	cashReturnRate: number;

	superReturnRate: number;

	projectionEndAge: number;
}

export interface HouseholdFinancialState {
	id: string;

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

	assumptions: FinancialAssumptions;
}

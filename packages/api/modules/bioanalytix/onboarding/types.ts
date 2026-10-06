import type { EmploymentStatus } from "../../financial/household/types";

export interface BioanalytixSetupInput {
	dateOfBirth: string;

	country: string;

	currency: string;

	employmentStatus: EmploymentStatus;

	hasPartner: boolean;

	hasDependants: boolean;

	annualHouseholdIncome: number;

	cashAndSavings: number;

	investments: number;

	propertyAndOtherAssets: number;

	retirementSavings: number;

	totalDebt: number;

	annualHouseholdSpending: number;

	lifeInsuranceCover: number;

	incomeProtectionAnnualBenefit: number;

	desiredInheritance?: number;

	expectedRetirementAge: number;
}

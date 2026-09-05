import type { HouseholdFinancialState } from "../../financial/household/types";
import { validateHouseholdFinancialState } from "../../financial/household/validation";
import type { BioanalytixSetupInput } from "./setupSchema";

export class BioanalytixSetupError extends Error {
	readonly reasons: string[];

	constructor(message: string, reasons: string[]) {
		super(message);

		this.name = "BioanalytixSetupError";

		this.reasons = reasons;
	}
}

function todayIsoDate(): string {
	return new Date().toISOString().slice(0, 10);
}

export function toHouseholdFinancialState({
	householdId,
	input,
}: {
	householdId: string;
	input: BioanalytixSetupInput;
}): HouseholdFinancialState {
	const primaryPersonId = `${householdId}:primary`;

	const state: HouseholdFinancialState = {
		id: householdId,

		asOfDate: todayIsoDate(),

		currency: input.currency,

		country: input.country,

		people: [
			{
				id: primaryPersonId,
				role: "primary",
				dateOfBirth: input.dateOfBirth,
				employmentStatus: input.employmentStatus,
				isFinanciallyDependent: false,
			},
		],

		income:
			input.annualHouseholdIncome > 0
				? [
						{
							id: `${householdId}:household-income`,
							personId: primaryPersonId,
							type:
								input.employmentStatus === "self_employed"
									? "business"
									: input.employmentStatus === "retired"
										? "pension"
										: "employment",
							description:
								"Approximate household income entered during Bioanalytix setup",
							annualAmount: input.annualHouseholdIncome,
							taxable: true,
						},
					]
				: [],

		expenses: {
			essentialAnnual: input.annualHouseholdSpending,
			discretionaryAnnual: 0,
		},

		assets: [
			...(input.cashAndSavings > 0
				? [
						{
							id: `${householdId}:cash`,
							type: "cash" as const,
							description: "Cash and savings",
							value: input.cashAndSavings,
							liquid: true,
							investable: false,
							incomeProducing: false,
						},
					]
				: []),

			...(input.investments > 0
				? [
						{
							id: `${householdId}:investments`,
							type: "investment" as const,
							description: "Non-retirement investments",
							value: input.investments,
							liquid: true,
							investable: true,
							incomeProducing: true,
						},
					]
				: []),

			...(input.propertyAndOtherAssets > 0
				? [
						{
							id: `${householdId}:property-other`,
							type: "property" as const,
							description: "Property and other assets",
							value: input.propertyAndOtherAssets,
							liquid: false,
							investable: false,
							incomeProducing: false,
						},
					]
				: []),
		],

		superannuation:
			input.retirementSavings > 0
				? [
						{
							id: `${householdId}:retirement`,
							personId: primaryPersonId,
							balance: input.retirementSavings,
							preserved: true,
						},
					]
				: [],

		liabilities:
			input.totalDebt > 0
				? [
						{
							id: `${householdId}:debt`,
							type: "other",
							description: "Approximate total household debt",
							balance: input.totalDebt,
						},
					]
				: [],

		insurance: [
			...(input.lifeInsuranceCover > 0
				? [
						{
							id: `${householdId}:life-cover`,
							personId: primaryPersonId,
							type: "life" as const,
							sumInsured: input.lifeInsuranceCover,
							annualPremium: 0,
						},
					]
				: []),

			...(input.incomeProtectionAnnualBenefit > 0
				? [
						{
							id: `${householdId}:income-protection`,
							personId: primaryPersonId,
							type: "income_protection" as const,
							annualBenefit: input.incomeProtectionAnnualBenefit,
							annualPremium: 0,
						},
					]
				: []),
		],

		estate: {},

		goals: [
			{
				id: `${householdId}:retirement-goal`,
				type: "retirement",
				personId: primaryPersonId,
				targetAge: input.expectedRetirementAge,
				priority: "high",
			},

			...(input.desiredInheritance !== undefined
				? [
						{
							id: `${householdId}:estate-goal`,
							type: "estate" as const,
							targetAmount: input.desiredInheritance,
							priority: "medium" as const,
						},
					]
				: []),
		],
	};

	const validation = validateHouseholdFinancialState(state);

	if (!validation.valid) {
		throw new BioanalytixSetupError(
			"Bioanalytix setup could not create a valid household financial state.",
			validation.errors.map((issue) => `${issue.path}: ${issue.message}`),
		);
	}

	return state;
}

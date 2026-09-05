import { describe, expect, it } from "vitest";

import { BioanalytixSetupError, toHouseholdFinancialState } from "./toHouseholdFinancialState";

const baseInput = {
	dateOfBirth: "1975-04-12",
	country: "AU",
	currency: "AUD",
	employmentStatus: "employed" as const,
	hasPartner: true,
	hasDependants: false,
	annualHouseholdIncome: 160000,
	cashAndSavings: 50000,
	investments: 120000,
	propertyAndOtherAssets: 800000,
	retirementSavings: 350000,
	totalDebt: 300000,
	annualHouseholdSpending: 85000,
	lifeInsuranceCover: 500000,
	incomeProtectionAnnualBenefit: 80000,
	desiredInheritance: 600000,
	expectedRetirementAge: 67,
};

describe("toHouseholdFinancialState", () => {
	it("creates a valid household state from simple Bioanalytix setup inputs", () => {
		const result = toHouseholdFinancialState({
			householdId: "household-1",
			input: baseInput,
		});

		expect(result.id).toBe("household-1");
		expect(result.currency).toBe("AUD");
		expect(result.country).toBe("AU");
		expect(result.people).toHaveLength(1);
		expect(result.people[0]?.role).toBe("primary");
	});

	it("maps approximate financial values into canonical household structures", () => {
		const result = toHouseholdFinancialState({
			householdId: "household-1",
			input: baseInput,
		});

		expect(result.income[0]?.annualAmount).toBe(160000);

		expect(result.assets.reduce((total, asset) => total + asset.value, 0)).toBe(970000);

		expect(result.superannuation[0]?.balance).toBe(350000);

		expect(result.liabilities[0]?.balance).toBe(300000);
	});

	it("creates protection inputs without pretending zero premiums are known premiums", () => {
		const result = toHouseholdFinancialState({
			householdId: "household-1",
			input: baseInput,
		});

		expect(result.insurance.find((item) => item.type === "life")?.sumInsured).toBe(500000);

		expect(
			result.insurance.find((item) => item.type === "income_protection")?.annualBenefit,
		).toBe(80000);
	});

	it("creates retirement and optional inheritance goals", () => {
		const result = toHouseholdFinancialState({
			householdId: "household-1",
			input: baseInput,
		});

		expect(result.goals.find((goal) => goal.type === "retirement")?.targetAge).toBe(67);

		expect(result.goals.find((goal) => goal.type === "estate")?.targetAmount).toBe(600000);
	});

	it("fails closed when setup data cannot produce a valid household state", () => {
		expect(() =>
			toHouseholdFinancialState({
				householdId: "household-1",
				input: {
					...baseInput,
					dateOfBirth: "not-a-date",
				},
			}),
		).toThrow(BioanalytixSetupError);
	});
});

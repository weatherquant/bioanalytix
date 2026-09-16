import { describe, expect, it } from "vitest";

import { toHouseholdFinancialState } from "../../bioanalytix/onboarding/toHouseholdFinancialState";
import type { HouseholdFinancialState } from "../household/types";
import { assessProtectionPosition } from "./protectionAnalysis";

function householdFixture(): HouseholdFinancialState {
	return toHouseholdFinancialState({
		householdId: "household-1",
		input: {
			dateOfBirth: "1975-04-12",
			country: "AU",
			currency: "AUD",
			employmentStatus: "employed",
			hasPartner: false,
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
			expectedRetirementAge: 60,
		},
	});
}

describe("assessProtectionPosition", () => {
	it("summarises the financial exposure associated with a person", () => {
		const household = householdFixture();
		const primary = household.people[0]!;

		const result = assessProtectionPosition(household, primary.id);

		expect(result.annualIncomeAtRisk).toBe(160000);
		expect(result.lifeInsuranceCover).toBe(500000);
		expect(result.incomeProtectionAnnualBenefit).toBe(80000);
		expect(result.totalHouseholdLiabilities).toBe(300000);
		expect(result.liquidAssets).toBe(170000);
		expect(result.financialAssets).toBe(520000);
	});

	it("does not treat absence of insurance as a deficiency when the household has no financial dependency", () => {
		const household = householdFixture();
		const primary = household.people[0]!;

		household.insurance = [];
		household.income = [];
		household.liabilities = [];

		const result = assessProtectionPosition(household, primary.id);

		expect(result.lifeInsuranceCover).toBe(0);
		expect(result.annualIncomeAtRisk).toBe(0);
		expect(result.hasFinancialDependants).toBe(false);
		expect(result.assessment).toBe("strong");
	});

	it("identifies an exposed position when resources and cover do not meet liabilities", () => {
		const household = householdFixture();
		const primary = household.people[0]!;

		household.assets = household.assets.filter((asset) => asset.type === "cash");

		household.superannuation = [];
		household.insurance = [];

		const result = assessProtectionPosition(household, primary.id);

		expect(result.financialAssets).toBe(50000);
		expect(result.totalHouseholdLiabilities).toBe(300000);
		expect(result.assessment).toBe("exposed");
	});

	it("recognises when life cover closes an immediate balance-sheet gap", () => {
		const household = householdFixture();
		const primary = household.people[0]!;

		household.assets = household.assets.filter((asset) => asset.type === "cash");

		household.superannuation = [];

		const result = assessProtectionPosition(household, primary.id);

		expect(result.financialAssets).toBe(50000);
		expect(result.lifeInsuranceCover).toBe(500000);
		expect(result.assessment).toBe("comfortable");
	});

	it("rejects a person who does not belong to the household", () => {
		const household = householdFixture();

		expect(() => assessProtectionPosition(household, "unknown-person")).toThrow(
			'Person "unknown-person" does not exist in the household.',
		);
	});
});

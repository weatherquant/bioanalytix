import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "./types";

describe("HouseholdFinancialState", () => {
	it("represents a household without genetics-specific fields", () => {
		const household: HouseholdFinancialState = {
			id: "household-1",

			asOfDate: "2026-09-01",

			currency: "AUD",

			country: "Australia",

			people: [
				{
					id: "person-1",

					role: "primary",

					dateOfBirth: "1970-01-01",

					employmentStatus: "employed",

					expectedRetirementAge: 65,
				},
			],

			income: [
				{
					id: "income-1",

					personId: "person-1",

					type: "employment",

					annualAmount: 150000,

					taxable: true,
				},
			],

			expenses: {
				essentialAnnual: 60000,

				discretionaryAnnual: 25000,
			},

			assets: [
				{
					id: "asset-1",

					type: "cash",

					value: 100000,

					ownerPersonIds: ["person-1"],

					liquid: true,

					investable: true,

					incomeProducing: false,
				},
			],

			superannuation: [
				{
					id: "super-1",

					personId: "person-1",

					balance: 500000,

					annualContribution: 18000,

					preserved: true,
				},
			],

			liabilities: [
				{
					id: "liability-1",

					type: "mortgage",

					balance: 300000,

					annualInterestRate: 0.06,

					annualRepayment: 30000,

					ownerPersonIds: ["person-1"],
				},
			],

			insurance: [
				{
					id: "insurance-1",

					personId: "person-1",

					type: "life",

					sumInsured: 500000,

					annualPremium: 1800,

					endAge: 65,
				},
			],

			estate: {
				hasWill: true,

				hasEnduringPowerOfAttorney: true,

				hasSuperBeneficiaryNomination: true,

				intendedEstateValue: 750000,

				immediateLiquidityTarget: 50000,
			},

			goals: [
				{
					id: "goal-1",

					type: "retirement",

					targetAge: 65,

					priority: "high",
				},
			],

			assumptions: {
				inflationRate: 0.025,

				wageGrowthRate: 0.03,

				investmentReturnRate: 0.06,

				cashReturnRate: 0.03,

				superReturnRate: 0.06,

				projectionEndAge: 100,
			},
		};

		expect(household.currency).toBe("AUD");

		expect(household.people).toHaveLength(1);

		expect(household.assets[0]?.liquid).toBe(true);

		expect(household.superannuation[0]?.preserved).toBe(true);

		expect(household.assumptions.projectionEndAge).toBe(100);
	});

	it("does not require genetics, longevity scores or assumed death ages", () => {
		const household: HouseholdFinancialState = {
			id: "household-2",

			asOfDate: "2026-09-01",

			currency: "AUD",

			people: [],

			income: [],

			expenses: {
				essentialAnnual: 0,

				discretionaryAnnual: 0,
			},

			assets: [],

			superannuation: [],

			liabilities: [],

			insurance: [],

			estate: {},

			goals: [],

			assumptions: {
				inflationRate: 0.025,

				wageGrowthRate: 0.03,

				investmentReturnRate: 0.06,

				cashReturnRate: 0.03,

				superReturnRate: 0.06,

				projectionEndAge: 100,
			},
		};

		const serialized = JSON.stringify(household).toLowerCase();

		expect(serialized).not.toContain("genetic");

		expect(serialized).not.toContain("longevity_score");

		expect(serialized).not.toContain("assumeddeathage");

		expect(serialized).not.toContain("genotype");

		expect(serialized).not.toContain("rsid");
	});
});

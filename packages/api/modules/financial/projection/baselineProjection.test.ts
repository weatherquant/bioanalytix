import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../household/types";
import { runBaselineProjection } from "./baselineProjection";
import { BaselineProjectionError, type ProjectionAssumptions } from "./types";

function household(): HouseholdFinancialState {
	return {
		id: "household-1",

		asOfDate: "2026-09-01",

		currency: "AUD",

		country: "Australia",

		people: [
			{
				id: "person-1",

				role: "primary",

				dateOfBirth: "1970-09-02",

				employmentStatus: "employed",
			},
		],

		income: [
			{
				id: "income-1",

				personId: "person-1",

				type: "employment",

				annualAmount: 100000,

				taxable: true,
			},
		],

		expenses: {
			essentialAnnual: 40000,

			discretionaryAnnual: 10000,
		},

		assets: [
			{
				id: "cash-1",

				type: "cash",

				value: 100000,

				ownerPersonIds: ["person-1"],

				liquid: true,

				investable: true,

				incomeProducing: false,
			},

			{
				id: "investment-1",

				type: "investment",

				value: 200000,

				ownerPersonIds: ["person-1"],

				liquid: true,

				investable: true,

				incomeProducing: true,
			},
		],

		superannuation: [
			{
				id: "super-1",

				personId: "person-1",

				balance: 300000,

				annualContribution: 10000,

				preserved: true,
			},
		],

		liabilities: [
			{
				id: "mortgage-1",

				type: "mortgage",

				balance: 100000,

				annualInterestRate: 0.05,

				annualRepayment: 20000,

				ownerPersonIds: ["person-1"],
			},
		],

		insurance: [
			{
				id: "life-1",

				personId: "person-1",

				type: "life",

				sumInsured: 500000,

				annualPremium: 1000,

				endAge: 65,
			},
		],

		estate: {},

		goals: [
			{
				id: "retirement-person-1",

				type: "retirement",

				personId: "person-1",

				targetAge: 60,

				priority: "high",
			},
		],
	};
}

function assumptions(overrides: Partial<ProjectionAssumptions> = {}): ProjectionAssumptions {
	return {
		inflationRate: 0,

		wageGrowthRate: 0,

		spendingGrowthRate: 0,

		investmentReturnRate: 0,

		cashReturnRate: 0,

		superReturnRate: 0,

		effectiveTaxRate: 0,

		projectionEndDate: "2031-09-01",

		...overrides,
	};
}

describe("runBaselineProjection", () => {
	it("creates an opening state and one annual state for every year to the calendar horizon", () => {
		const result = runBaselineProjection({
			household: household(),

			assumptions: assumptions(),
		});

		expect(result.years).toHaveLength(6);

		expect(result.years[0]?.projectionDate).toBe("2026-09-01");

		expect(result.years.at(-1)?.projectionDate).toBe("2031-09-01");

		expect(result.years[0]?.primaryAge).toBe(55);

		expect(result.years.at(-1)?.primaryAge).toBe(60);
	});

	it("uses separately supplied assumptions without mutating household state", () => {
		const inputHousehold = household();

		const before = JSON.stringify(inputHousehold);

		const result = runBaselineProjection({
			household: inputHousehold,

			assumptions: assumptions({
				cashReturnRate: 0.02,

				investmentReturnRate: 0.05,
			}),
		});

		expect(result.assumptions.cashReturnRate).toBe(0.02);

		expect(result.assumptions.investmentReturnRate).toBe(0.05);

		expect(JSON.stringify(inputHousehold)).toBe(before);

		expect("assumptions" in inputHousehold).toBe(false);
	});

	it("applies the effective tax assumption only to taxable income", () => {
		const inputHousehold = household();

		inputHousehold.income.push({
			id: "income-2",

			type: "other",

			annualAmount: 10000,

			taxable: false,
		});

		const result = runBaselineProjection({
			household: inputHousehold,

			assumptions: assumptions({
				effectiveTaxRate: 0.25,
			}),
		});

		expect(result.years[1]?.afterTaxIncome).toBe(85000);
	});

	it("uses a person-specific retirement goal to stop employment income", () => {
		const inputHousehold = household();

		inputHousehold.goals[0]!.targetAge = 56;

		const result = runBaselineProjection({
			household: inputHousehold,

			assumptions: assumptions({
				projectionEndDate: "2028-09-01",
			}),
		});

		/**
		 * Year 1 models the period beginning at age
		 * 55, so employment income is still active.
		 */
		expect(result.years[1]?.afterTaxIncome).toBe(100000);

		/**
		 * Year 2 begins at age 56, so the declared
		 * retirement goal has been reached.
		 */
		expect(result.years[2]?.afterTaxIncome).toBe(0);
	});

	it("adds positive household cash flow to cash assets", () => {
		const inputHousehold = household();

		inputHousehold.liabilities = [];

		inputHousehold.insurance = [];

		const result = runBaselineProjection({
			household: inputHousehold,

			assumptions: assumptions({
				projectionEndDate: "2027-09-01",
			}),
		});

		expect(result.years[1]?.netCashFlow).toBe(50000);

		expect(result.years[1]?.cashAssets).toBe(150000);
	});

	it("uses cash then other liquid assets to fund deficits without automatically liquidating illiquid assets", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.expenses = {
			essentialAnnual: 350000,

			discretionaryAnnual: 0,
		};

		inputHousehold.liabilities = [];

		inputHousehold.insurance = [];

		inputHousehold.assets.push({
			id: "property-1",

			type: "property",

			value: 500000,

			liquid: false,

			investable: false,

			incomeProducing: false,
		});

		const result = runBaselineProjection({
			household: inputHousehold,

			assumptions: assumptions({
				projectionEndDate: "2027-09-01",
			}),
		});

		expect(result.years[1]?.liquidWealth).toBe(0);

		expect(result.years[1]?.unfundedCashFlow).toBe(50000);

		expect(result.years[1]?.nonSuperAssets).toBe(500000);

		expect(result.summary.firstUnfundedDate).toBe("2027-09-01");
	});

	it("rolls liabilities forward using interest and actual repayments", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.expenses = {
			essentialAnnual: 0,

			discretionaryAnnual: 0,
		};

		inputHousehold.insurance = [];

		const result = runBaselineProjection({
			household: inputHousehold,

			assumptions: assumptions({
				projectionEndDate: "2027-09-01",
			}),
		});

		expect(result.years[1]?.liabilities).toBe(85000);

		expect(result.years[1]?.debtRepayments).toBe(20000);
	});

	it("grows super and records contributions without automatically deducting them from household cash flow", () => {
		const inputHousehold = household();

		inputHousehold.liabilities = [];

		inputHousehold.insurance = [];

		const result = runBaselineProjection({
			household: inputHousehold,

			assumptions: assumptions({
				superReturnRate: 0.05,

				projectionEndDate: "2027-09-01",
			}),
		});

		expect(result.years[1]?.superannuation).toBe(325000);

		expect(result.years[1]?.superContributions).toBe(10000);

		expect(result.years[1]?.netCashFlow).toBe(50000);
	});

	it("fails closed when the household or projection assumptions are invalid", () => {
		const inputHousehold = household();

		inputHousehold.people[0]!.role = "partner";

		expect(() =>
			runBaselineProjection({
				household: inputHousehold,

				assumptions: assumptions({
					effectiveTaxRate: 1.5,
				}),
			}),
		).toThrow(BaselineProjectionError);

		expect(() =>
			runBaselineProjection({
				household: household(),

				assumptions: assumptions({
					projectionEndDate: "2031-10-01",
				}),
			}),
		).toThrow(BaselineProjectionError);
	});

	it("uses calendar time rather than one person's age as the projection horizon", () => {
		const inputHousehold = household();

		inputHousehold.people.push({
			id: "person-2",

			role: "partner",

			dateOfBirth: "1980-01-01",

			employmentStatus: "employed",
		});

		inputHousehold.income.push({
			id: "partner-income",

			personId: "person-2",

			type: "employment",

			annualAmount: 80000,

			taxable: true,
		});

		inputHousehold.goals.push({
			id: "retirement-person-2",

			type: "retirement",

			personId: "person-2",

			targetAge: 67,

			priority: "high",
		});

		const result = runBaselineProjection({
			household: inputHousehold,

			assumptions: assumptions({
				projectionEndDate: "2031-09-01",
			}),
		});

		expect(result.years.at(-1)?.projectionDate).toBe("2031-09-01");

		expect(result.years.at(-1)?.primaryAge).toBe(60);

		expect(result.years).toHaveLength(6);
	});
});

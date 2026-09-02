import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import { runFinancialScenario } from "./scenarioEngine";
import { ScenarioEngineError, type ScenarioDefinition } from "./types";

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

			{
				id: "person-2",

				role: "partner",

				dateOfBirth: "1975-01-01",

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

			{
				id: "income-2",

				personId: "person-2",

				type: "employment",

				annualAmount: 60000,

				taxable: true,
			},
		],

		expenses: {
			essentialAnnual: 80000,

			discretionaryAnnual: 20000,
		},

		assets: [
			{
				id: "cash-1",

				type: "cash",

				value: 50000,

				liquid: true,

				investable: true,

				incomeProducing: false,
			},
		],

		superannuation: [],

		liabilities: [],

		insurance: [],

		estate: {},

		goals: [
			{
				id: "retirement-person-1",

				type: "retirement",

				personId: "person-1",

				targetAge: 65,

				priority: "high",
			},

			{
				id: "retirement-person-2",

				type: "retirement",

				personId: "person-2",

				targetAge: 65,

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

		cashReturnRate: 0,

		investmentReturnRate: 0,

		superReturnRate: 0,

		effectiveTaxRate: 0,

		projectionEndDate: "2031-09-01",

		...overrides,
	};
}

function scenario(overrides: Partial<ScenarioDefinition> = {}): ScenarioDefinition {
	return {
		id: "scenario-1",

		name: "Temporary income interruption",

		kind: "income_interruption",

		affectedPersonId: "person-1",

		startDate: "2026-09-01",

		durationYears: 2,

		effects: {
			annualIncomeReduction: 30000,
		},

		rationale: "Test household resilience to a temporary reduction in income.",

		...overrides,
	};
}

describe("runFinancialScenario", () => {
	it("applies recurring scenario effects from the declared start date", () => {
		const result = runFinancialScenario({
			household: household(),

			assumptions: assumptions(),

			scenario: scenario(),
		});

		expect(result.years[0]?.scenarioImpact.active).toBe(false);

		expect(result.years[1]?.periodStartDate).toBe("2026-09-01");

		expect(result.years[1]?.scenarioImpact.active).toBe(true);

		expect(result.years[1]?.scenarioImpact.annualIncomeReduction).toBe(30000);

		expect(result.years[1]?.scenarioImpact.grossScenarioCost).toBe(30000);

		expect(result.years[1]?.scenarioImpact.scenarioSupport).toBe(0);

		expect(result.years[1]?.scenarioImpact.netScenarioCashFlow).toBe(-30000);
	});

	it("does not apply the scenario before a future start date", () => {
		const result = runFinancialScenario({
			household: household(),

			assumptions: assumptions(),

			scenario: scenario({
				startDate: "2028-09-01",
			}),
		});

		expect(result.years[1]?.scenarioImpact.active).toBe(false);

		expect(result.years[2]?.scenarioImpact.active).toBe(false);

		expect(result.years[3]?.scenarioImpact.active).toBe(true);

		expect(result.years[3]?.periodStartDate).toBe("2028-09-01");
	});

	it("stops recurring effects when the declared duration expires", () => {
		const result = runFinancialScenario({
			household: household(),

			assumptions: assumptions(),

			scenario: scenario({
				durationYears: 2,
			}),
		});

		expect(result.years[1]?.scenarioImpact.active).toBe(true);

		expect(result.years[2]?.scenarioImpact.active).toBe(true);

		expect(result.years[3]?.scenarioImpact.active).toBe(false);

		expect(result.summary.totalIncomeReduction).toBe(60000);

		expect(result.summary.totalScenarioCost).toBe(60000);
	});

	it("applies one-off effects only in the first active scenario period", () => {
		const result = runFinancialScenario({
			household: household(),

			assumptions: assumptions(),

			scenario: scenario({
				effects: {
					annualAdditionalExpenses: 10000,

					oneOffExpense: 25000,

					oneOffInsuranceProceeds: 15000,
				},
			}),
		});

		expect(result.years[1]?.scenarioImpact.oneOffExpense).toBe(25000);

		expect(result.years[1]?.scenarioImpact.oneOffInsuranceProceeds).toBe(15000);

		expect(result.years[1]?.scenarioImpact.grossScenarioCost).toBe(35000);

		expect(result.years[1]?.scenarioImpact.scenarioSupport).toBe(15000);

		expect(result.years[2]?.scenarioImpact.oneOffExpense).toBe(0);

		expect(result.years[2]?.scenarioImpact.oneOffInsuranceProceeds).toBe(0);
	});

	it("allows explicit insurance support to offset scenario costs", () => {
		const result = runFinancialScenario({
			household: household(),

			assumptions: assumptions(),

			scenario: scenario({
				durationYears: 1,

				effects: {
					annualIncomeReduction: 50000,

					annualInsuranceBenefit: 30000,

					oneOffInsuranceProceeds: 10000,
				},
			}),
		});

		expect(result.years[1]?.scenarioImpact.grossScenarioCost).toBe(50000);

		expect(result.years[1]?.scenarioImpact.scenarioSupport).toBe(40000);

		expect(result.years[1]?.scenarioImpact.netScenarioCashFlow).toBe(-10000);

		expect(result.summary.totalScenarioSupport).toBe(40000);

		expect(result.summary.totalInsuranceSupport).toBe(40000);

		expect(result.summary.totalIncomeReduction).toBe(50000);
	});

	it("depletes liquid wealth before reporting additional unfunded cash flow", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.expenses = {
			essentialAnnual: 0,

			discretionaryAnnual: 0,
		};

		const result = runFinancialScenario({
			household: inputHousehold,

			assumptions: assumptions({
				projectionEndDate: "2027-09-01",
			}),

			scenario: scenario({
				durationYears: 1,

				effects: {
					oneOffExpense: 80000,
				},
			}),
		});

		expect(result.baseline.years[1]?.liquidWealth).toBe(50000);

		expect(result.years[1]?.stressedLiquidWealth).toBe(0);

		expect(result.years[1]?.stressedUnfundedCashFlow).toBe(30000);

		expect(result.years[1]?.additionalUnfundedCashFlow).toBe(30000);

		expect(result.years[1]?.unfundedCashFlowImpact).toBe(30000);

		expect(result.summary.firstAdditionalUnfundedDate).toBe("2027-09-01");
	});

	it("increases stressed liquid wealth and net worth when scenario support exceeds costs", () => {
		const result = runFinancialScenario({
			household: household(),

			assumptions: assumptions({
				projectionEndDate: "2027-09-01",
			}),

			scenario: scenario({
				durationYears: 1,

				effects: {
					oneOffInsuranceProceeds: 40000,
				},
			}),
		});

		expect(result.years[1]?.liquidWealthImpact).toBe(40000);

		expect(result.years[1]?.netWorthImpact).toBe(40000);

		expect(result.summary.endingNetWorthImpact).toBe(40000);
	});

	it("carries scenario-created liquid wealth divergence forward using the cash return assumption", () => {
		const result = runFinancialScenario({
			household: household(),

			assumptions: assumptions({
				cashReturnRate: 0.1,

				projectionEndDate: "2028-09-01",
			}),

			scenario: scenario({
				durationYears: 1,

				effects: {
					oneOffInsuranceProceeds: 10000,
				},
			}),
		});

		expect(result.years[1]?.liquidWealthImpact).toBeCloseTo(10000);

		expect(result.years[2]?.liquidWealthImpact).toBeCloseTo(11000);
	});

	it("uses scenario support to reduce an existing baseline funding gap before creating liquid wealth", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.assets = [];

		inputHousehold.expenses = {
			essentialAnnual: 30000,

			discretionaryAnnual: 0,
		};

		const result = runFinancialScenario({
			household: inputHousehold,

			assumptions: assumptions({
				projectionEndDate: "2027-09-01",
			}),

			scenario: scenario({
				durationYears: 1,

				effects: {
					oneOffInsuranceProceeds: 40000,
				},
			}),
		});

		expect(result.baseline.years[1]?.liquidWealth).toBe(0);

		expect(result.baseline.years[1]?.unfundedCashFlow).toBe(30000);

		expect(result.years[1]?.baselineFundingPosition).toBe(-30000);

		expect(result.years[1]?.stressedFundingPosition).toBe(10000);

		expect(result.years[1]?.stressedUnfundedCashFlow).toBe(0);

		expect(result.years[1]?.stressedLiquidWealth).toBe(10000);

		expect(result.years[1]?.reducedUnfundedCashFlow).toBe(30000);

		expect(result.years[1]?.unfundedCashFlowImpact).toBe(-30000);

		expect(result.years[1]?.netWorthImpact).toBe(10000);
	});

	it("does not carry an unpaid scenario funding gap forward as invented debt", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.assets = [];

		inputHousehold.expenses = {
			essentialAnnual: 0,

			discretionaryAnnual: 0,
		};

		const result = runFinancialScenario({
			household: inputHousehold,

			assumptions: assumptions({
				projectionEndDate: "2028-09-01",
			}),

			scenario: scenario({
				durationYears: 1,

				effects: {
					oneOffExpense: 30000,
				},
			}),
		});

		expect(result.years[1]?.stressedUnfundedCashFlow).toBe(30000);

		expect(result.years[1]?.additionalUnfundedCashFlow).toBe(30000);

		/**
		 * The following year has no continuing
		 * scenario cost and the prior unmet need has
		 * not been silently transformed into debt.
		 */
		expect(result.years[2]?.stressedUnfundedCashFlow).toBe(0);

		expect(result.years[2]?.additionalUnfundedCashFlow).toBe(0);

		expect(result.years[2]?.stressedLiquidWealth).toBe(0);
	});

	it("fails closed for invalid scenario definitions", () => {
		expect(() =>
			runFinancialScenario({
				household: household(),

				assumptions: assumptions(),

				scenario: scenario({
					startDate: "2027-10-01",

					affectedPersonId: "unknown-person",

					durationYears: 0,

					effects: {
						annualIncomeReduction: -1,
					},
				}),
			}),
		).toThrow(ScenarioEngineError);

		expect(() =>
			runFinancialScenario({
				household: household(),

				assumptions: assumptions(),

				scenario: scenario({
					effects: {},
				}),
			}),
		).toThrow(ScenarioEngineError);
	});
});

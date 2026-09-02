import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import { runLifecycleSimulation } from "./lifecycleSimulation";
import { generateMarketPaths } from "./marketModel";
import { summarizeLifecycleSimulations } from "./summarizeLifecycle";
import type { MarketModelAssumptions, PortfolioStrategy } from "./types";

const household: HouseholdFinancialState = {
	id: "household-1",

	asOfDate: "2026-09-01",

	currency: "AUD",

	people: [
		{
			id: "primary",

			role: "primary",

			dateOfBirth: "1970-09-02",

			employmentStatus: "employed",
		},
	],

	income: [
		{
			id: "income",

			personId: "primary",

			type: "employment",

			annualAmount: 100000,

			taxable: true,
		},
	],

	expenses: {
		essentialAnnual: 50000,

		discretionaryAnnual: 20000,
	},

	assets: [
		{
			id: "portfolio",

			type: "investment",

			value: 200000,

			liquid: true,

			investable: true,

			incomeProducing: true,
		},
	],

	superannuation: [
		{
			id: "super",

			personId: "primary",

			balance: 300000,

			annualContribution: 10000,

			preserved: true,
		},
	],

	liabilities: [],

	insurance: [],

	estate: {},

	goals: [],
};

const projectionAssumptions: ProjectionAssumptions = {
	inflationRate: 0.025,

	wageGrowthRate: 0.03,

	spendingGrowthRate: 0.025,

	cashReturnRate: 0.03,

	investmentReturnRate: 0.06,

	superReturnRate: 0.06,

	effectiveTaxRate: 0.25,

	projectionEndDate: "2066-09-01",
};

const strategy: PortfolioStrategy = {
	id: "balanced",

	name: "Balanced",

	workingAllocation: {
		growth: 0.7,

		defensive: 0.2,

		cash: 0.1,
	},

	transitionAllocation: {
		growth: 0.6,

		defensive: 0.3,

		cash: 0.1,
	},

	retirementAllocation: {
		growth: 0.5,

		defensive: 0.4,

		cash: 0.1,
	},

	transitionYearsBeforeRetirement: 5,
};

const marketAssumptions: MarketModelAssumptions = {
	growth: {
		expectedReturn: 0.07,

		volatility: 0.15,
	},

	defensive: {
		expectedReturn: 0.04,

		volatility: 0.07,
	},

	cash: {
		expectedReturn: 0.03,

		volatility: 0.01,
	},

	growthDefensiveCorrelation: 0.2,

	expectedInflation: 0.025,

	inflationVolatility: 0.01,
};

describe("summarizeLifecycleSimulations", () => {
	it("creates annual percentile distributions across 500 lifecycle simulations", () => {
		const paths = generateMarketPaths(
			{
				numberOfSimulations: 500,

				numberOfYears: 40,

				seed: 20260903,
			},

			marketAssumptions,
		);

		const results = paths.map((marketPath) =>
			runLifecycleSimulation({
				household,

				assumptions: projectionAssumptions,

				plan: {
					retirementAge: 65,

					annualRetirementSpending: 70000,
				},

				strategy,

				marketPath,
			}),
		);

		const summary = summarizeLifecycleSimulations(results);

		expect(summary.simulationCount).toBe(500);

		expect(summary.years).toHaveLength(41);

		const year20 = summary.years[20]!;

		expect(year20.netWorth.count).toBe(500);

		expect(year20.netWorth.percentiles.p25).toBeLessThanOrEqual(
			year20.netWorth.percentiles.p50,
		);

		expect(year20.netWorth.percentiles.p50).toBeLessThanOrEqual(
			year20.netWorth.percentiles.p75,
		);
	});

	it("retains tail percentiles while exposing the central p25-p75 range", () => {
		const paths = generateMarketPaths(
			{
				numberOfSimulations: 100,

				numberOfYears: 40,

				seed: 1234,
			},

			marketAssumptions,
		);

		const results = paths.map((marketPath) =>
			runLifecycleSimulation({
				household,

				assumptions: projectionAssumptions,

				plan: {
					retirementAge: 65,

					annualRetirementSpending: 70000,
				},

				strategy,

				marketPath,
			}),
		);

		const summary = summarizeLifecycleSimulations(results);

		const final = summary.years[summary.years.length - 1]!.netWorth.percentiles;

		expect(final.p10).toBeLessThanOrEqual(final.p25);

		expect(final.p25).toBeLessThanOrEqual(final.p50);

		expect(final.p50).toBeLessThanOrEqual(final.p75);

		expect(final.p75).toBeLessThanOrEqual(final.p90);
	});

	it("calculates the proportion of simulations with an unfunded cash-flow event", () => {
		const paths = generateMarketPaths(
			{
				numberOfSimulations: 50,

				numberOfYears: 40,

				seed: 99,
			},

			marketAssumptions,
		);

		const results = paths.map((marketPath) =>
			runLifecycleSimulation({
				household,

				assumptions: projectionAssumptions,

				plan: {
					retirementAge: 65,

					annualRetirementSpending: 250000,
				},

				strategy,

				marketPath,
			}),
		);

		const summary = summarizeLifecycleSimulations(results);

		expect(summary.probabilityOfAnyUnfundedCashFlow).toBeGreaterThan(0);

		expect(summary.probabilityOfAnyUnfundedCashFlow).toBeLessThanOrEqual(1);
	});
});

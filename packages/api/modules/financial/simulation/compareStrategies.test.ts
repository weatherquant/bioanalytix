import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import { compareStrategies } from "./compareStrategies";
import { LifecycleSimulationError } from "./lifecycleTypes";
import { generateMarketPaths } from "./marketModel";
import type { MarketModelAssumptions, PortfolioStrategy } from "./types";

function household(): HouseholdFinancialState {
	return {
		id: "household-1",

		asOfDate: "2026-09-01",

		currency: "AUD",

		country: "Australia",

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

				annualAmount: 120000,

				taxable: true,
			},
		],

		expenses: {
			essentialAnnual: 50000,

			discretionaryAnnual: 15000,
		},

		assets: [
			{
				id: "cash",

				type: "cash",

				value: 30000,

				liquid: true,

				investable: true,

				incomeProducing: false,
			},

			{
				id: "portfolio",

				type: "investment",

				value: 150000,

				liquid: true,

				investable: true,

				incomeProducing: true,
			},
		],

		superannuation: [
			{
				id: "super",

				personId: "primary",

				balance: 400000,

				annualContribution: 12000,

				preserved: true,
			},
		],

		liabilities: [],

		insurance: [],

		estate: {},

		goals: [],
	};
}

function assumptions(): ProjectionAssumptions {
	return {
		inflationRate: 0.025,

		wageGrowthRate: 0.03,

		spendingGrowthRate: 0.025,

		cashReturnRate: 0.03,

		investmentReturnRate: 0.06,

		superReturnRate: 0.06,

		effectiveTaxRate: 0.25,

		projectionEndDate: "2066-09-01",
	};
}

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

const growthStrategy: PortfolioStrategy = {
	id: "growth-maintained",

	name: "Growth maintained",

	workingAllocation: {
		growth: 0.75,

		defensive: 0.2,

		cash: 0.05,
	},

	transitionAllocation: {
		growth: 0.7,

		defensive: 0.25,

		cash: 0.05,
	},

	retirementAllocation: {
		growth: 0.65,

		defensive: 0.3,

		cash: 0.05,
	},

	transitionYearsBeforeRetirement: 5,
};

const defensiveStrategy: PortfolioStrategy = {
	id: "defensive-transition",

	name: "Defensive transition",

	workingAllocation: {
		growth: 0.65,

		defensive: 0.3,

		cash: 0.05,
	},

	transitionAllocation: {
		growth: 0.4,

		defensive: 0.5,

		cash: 0.1,
	},

	retirementAllocation: {
		growth: 0.25,

		defensive: 0.6,

		cash: 0.15,
	},

	transitionYearsBeforeRetirement: 5,
};

function marketPaths(numberOfSimulations = 100) {
	return generateMarketPaths(
		{
			numberOfSimulations,

			numberOfYears: 40,

			seed: 20260903,
		},

		marketAssumptions,
	);
}

describe("compareStrategies", () => {
	it("runs every strategy over the same market paths", () => {
		const paths = marketPaths(50);

		const result = compareStrategies({
			household: household(),

			assumptions: assumptions(),

			plan: {
				retirementAge: 65,

				annualRetirementSpending: 70000,
			},

			strategies: [growthStrategy, defensiveStrategy],

			marketPaths: paths,
		});

		expect(result.marketPathCount).toBe(50);

		expect(result.strategies).toHaveLength(2);

		expect(result.lifecycleResults[growthStrategy.id]).toHaveLength(50);

		expect(result.lifecycleResults[defensiveStrategy.id]).toHaveLength(50);

		for (let index = 0; index < 50; index += 1) {
			expect(result.lifecycleResults[growthStrategy.id]![index]?.simulationIndex).toBe(
				result.lifecycleResults[defensiveStrategy.id]![index]?.simulationIndex,
			);
		}
	});

	it("produces a paired distribution of strategy differences", () => {
		const result = compareStrategies({
			household: household(),

			assumptions: assumptions(),

			plan: {
				retirementAge: 65,

				annualRetirementSpending: 70000,
			},

			strategies: [growthStrategy, defensiveStrategy],

			marketPaths: marketPaths(100),
		});

		expect(result.pairedDifferences).toHaveLength(1);

		const difference = result.pairedDifferences[0]!;

		expect(difference.comparatorStrategyId).toBe(defensiveStrategy.id);

		expect(difference.endingNetWorthDifference.count).toBe(100);

		expect(difference.probabilityComparatorHigherEndingNetWorth).toBeGreaterThanOrEqual(0);

		expect(difference.probabilityComparatorHigherEndingNetWorth).toBeLessThanOrEqual(1);
	});

	it("does not discard the tails of paired strategy outcomes", () => {
		const result = compareStrategies({
			household: household(),

			assumptions: assumptions(),

			plan: {
				retirementAge: 65,

				annualRetirementSpending: 70000,
			},

			strategies: [growthStrategy, defensiveStrategy],

			marketPaths: marketPaths(100),
		});

		const distribution = result.pairedDifferences[0]!.endingNetWorthDifference;

		expect(distribution.minimum).toBeLessThanOrEqual(distribution.percentiles.p10);

		expect(distribution.percentiles.p10).toBeLessThanOrEqual(distribution.percentiles.p25);

		expect(distribution.percentiles.p25).toBeLessThanOrEqual(distribution.percentiles.p50);

		expect(distribution.percentiles.p50).toBeLessThanOrEqual(distribution.percentiles.p75);

		expect(distribution.percentiles.p75).toBeLessThanOrEqual(distribution.percentiles.p90);

		expect(distribution.percentiles.p90).toBeLessThanOrEqual(distribution.maximum);
	});

	it("summarises first unfunded age only across paths that actually become unfunded", () => {
		const result = compareStrategies({
			household: household(),

			assumptions: assumptions(),

			plan: {
				retirementAge: 65,

				annualRetirementSpending: 250000,
			},

			strategies: [growthStrategy, defensiveStrategy],

			marketPaths: marketPaths(100),
		});

		for (const strategy of result.strategies) {
			expect(strategy.firstUnfundedDateCount).toBeGreaterThan(0);

			expect(strategy.firstUnfundedAge).not.toBeNull();

			expect(strategy.firstUnfundedAge?.count).toBe(strategy.firstUnfundedDateCount);
		}
	});

	it("supports 500 common market paths for the intended product simulation", () => {
		const result = compareStrategies({
			household: household(),

			assumptions: assumptions(),

			plan: {
				retirementAge: 65,

				annualRetirementSpending: 70000,
			},

			strategies: [growthStrategy, defensiveStrategy],

			marketPaths: marketPaths(500),
		});

		expect(result.marketPathCount).toBe(500);

		expect(result.strategies[0]?.simulationCount).toBe(500);

		expect(result.strategies[1]?.simulationCount).toBe(500);

		expect(result.pairedDifferences[0]?.endingNetWorthDifference.count).toBe(500);
	});

	it("fails closed when fewer than two strategies are supplied", () => {
		expect(() =>
			compareStrategies({
				household: household(),

				assumptions: assumptions(),

				plan: {
					retirementAge: 65,

					annualRetirementSpending: 70000,
				},

				strategies: [growthStrategy],

				marketPaths: marketPaths(10),
			}),
		).toThrow(LifecycleSimulationError);
	});

	it("fails closed when strategy identifiers are duplicated", () => {
		expect(() =>
			compareStrategies({
				household: household(),

				assumptions: assumptions(),

				plan: {
					retirementAge: 65,

					annualRetirementSpending: 70000,
				},

				strategies: [
					growthStrategy,
					{
						...defensiveStrategy,

						id: growthStrategy.id,
					},
				],

				marketPaths: marketPaths(10),
			}),
		).toThrow(LifecycleSimulationError);
	});

	it("fails closed when market path simulation indexes are duplicated", () => {
		const paths = marketPaths(2);

		paths[1] = {
			...paths[1]!,

			simulationIndex: paths[0]!.simulationIndex,
		};

		expect(() =>
			compareStrategies({
				household: household(),

				assumptions: assumptions(),

				plan: {
					retirementAge: 65,

					annualRetirementSpending: 70000,
				},

				strategies: [growthStrategy, defensiveStrategy],

				marketPaths: paths,
			}),
		).toThrow(LifecycleSimulationError);
	});
});

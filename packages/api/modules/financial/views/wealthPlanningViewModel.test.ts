import { describe, expect, it } from "vitest";

import type {
	RetirementStrategyComparisonResult,
	RetirementStrategyComparisonOutcome,
} from "../retirement/compareRetirementStrategies";
import type { StandardPortfolioStrategyId } from "../retirement/standardPortfolioStrategies";
import type {
	StrategyComparisonResult,
	StrategyOutcomeMetrics,
} from "../simulation/strategyComparisonTypes";
import type { SimulationDistribution } from "../simulation/types";
import {
	buildWealthPlanningViewModel,
	WEALTH_BASELINE_STRATEGY_ID,
	WEALTH_PLANNING_VIEW_MODEL_VERSION,
	WealthPlanningViewModelError,
} from "./wealthPlanningViewModel";
import type { WealthViewModel } from "./wealthViewModel";

const strategyIds: StandardPortfolioStrategyId[] = [
	"capital_stable",
	"conservative",
	"balanced",
	"growth",
	"high_growth",
];

function distribution(p50: number): SimulationDistribution {
	return {
		count: 500,

		percentiles: {
			p10: p50 - 200000,
			p25: p50 - 100000,
			p50,
			p75: p50 + 100000,
			p90: p50 + 200000,
		},

		minimum: p50 - 300000,

		maximum: p50 + 300000,

		mean: p50,
	};
}

function baseline(): WealthViewModel {
	return {
		simulationCount: 500,

		strategyId: "balanced",

		current: {
			netWealth: 1000000,
			liquidWealth: 300000,
			superannuation: 500000,
		},

		longevity: {
			lowerAge: 88,
			centralAge: 92,
			upperAge: 96,
		},

		projection: [],

		atPlanningAge: {
			age: 92,
			projectionDate: "2068-01-01",
			p25NetWealth: 400000,
			medianNetWealth: 700000,
			p75NetWealth: 1000000,
			p25LiquidWealth: 100000,
			medianLiquidWealth: 250000,
			p75LiquidWealth: 400000,
		},

		resilience: {
			probabilityOfAnyUnfundedCashFlow: 0.08,
		},

		qualifications: ["Baseline qualification."],
	};
}

function capacityOutcome(
	strategyId: StandardPortfolioStrategyId,
	index: number,
): RetirementStrategyComparisonOutcome {
	const sustainableAnnualRetirementIncome = 70000 + index * 5000;

	return {
		strategyId,

		strategyName: strategyId,

		riskLevel: ["lower", "low_moderate", "moderate", "higher", "highest"][
			index
		] as RetirementStrategyComparisonOutcome["riskLevel"],

		growthAllocation: [0.2, 0.4, 0.6, 0.7, 0.85][index]!,

		defensiveAllocation: [0.65, 0.5, 0.35, 0.25, 0.1][index]!,

		cashAllocation: [0.15, 0.1, 0.05, 0.05, 0.05][index]!,

		summary: `${strategyId} summary`,

		growthDescription: "Growth assets.",

		defensiveDescription: "Defensive assets.",

		cashDescription: "Cash.",

		sustainableAnnualRetirementIncome,

		shortfallProbability: 0.1,

		simulationCount: 500,

		result: {
			retirementAge: 65,

			strategyId,

			strategyName: strategyId,

			sustainableAnnualRetirementIncome,

			maximumShortfallProbability: 0.1,

			assessment: {
				annualRetirementSpending: sustainableAnnualRetirementIncome,

				simulationCount: 500,

				pathsWithUnfundedCashFlow: 50,

				shortfallProbability: 0.1,

				meetsResilienceTarget: true,

				meetsAllTargets: true,
			},

			iterations: 8,
		},
	};
}

function retirementStrategyComparison(): RetirementStrategyComparisonResult {
	const outcomes = strategyIds.map(capacityOutcome);

	return {
		retirementAge: 65,

		maximumShortfallProbability: 0.1,

		simulationCount: 500,

		outcomes,

		highestSustainableIncome: 90000,

		lowestSustainableIncome: 70000,

		incomeRange: 20000,
	};
}

function targetOutcome(
	strategyId: StandardPortfolioStrategyId,
	index: number,
): StrategyOutcomeMetrics {
	return {
		strategyId,

		strategyName: strategyId,

		simulationCount: 500,

		endingNetWorth: distribution(500000 + index * 100000),

		endingLiquidWealth: distribution(200000 + index * 50000),

		endingSuperannuation: distribution(300000 + index * 75000),

		totalUnfundedCashFlow: distribution(50000 - index * 10000),

		probabilityOfAnyUnfundedCashFlow: [0.25, 0.16, 0.12, 0.08, 0.07][index]!,

		firstUnfundedAge: distribution(82 + index),

		firstUnfundedDateCount: [125, 80, 60, 40, 35][index]!,
	};
}

function targetIncomeComparison(): StrategyComparisonResult {
	return {
		referenceStrategyId: "balanced",

		marketPathCount: 500,

		strategies: strategyIds.map(targetOutcome),

		lifecycleSummaries: [],

		pairedDifferences: [],

		lifecycleResults: {},
	};
}

describe("buildWealthPlanningViewModel", () => {
	it("composes all five standard strategies into the wealth planning view", () => {
		const result = buildWealthPlanningViewModel({
			baseline: baseline(),

			desiredAnnualRetirementIncome: 80000,

			retirementStrategyComparison: retirementStrategyComparison(),

			targetIncomeComparison: targetIncomeComparison(),
		});

		expect(result.version).toBe(WEALTH_PLANNING_VIEW_MODEL_VERSION);

		expect(result.baselineStrategyId).toBe(WEALTH_BASELINE_STRATEGY_ID);

		expect(result.strategies.map((strategy) => strategy.strategyId)).toEqual(strategyIds);

		expect(result.strategies).toHaveLength(5);
	});

	it("keeps sustainable-income capacity separate from desired-income resilience", () => {
		const result = buildWealthPlanningViewModel({
			baseline: baseline(),

			desiredAnnualRetirementIncome: 80000,

			retirementStrategyComparison: retirementStrategyComparison(),

			targetIncomeComparison: targetIncomeComparison(),
		});

		const balanced = result.strategies.find((strategy) => strategy.strategyId === "balanced")!;

		const growth = result.strategies.find((strategy) => strategy.strategyId === "growth")!;

		expect(balanced.sustainableAnnualRetirementIncome).toBe(80000);

		expect(balanced.incomeDifference).toBe(0);

		expect(balanced.targetAssessment.probabilityOfAnyUnfundedCashFlow).toBe(0.12);

		expect(balanced.targetAssessment.meetsResilienceCriterion).toBe(false);

		expect(growth.sustainableAnnualRetirementIncome).toBe(85000);

		expect(growth.incomeDifference).toBe(5000);

		expect(growth.targetAssessment.probabilityOfAnyUnfundedCashFlow).toBe(0.08);

		expect(growth.targetAssessment.meetsResilienceCriterion).toBe(true);
	});

	it("fails closed when a strategy is missing from the target-income comparison", () => {
		const targetComparison = targetIncomeComparison();

		targetComparison.strategies = targetComparison.strategies.filter(
			(strategy) => strategy.strategyId !== "growth",
		);

		expect(() =>
			buildWealthPlanningViewModel({
				baseline: baseline(),

				desiredAnnualRetirementIncome: 80000,

				retirementStrategyComparison: retirementStrategyComparison(),

				targetIncomeComparison: targetComparison,
			}),
		).toThrow(WealthPlanningViewModelError);
	});

	it("fails closed when the two comparisons use different market-path counts", () => {
		const targetComparison = targetIncomeComparison();

		targetComparison.marketPathCount = 499;

		try {
			buildWealthPlanningViewModel({
				baseline: baseline(),

				desiredAnnualRetirementIncome: 80000,

				retirementStrategyComparison: retirementStrategyComparison(),

				targetIncomeComparison: targetComparison,
			});

			throw new Error("Expected WealthPlanningViewModelError.");
		} catch (error) {
			expect(error).toBeInstanceOf(WealthPlanningViewModelError);

			expect((error as WealthPlanningViewModelError).reasons).toContain(
				"Sustainable-income and target-income comparisons must use the same number of market paths.",
			);
		}
	});

	it("requires Balanced to remain the baseline wealth strategy", () => {
		const invalidBaseline = baseline();

		invalidBaseline.strategyId = "growth";

		try {
			buildWealthPlanningViewModel({
				baseline: invalidBaseline,

				desiredAnnualRetirementIncome: 80000,

				retirementStrategyComparison: retirementStrategyComparison(),

				targetIncomeComparison: targetIncomeComparison(),
			});

			throw new Error("Expected WealthPlanningViewModelError.");
		} catch (error) {
			expect(error).toBeInstanceOf(WealthPlanningViewModelError);

			expect((error as WealthPlanningViewModelError).reasons).toContain(
				"Baseline wealth projection must use the balanced strategy.",
			);
		}
	});
});

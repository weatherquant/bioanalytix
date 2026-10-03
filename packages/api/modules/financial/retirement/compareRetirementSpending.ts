import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import { runLifecycleSimulation } from "../simulation/lifecycleSimulation";
import {
	summarizeLifecycleSimulations,
	type LifecycleDistributionSummary,
} from "../simulation/summarizeLifecycle";
import type { MarketPath, PortfolioStrategy } from "../simulation/types";
import type { LifecycleRetirementSafetyNet } from "./lifecycleSafetyNet";

export interface RetirementSpendingComparisonInput {
	household: HouseholdFinancialState;
	assumptions: ProjectionAssumptions;
	retirementAge: number;
	baselineAnnualRetirementSpending: number;
	annualAdditionalRetirementSpending: number;
	strategy: PortfolioStrategy;
	marketPaths: MarketPath[];
	retirementSafetyNet?: LifecycleRetirementSafetyNet;
}

export interface RetirementSpendingScenarioResult {
	annualRetirementSpending: number;
	summary: LifecycleDistributionSummary;
}

export interface RetirementSpendingComparisonResult {
	retirementAge: number;
	baselineAnnualRetirementSpending: number;
	alternativeAnnualRetirementSpending: number;
	annualAdditionalRetirementSpending: number;
	strategyId: string;
	strategyName: string;
	simulationCount: number;
	baseline: RetirementSpendingScenarioResult;
	alternative: RetirementSpendingScenarioResult;
}

/**
 * Compare a user-selected increase in annual retirement spending while
 * holding the household, retirement age, strategy, projection assumptions,
 * market paths and retirement-income safety net constant.
 *
 * The additional spending amount is an explicit financial planning
 * assumption. Genetics must never populate or alter it automatically.
 */
export function compareRetirementSpending(
	input: RetirementSpendingComparisonInput,
): RetirementSpendingComparisonResult {
	if (
		!Number.isFinite(input.baselineAnnualRetirementSpending) ||
		input.baselineAnnualRetirementSpending < 0
	) {
		throw new Error(
			"Baseline annual retirement spending must be a non-negative finite number.",
		);
	}

	if (
		!Number.isFinite(input.annualAdditionalRetirementSpending) ||
		input.annualAdditionalRetirementSpending < 0
	) {
		throw new Error(
			"Additional annual retirement spending must be a non-negative finite number.",
		);
	}

	if (input.marketPaths.length === 0) {
		throw new Error("At least one market path is required.");
	}

	const alternativeAnnualRetirementSpending =
		input.baselineAnnualRetirementSpending + input.annualAdditionalRetirementSpending;

	const runScenario = (annualRetirementSpending: number): LifecycleDistributionSummary => {
		const results = input.marketPaths.map((marketPath) =>
			runLifecycleSimulation({
				household: input.household,
				assumptions: input.assumptions,
				plan: {
					retirementAge: input.retirementAge,
					annualRetirementSpending,
				},
				strategy: input.strategy,
				marketPath,
				retirementSafetyNet: input.retirementSafetyNet,
			}),
		);

		return summarizeLifecycleSimulations(results);
	};

	return {
		retirementAge: input.retirementAge,
		baselineAnnualRetirementSpending: input.baselineAnnualRetirementSpending,
		alternativeAnnualRetirementSpending,
		annualAdditionalRetirementSpending: input.annualAdditionalRetirementSpending,
		strategyId: input.strategy.id,
		strategyName: input.strategy.name,
		simulationCount: input.marketPaths.length,
		baseline: {
			annualRetirementSpending: input.baselineAnnualRetirementSpending,
			summary: runScenario(input.baselineAnnualRetirementSpending),
		},
		alternative: {
			annualRetirementSpending: alternativeAnnualRetirementSpending,
			summary: runScenario(alternativeAnnualRetirementSpending),
		},
	};
}

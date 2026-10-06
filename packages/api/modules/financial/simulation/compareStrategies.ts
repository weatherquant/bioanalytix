import { runLifecycleSimulation } from "./lifecycleSimulation";
import { LifecycleSimulationError, type LifecycleSimulationResult } from "./lifecycleTypes";
import type {
	PairedStrategyDifference,
	StrategyComparisonInput,
	StrategyComparisonResult,
	StrategyOutcomeMetrics,
} from "./strategyComparisonTypes";
import { summarizeLifecycleSimulations } from "./summarizeLifecycle";
import { summarizeDistribution } from "./summarizeSimulation";
import type { MarketPath, PortfolioStrategy } from "./types";

function validateComparisonInput(input: StrategyComparisonInput): void {
	const reasons: string[] = [];

	if (input.strategies.length < 2) {
		reasons.push("At least two portfolio strategies are required for comparison.");
	}

	if (input.marketPaths.length === 0) {
		reasons.push("At least one market path is required for strategy comparison.");
	}

	const strategyIds = input.strategies.map((strategy) => strategy.id);

	if (new Set(strategyIds).size !== strategyIds.length) {
		reasons.push("Portfolio strategy identifiers must be unique.");
	}

	const simulationIndexes = input.marketPaths.map((path) => path.simulationIndex);

	if (new Set(simulationIndexes).size !== simulationIndexes.length) {
		reasons.push("Market path simulation indexes must be unique.");
	}

	if (reasons.length > 0) {
		throw new LifecycleSimulationError("Strategy comparison input is invalid.", reasons);
	}
}

function endingLiquidWealth(result: LifecycleSimulationResult): number {
	const finalYear = result.years[result.years.length - 1]!;

	return finalYear.cashAssets + finalYear.nonSuperInvestableWealth;
}

function firstUnfundedAge(result: LifecycleSimulationResult): number | null {
	const first = result.years.find((year) => year.unfundedCashFlow > 0);

	return first?.primaryAge ?? null;
}

function summarizeStrategy(
	strategy: PortfolioStrategy,
	results: LifecycleSimulationResult[],
): StrategyOutcomeMetrics {
	const unfundedAges = results.map(firstUnfundedAge).filter((age): age is number => age !== null);

	return {
		strategyId: strategy.id,

		strategyName: strategy.name,

		simulationCount: results.length,

		endingNetWorth: summarizeDistribution(
			results.map((result) => result.summary.endingNetWorth),
		),

		endingLiquidWealth: summarizeDistribution(
			results.map((result) => endingLiquidWealth(result)),
		),

		endingSuperannuation: summarizeDistribution(
			results.map((result) => result.summary.endingSuperannuation),
		),

		totalUnfundedCashFlow: summarizeDistribution(
			results.map((result) => result.summary.totalUnfundedCashFlow),
		),

		probabilityOfAnyUnfundedCashFlow:
			results.filter((result) => result.summary.totalUnfundedCashFlow > 0).length /
			results.length,

		firstUnfundedAge: unfundedAges.length > 0 ? summarizeDistribution(unfundedAges) : null,

		firstUnfundedDateCount: unfundedAges.length,
	};
}

function pairedDifference(
	reference: LifecycleSimulationResult[],
	comparator: LifecycleSimulationResult[],
	comparatorStrategyId: string,
): PairedStrategyDifference {
	if (reference.length !== comparator.length) {
		throw new LifecycleSimulationError("Paired strategy results are not comparable.", [
			"Reference and comparator strategies must contain the same number of simulations.",
		]);
	}

	const endingNetWorthDifferences: number[] = [];

	const endingLiquidWealthDifferences: number[] = [];

	const unfundedDifferences: number[] = [];

	let comparatorHigherEndingNetWorth = 0;

	let comparatorLowerUnfundedCashFlow = 0;

	for (let index = 0; index < reference.length; index += 1) {
		const referenceResult = reference[index]!;

		const comparatorResult = comparator[index]!;

		if (referenceResult.simulationIndex !== comparatorResult.simulationIndex) {
			throw new LifecycleSimulationError("Paired strategy results are not aligned.", [
				"Reference and comparator results must use matching simulation indexes.",
			]);
		}

		const netWorthDifference =
			comparatorResult.summary.endingNetWorth - referenceResult.summary.endingNetWorth;

		const liquidWealthDifference =
			endingLiquidWealth(comparatorResult) - endingLiquidWealth(referenceResult);

		const unfundedDifference =
			comparatorResult.summary.totalUnfundedCashFlow -
			referenceResult.summary.totalUnfundedCashFlow;

		endingNetWorthDifferences.push(netWorthDifference);

		endingLiquidWealthDifferences.push(liquidWealthDifference);

		unfundedDifferences.push(unfundedDifference);

		if (netWorthDifference > 0) {
			comparatorHigherEndingNetWorth += 1;
		}

		if (unfundedDifference < 0) {
			comparatorLowerUnfundedCashFlow += 1;
		}
	}

	return {
		comparatorStrategyId,

		endingNetWorthDifference: summarizeDistribution(endingNetWorthDifferences),

		endingLiquidWealthDifference: summarizeDistribution(endingLiquidWealthDifferences),

		totalUnfundedCashFlowDifference: summarizeDistribution(unfundedDifferences),

		probabilityComparatorHigherEndingNetWorth:
			comparatorHigherEndingNetWorth / reference.length,

		probabilityComparatorLowerUnfundedCashFlow:
			comparatorLowerUnfundedCashFlow / reference.length,
	};
}

function runStrategy(
	input: StrategyComparisonInput,
	strategy: PortfolioStrategy,
	marketPaths: MarketPath[],
): LifecycleSimulationResult[] {
	return marketPaths.map((marketPath) =>
		runLifecycleSimulation({
			household: input.household,

			assumptions: input.assumptions,

			plan: input.plan,

			strategy,

			marketPath,
		}),
	);
}

export function compareStrategies(input: StrategyComparisonInput): StrategyComparisonResult {
	validateComparisonInput(input);

	const lifecycleResults: Record<string, LifecycleSimulationResult[]> = {};

	for (const strategy of input.strategies) {
		lifecycleResults[strategy.id] = runStrategy(input, strategy, input.marketPaths);
	}

	const strategies = input.strategies.map((strategy) =>
		summarizeStrategy(strategy, lifecycleResults[strategy.id]!),
	);

	const lifecycleSummaries = input.strategies.map((strategy) =>
		summarizeLifecycleSimulations(lifecycleResults[strategy.id]!),
	);

	const referenceStrategy = input.strategies[0]!;

	const referenceResults = lifecycleResults[referenceStrategy.id]!;

	const pairedDifferences = input.strategies
		.slice(1)
		.map((strategy) =>
			pairedDifference(referenceResults, lifecycleResults[strategy.id]!, strategy.id),
		);

	return {
		referenceStrategyId: referenceStrategy.id,

		marketPathCount: input.marketPaths.length,

		strategies,

		lifecycleSummaries,

		pairedDifferences,

		lifecycleResults,
	};
}

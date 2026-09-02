import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import type { LifecyclePlan, LifecycleSimulationResult } from "./lifecycleTypes";
import type { LifecycleDistributionSummary } from "./summarizeLifecycle";
import type {
	MarketPath,
	PercentileSummary,
	PortfolioStrategy,
	SimulationDistribution,
} from "./types";

export interface StrategyComparisonInput {
	household: HouseholdFinancialState;

	assumptions: ProjectionAssumptions;

	plan: LifecyclePlan;

	strategies: PortfolioStrategy[];

	/**
	 * The same market paths are supplied to every strategy.
	 *
	 * This implements common random numbers so differences
	 * between strategies are not caused by different random
	 * market histories.
	 */
	marketPaths: MarketPath[];
}

export interface StrategyOutcomeMetrics {
	strategyId: string;

	strategyName: string;

	simulationCount: number;

	endingNetWorth: SimulationDistribution;

	endingLiquidWealth: SimulationDistribution;

	endingSuperannuation: SimulationDistribution;

	totalUnfundedCashFlow: SimulationDistribution;

	probabilityOfAnyUnfundedCashFlow: number;

	firstUnfundedAge: SimulationDistribution | null;

	firstUnfundedDateCount: number;
}

export interface PairedStrategyDifference {
	comparatorStrategyId: string;

	/**
	 * comparator - reference
	 *
	 * Positive values therefore mean the comparator produced
	 * a higher value for the metric.
	 */
	endingNetWorthDifference: SimulationDistribution;

	endingLiquidWealthDifference: SimulationDistribution;

	totalUnfundedCashFlowDifference: SimulationDistribution;

	/**
	 * Fraction of paired simulations in which the comparator
	 * ended with greater net worth than the reference.
	 */
	probabilityComparatorHigherEndingNetWorth: number;

	/**
	 * Fraction of paired simulations in which the comparator
	 * produced less cumulative unfunded cash flow than the
	 * reference.
	 */
	probabilityComparatorLowerUnfundedCashFlow: number;
}

export interface StrategyComparisonResult {
	referenceStrategyId: string;

	marketPathCount: number;

	strategies: StrategyOutcomeMetrics[];

	lifecycleSummaries: LifecycleDistributionSummary[];

	pairedDifferences: PairedStrategyDifference[];

	/**
	 * Individual lifecycle paths are deliberately retained.
	 *
	 * They remain useful for sequence-risk analysis,
	 * drawdowns, depletion timing and later diagnostic views.
	 */
	lifecycleResults: Record<string, LifecycleSimulationResult[]>;
}

export interface CentralOutcomeBand {
	p25: number;

	p50: number;

	p75: number;
}

export function centralOutcomeBand(percentiles: PercentileSummary): CentralOutcomeBand {
	return {
		p25: percentiles.p25,

		p50: percentiles.p50,

		p75: percentiles.p75,
	};
}

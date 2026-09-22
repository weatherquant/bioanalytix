import type {
	RetirementStrategyComparisonResult,
	RetirementStrategyComparisonOutcome,
} from "../retirement/compareRetirementStrategies";
import type {
	PortfolioRiskLevel,
	StandardPortfolioStrategyId,
} from "../retirement/standardPortfolioStrategies";
import type {
	StrategyComparisonResult,
	StrategyOutcomeMetrics,
} from "../simulation/strategyComparisonTypes";
import { centralOutcomeBand } from "../simulation/strategyComparisonTypes";
import type { WealthViewModel } from "./wealthViewModel";

export const WEALTH_PLANNING_VIEW_MODEL_VERSION = "1.0.0";

export const WEALTH_BASELINE_STRATEGY_ID = "balanced" as const;

export interface WealthPlanningStrategyOutcome {
	strategyId: StandardPortfolioStrategyId;

	strategyName: string;

	riskLevel: PortfolioRiskLevel;

	allocation: {
		growth: number;

		defensive: number;

		cash: number;
	};

	desiredAnnualRetirementIncome: number;

	sustainableAnnualRetirementIncome: number;

	incomeDifference: number;

	targetAssessment: {
		meetsResilienceCriterion: boolean;

		probabilityOfAnyUnfundedCashFlow: number;

		maximumShortfallProbability: number;
	};

	endingNetWorth: {
		p25: number;

		p50: number;

		p75: number;
	};

	endingLiquidWealth: {
		p25: number;

		p50: number;

		p75: number;
	};

	endingSuperannuation: {
		p25: number;

		p50: number;

		p75: number;
	};

	firstUnfundedAge: {
		p25: number;

		p50: number;

		p75: number;
	} | null;

	summary: string;
}

export interface WealthPlanningViewModel {
	version: typeof WEALTH_PLANNING_VIEW_MODEL_VERSION;

	baselineStrategyId: typeof WEALTH_BASELINE_STRATEGY_ID;

	retirementAge: number;

	desiredAnnualRetirementIncome: number;

	baseline: WealthViewModel;

	strategies: WealthPlanningStrategyOutcome[];

	qualifications: string[];
}

export class WealthPlanningViewModelError extends Error {
	readonly reasons: string[];

	constructor(message: string, reasons: string[]) {
		super(message);

		this.name = "WealthPlanningViewModelError";

		this.reasons = reasons;
	}
}

function findTargetOutcome(
	comparison: StrategyComparisonResult,
	strategyId: StandardPortfolioStrategyId,
): StrategyOutcomeMetrics {
	const outcome = comparison.strategies.find((candidate) => candidate.strategyId === strategyId);

	if (!outcome) {
		throw new WealthPlanningViewModelError("Wealth planning view cannot be created.", [
			`Target-income comparison is missing strategy ${strategyId}.`,
		]);
	}

	return outcome;
}

function buildStrategyOutcome(
	capacity: RetirementStrategyComparisonOutcome,
	target: StrategyOutcomeMetrics,
	desiredAnnualRetirementIncome: number,
	maximumShortfallProbability: number,
): WealthPlanningStrategyOutcome {
	return {
		strategyId: capacity.strategyId,

		strategyName: capacity.strategyName,

		riskLevel: capacity.riskLevel,

		allocation: {
			growth: capacity.growthAllocation,

			defensive: capacity.defensiveAllocation,

			cash: capacity.cashAllocation,
		},

		desiredAnnualRetirementIncome,

		sustainableAnnualRetirementIncome: capacity.sustainableAnnualRetirementIncome,

		incomeDifference:
			capacity.sustainableAnnualRetirementIncome - desiredAnnualRetirementIncome,

		targetAssessment: {
			meetsResilienceCriterion:
				target.probabilityOfAnyUnfundedCashFlow <= maximumShortfallProbability,

			probabilityOfAnyUnfundedCashFlow: target.probabilityOfAnyUnfundedCashFlow,

			maximumShortfallProbability,
		},

		endingNetWorth: centralOutcomeBand(target.endingNetWorth.percentiles),

		endingLiquidWealth: centralOutcomeBand(target.endingLiquidWealth.percentiles),

		endingSuperannuation: centralOutcomeBand(target.endingSuperannuation.percentiles),

		firstUnfundedAge: target.firstUnfundedAge
			? centralOutcomeBand(target.firstUnfundedAge.percentiles)
			: null,

		summary: capacity.summary,
	};
}

export function buildWealthPlanningViewModel(input: {
	baseline: WealthViewModel;

	desiredAnnualRetirementIncome: number;

	retirementStrategyComparison: RetirementStrategyComparisonResult;

	targetIncomeComparison: StrategyComparisonResult;
}): WealthPlanningViewModel {
	const {
		baseline,
		desiredAnnualRetirementIncome,
		retirementStrategyComparison,
		targetIncomeComparison,
	} = input;

	const reasons: string[] = [];

	if (!Number.isFinite(desiredAnnualRetirementIncome) || desiredAnnualRetirementIncome < 0) {
		reasons.push("Desired annual retirement income must be a non-negative finite number.");
	}

	if (
		retirementStrategyComparison.retirementAge < 0 ||
		!Number.isFinite(retirementStrategyComparison.retirementAge)
	) {
		reasons.push("Retirement age must be a non-negative finite number.");
	}

	if (retirementStrategyComparison.simulationCount !== targetIncomeComparison.marketPathCount) {
		reasons.push(
			"Sustainable-income and target-income comparisons must use the same number of market paths.",
		);
	}

	if (baseline.strategyId !== WEALTH_BASELINE_STRATEGY_ID) {
		reasons.push(
			`Baseline wealth projection must use the ${WEALTH_BASELINE_STRATEGY_ID} strategy.`,
		);
	}

	if (reasons.length > 0) {
		throw new WealthPlanningViewModelError("Wealth planning view cannot be created.", reasons);
	}

	const strategies = retirementStrategyComparison.outcomes.map((capacity) =>
		buildStrategyOutcome(
			capacity,
			findTargetOutcome(targetIncomeComparison, capacity.strategyId),
			desiredAnnualRetirementIncome,
			retirementStrategyComparison.maximumShortfallProbability,
		),
	);

	return {
		version: WEALTH_PLANNING_VIEW_MODEL_VERSION,

		baselineStrategyId: WEALTH_BASELINE_STRATEGY_ID,

		retirementAge: retirementStrategyComparison.retirementAge,

		desiredAnnualRetirementIncome,

		baseline,

		strategies,

		qualifications: [
			...baseline.qualifications,
			"The desired retirement income initially reflects current recurring household spending and can be explored as a planning assumption.",
			"Sustainable retirement income is the highest tested annual spending level satisfying the specified simulation resilience criterion under the stated assumptions.",
			"Portfolio strategies are illustrative asset-allocation alternatives for scenario comparison and are not personalised investment recommendations.",
			"Higher growth exposure may change both expected outcomes and the distribution of downside outcomes.",
		],
	};
}

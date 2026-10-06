import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import type { MarketPath } from "../simulation/types";
import type { LifecycleRetirementSafetyNet } from "./lifecycleSafetyNet";
import {
	STANDARD_PORTFOLIO_STRATEGIES,
	type PortfolioRiskLevel,
	type StandardPortfolioStrategyId,
} from "./standardPortfolioStrategies";
import {
	findSustainableRetirementIncome,
	type SustainableRetirementIncomeResult,
} from "./sustainableRetirementIncome";

export interface RetirementStrategyComparisonInput {
	household: HouseholdFinancialState;

	assumptions: ProjectionAssumptions;

	retirementAge: number;

	marketPaths: MarketPath[];

	maximumShortfallProbability: number;

	maximumAnnualSpending: number;

	spendingPrecision?: number;

	retirementSafetyNet?: LifecycleRetirementSafetyNet;
}

export interface RetirementStrategyComparisonOutcome {
	strategyId: StandardPortfolioStrategyId;

	strategyName: string;

	riskLevel: PortfolioRiskLevel;

	growthAllocation: number;

	defensiveAllocation: number;

	cashAllocation: number;

	summary: string;

	growthDescription: string;

	defensiveDescription: string;

	cashDescription: string;

	sustainableAnnualRetirementIncome: number;

	shortfallProbability: number;

	simulationCount: number;

	result: SustainableRetirementIncomeResult;
}

export interface RetirementStrategyComparisonResult {
	retirementAge: number;

	maximumShortfallProbability: number;

	simulationCount: number;

	outcomes: RetirementStrategyComparisonOutcome[];

	highestSustainableIncome: number;

	lowestSustainableIncome: number;

	incomeRange: number;
}

export function compareRetirementStrategies(
	input: RetirementStrategyComparisonInput,
): RetirementStrategyComparisonResult {
	if (input.marketPaths.length === 0) {
		throw new Error("Retirement strategy comparison requires at least one market path.");
	}

	const outcomes = STANDARD_PORTFOLIO_STRATEGIES.map(
		(portfolio): RetirementStrategyComparisonOutcome => {
			const result = findSustainableRetirementIncome({
				household: input.household,

				assumptions: input.assumptions,

				retirementAge: input.retirementAge,

				strategy: portfolio.strategy,

				marketPaths: input.marketPaths,

				maximumShortfallProbability: input.maximumShortfallProbability,

				maximumAnnualSpending: input.maximumAnnualSpending,

				spendingPrecision: input.spendingPrecision,

				retirementSafetyNet: input.retirementSafetyNet,
			});

			const allocation = portfolio.strategy.retirementAllocation;

			return {
				strategyId: portfolio.id,

				strategyName: portfolio.name,

				riskLevel: portfolio.riskLevel,

				growthAllocation: allocation.growth,

				defensiveAllocation: allocation.defensive,

				cashAllocation: allocation.cash,

				summary: portfolio.summary,

				growthDescription: portfolio.growthDescription,

				defensiveDescription: portfolio.defensiveDescription,

				cashDescription: portfolio.cashDescription,

				sustainableAnnualRetirementIncome: result.sustainableAnnualRetirementIncome,

				shortfallProbability: result.assessment.shortfallProbability,

				simulationCount: result.assessment.simulationCount,

				result,
			};
		},
	);

	const sustainableIncomes = outcomes.map((outcome) => outcome.sustainableAnnualRetirementIncome);

	const highestSustainableIncome = Math.max(...sustainableIncomes);

	const lowestSustainableIncome = Math.min(...sustainableIncomes);

	return {
		retirementAge: input.retirementAge,

		maximumShortfallProbability: input.maximumShortfallProbability,

		simulationCount: input.marketPaths.length,

		outcomes,

		highestSustainableIncome,

		lowestSustainableIncome,

		incomeRange: highestSustainableIncome - lowestSustainableIncome,
	};
}

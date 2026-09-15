import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import { runLifecycleSimulation } from "../simulation/lifecycleSimulation";
import type { MarketPath, PortfolioStrategy } from "../simulation/types";
import type { LifecycleRetirementSafetyNet } from "./lifecycleSafetyNet";

export interface SustainableRetirementIncomeInput {
	household: HouseholdFinancialState;

	assumptions: ProjectionAssumptions;

	retirementAge: number;

	strategy: PortfolioStrategy;

	marketPaths: MarketPath[];

	/**
	 * Maximum acceptable proportion of simulations that
	 * experience any unfunded cash flow.
	 *
	 * Example:
	 * 0.10 = no more than 10% of simulated paths.
	 */
	maximumShortfallProbability: number;

	/**
	 * Upper bound used by the search.
	 *
	 * This is a computational search bound, not a
	 * recommendation or financial conclusion.
	 */
	maximumAnnualSpending: number;

	/**
	 * Smallest spending increment worth distinguishing.
	 *
	 * Example:
	 * 1000 = solve to approximately the nearest $1,000 p.a.
	 */
	spendingPrecision?: number;

	retirementSafetyNet?: LifecycleRetirementSafetyNet;
}

export interface RetirementIncomeAssessment {
	annualRetirementSpending: number;

	simulationCount: number;

	pathsWithUnfundedCashFlow: number;

	shortfallProbability: number;

	meetsResilienceTarget: boolean;
}

export interface SustainableRetirementIncomeResult {
	retirementAge: number;

	strategyId: string;

	strategyName: string;

	sustainableAnnualRetirementIncome: number;

	maximumShortfallProbability: number;

	assessment: RetirementIncomeAssessment;

	iterations: number;
}

function validateInput(input: SustainableRetirementIncomeInput): void {
	if (input.marketPaths.length === 0) {
		throw new Error("Sustainable retirement income requires at least one market path.");
	}

	if (
		!Number.isFinite(input.maximumShortfallProbability) ||
		input.maximumShortfallProbability < 0 ||
		input.maximumShortfallProbability > 1
	) {
		throw new Error("Maximum shortfall probability must be between 0 and 1.");
	}

	if (!Number.isFinite(input.maximumAnnualSpending) || input.maximumAnnualSpending < 0) {
		throw new Error("Maximum annual spending must be a non-negative finite number.");
	}

	const precision = input.spendingPrecision ?? 1000;

	if (!Number.isFinite(precision) || precision <= 0) {
		throw new Error("Spending precision must be a positive finite number.");
	}
}

function assessSpending(
	input: SustainableRetirementIncomeInput,
	annualRetirementSpending: number,
): RetirementIncomeAssessment {
	let pathsWithUnfundedCashFlow = 0;

	for (const marketPath of input.marketPaths) {
		const result = runLifecycleSimulation({
			household: input.household,

			assumptions: input.assumptions,

			plan: {
				retirementAge: input.retirementAge,
				annualRetirementSpending,
			},

			strategy: input.strategy,

			marketPath,

			retirementSafetyNet: input.retirementSafetyNet,
		});

		if (result.summary.totalUnfundedCashFlow > 0) {
			pathsWithUnfundedCashFlow += 1;
		}
	}

	const shortfallProbability = pathsWithUnfundedCashFlow / input.marketPaths.length;

	return {
		annualRetirementSpending,

		simulationCount: input.marketPaths.length,

		pathsWithUnfundedCashFlow,

		shortfallProbability,

		meetsResilienceTarget: shortfallProbability <= input.maximumShortfallProbability,
	};
}

export function findSustainableRetirementIncome(
	input: SustainableRetirementIncomeInput,
): SustainableRetirementIncomeResult {
	validateInput(input);

	const precision = input.spendingPrecision ?? 1000;

	let lower = 0;

	let upper = input.maximumAnnualSpending;

	let iterations = 0;

	let bestAssessment = assessSpending(input, 0);

	while (upper - lower > precision) {
		iterations += 1;

		const midpoint = Math.floor((lower + upper) / 2 / precision) * precision;

		/*
		 * Prevent a precision-rounded midpoint from
		 * becoming identical to the lower bound.
		 */
		const candidate = midpoint <= lower ? Math.min(lower + precision, upper) : midpoint;

		const assessment = assessSpending(input, candidate);

		if (assessment.meetsResilienceTarget) {
			lower = candidate;
			bestAssessment = assessment;
		} else {
			upper = candidate;
		}
	}

	/*
	 * Test the upper precision boundary as well.
	 *
	 * This avoids returning one increment too low where
	 * the final boundary itself still satisfies the target.
	 */
	if (upper > bestAssessment.annualRetirementSpending) {
		const upperAssessment = assessSpending(input, upper);

		if (upperAssessment.meetsResilienceTarget) {
			bestAssessment = upperAssessment;
		}
	}

	return {
		retirementAge: input.retirementAge,

		strategyId: input.strategy.id,

		strategyName: input.strategy.name,

		sustainableAnnualRetirementIncome: bestAssessment.annualRetirementSpending,

		maximumShortfallProbability: input.maximumShortfallProbability,

		assessment: bestAssessment,

		iterations,
	};
}

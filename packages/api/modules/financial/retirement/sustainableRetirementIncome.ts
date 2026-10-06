import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import { runLifecycleSimulation } from "../simulation/lifecycleSimulation";
import type { MarketPath, PortfolioStrategy } from "../simulation/types";
import type { LifecycleRetirementSafetyNet } from "./lifecycleSafetyNet";

export interface RetirementInheritanceObjective {
	minimumEndingNetWorth: number;

	/**
	 * Maximum acceptable proportion of simulations that
	 * finish below the inheritance objective.
	 *
	 * Example:
	 * 0.10 = no more than 10% of simulated paths.
	 */
	maximumShortfallProbability: number;
}

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
	 * Optional inheritance objective.
	 *
	 * When supplied, a spending level must satisfy both the
	 * retirement resilience target and the inheritance target.
	 */
	inheritanceObjective?: RetirementInheritanceObjective;

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

	inheritanceObjective?: {
		minimumEndingNetWorth: number;

		pathsBelowObjective: number;

		shortfallProbability: number;

		maximumShortfallProbability: number;

		meetsObjective: boolean;
	};

	meetsAllTargets: boolean;
}

export interface SustainableRetirementIncomeResult {
	retirementAge: number;

	strategyId: string;

	strategyName: string;

	sustainableAnnualRetirementIncome: number;

	maximumShortfallProbability: number;

	inheritanceObjective?: RetirementInheritanceObjective;

	assessment: RetirementIncomeAssessment;

	iterations: number;
}

function validateProbability(value: number, message: string): void {
	if (!Number.isFinite(value) || value < 0 || value > 1) {
		throw new Error(message);
	}
}

function validateInput(input: SustainableRetirementIncomeInput): void {
	if (input.marketPaths.length === 0) {
		throw new Error("Sustainable retirement income requires at least one market path.");
	}

	validateProbability(
		input.maximumShortfallProbability,
		"Maximum shortfall probability must be between 0 and 1.",
	);

	if (!Number.isFinite(input.maximumAnnualSpending) || input.maximumAnnualSpending < 0) {
		throw new Error("Maximum annual spending must be a non-negative finite number.");
	}

	const precision = input.spendingPrecision ?? 1000;

	if (!Number.isFinite(precision) || precision <= 0) {
		throw new Error("Spending precision must be a positive finite number.");
	}

	if (input.inheritanceObjective) {
		if (
			!Number.isFinite(input.inheritanceObjective.minimumEndingNetWorth) ||
			input.inheritanceObjective.minimumEndingNetWorth < 0
		) {
			throw new Error("Inheritance objective must be a non-negative finite number.");
		}

		validateProbability(
			input.inheritanceObjective.maximumShortfallProbability,
			"Inheritance shortfall probability must be between 0 and 1.",
		);
	}
}

function assessSpending(
	input: SustainableRetirementIncomeInput,
	annualRetirementSpending: number,
): RetirementIncomeAssessment {
	let pathsWithUnfundedCashFlow = 0;
	let pathsBelowInheritanceObjective = 0;

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

		if (
			input.inheritanceObjective &&
			result.summary.endingNetWorth < input.inheritanceObjective.minimumEndingNetWorth
		) {
			pathsBelowInheritanceObjective += 1;
		}
	}

	const shortfallProbability = pathsWithUnfundedCashFlow / input.marketPaths.length;

	const meetsResilienceTarget = shortfallProbability <= input.maximumShortfallProbability;

	const inheritanceObjective = input.inheritanceObjective
		? {
				minimumEndingNetWorth: input.inheritanceObjective.minimumEndingNetWorth,

				pathsBelowObjective: pathsBelowInheritanceObjective,

				shortfallProbability: pathsBelowInheritanceObjective / input.marketPaths.length,

				maximumShortfallProbability: input.inheritanceObjective.maximumShortfallProbability,

				meetsObjective:
					pathsBelowInheritanceObjective / input.marketPaths.length <=
					input.inheritanceObjective.maximumShortfallProbability,
			}
		: undefined;

	return {
		annualRetirementSpending,

		simulationCount: input.marketPaths.length,

		pathsWithUnfundedCashFlow,

		shortfallProbability,

		meetsResilienceTarget,

		inheritanceObjective,

		meetsAllTargets: meetsResilienceTarget && (inheritanceObjective?.meetsObjective ?? true),
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

	/*
	 * If even zero retirement spending cannot satisfy all
	 * supplied objectives, no positive spending level can be
	 * described as satisfying those objectives.
	 *
	 * The assessment is retained so callers can explain which
	 * target was not met.
	 */
	if (!bestAssessment.meetsAllTargets) {
		return {
			retirementAge: input.retirementAge,

			strategyId: input.strategy.id,

			strategyName: input.strategy.name,

			sustainableAnnualRetirementIncome: 0,

			maximumShortfallProbability: input.maximumShortfallProbability,

			inheritanceObjective: input.inheritanceObjective,

			assessment: bestAssessment,

			iterations,
		};
	}

	while (upper - lower > precision) {
		iterations += 1;

		const midpoint = Math.floor((lower + upper) / 2 / precision) * precision;

		/*
		 * Prevent a precision-rounded midpoint from
		 * becoming identical to the lower bound.
		 */
		const candidate = midpoint <= lower ? Math.min(lower + precision, upper) : midpoint;

		const assessment = assessSpending(input, candidate);

		if (assessment.meetsAllTargets) {
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
	 * the final boundary itself still satisfies the targets.
	 */
	if (upper > bestAssessment.annualRetirementSpending) {
		const upperAssessment = assessSpending(input, upper);

		if (upperAssessment.meetsAllTargets) {
			bestAssessment = upperAssessment;
		}
	}

	return {
		retirementAge: input.retirementAge,

		strategyId: input.strategy.id,

		strategyName: input.strategy.name,

		sustainableAnnualRetirementIncome: bestAssessment.annualRetirementSpending,

		maximumShortfallProbability: input.maximumShortfallProbability,

		inheritanceObjective: input.inheritanceObjective,

		assessment: bestAssessment,

		iterations,
	};
}

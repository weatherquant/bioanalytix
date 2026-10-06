import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import type { MarketPath } from "../simulation/types";
import {
	compareRetirementStrategies,
	type RetirementStrategyComparisonResult,
} from "./compareRetirementStrategies";
import type { LifecycleRetirementSafetyNet } from "./lifecycleSafetyNet";

export interface RetirementAgeComparisonInput {
	household: HouseholdFinancialState;

	assumptions: ProjectionAssumptions;

	baselineRetirementAge: number;

	alternativeRetirementAge: number;

	marketPaths: MarketPath[];

	maximumShortfallProbability: number;

	maximumAnnualSpending: number;

	spendingPrecision?: number;

	retirementSafetyNet?: LifecycleRetirementSafetyNet;
}

export interface RetirementAgeStrategyDifference {
	strategyId: string;

	strategyName: string;

	baselineAnnualRetirementIncome: number;

	alternativeAnnualRetirementIncome: number;

	annualIncomeDifference: number;

	percentageDifference: number | null;
}

export interface RetirementAgeComparisonResult {
	baselineRetirementAge: number;

	alternativeRetirementAge: number;

	baseline: RetirementStrategyComparisonResult;

	alternative: RetirementStrategyComparisonResult;

	differences: RetirementAgeStrategyDifference[];
}

/**
 * Compare two possible retirement ages using exactly the same
 * household assumptions and simulated market paths.
 *
 * This isolates the financial consequence of changing the
 * retirement-age assumption rather than allowing differences
 * in simulated markets to influence the comparison.
 */
export function compareRetirementAges(
	input: RetirementAgeComparisonInput,
): RetirementAgeComparisonResult {
	if (!Number.isFinite(input.baselineRetirementAge) || input.baselineRetirementAge <= 0) {
		throw new Error("Baseline retirement age must be a positive finite number.");
	}

	if (!Number.isFinite(input.alternativeRetirementAge) || input.alternativeRetirementAge <= 0) {
		throw new Error("Alternative retirement age must be a positive finite number.");
	}

	const sharedInput = {
		household: input.household,

		assumptions: input.assumptions,

		marketPaths: input.marketPaths,

		maximumShortfallProbability: input.maximumShortfallProbability,

		maximumAnnualSpending: input.maximumAnnualSpending,

		spendingPrecision: input.spendingPrecision,

		retirementSafetyNet: input.retirementSafetyNet,
	};

	const baseline = compareRetirementStrategies({
		...sharedInput,

		retirementAge: input.baselineRetirementAge,
	});

	const alternative = compareRetirementStrategies({
		...sharedInput,

		retirementAge: input.alternativeRetirementAge,
	});

	const differences = baseline.outcomes.map(
		(baselineOutcome): RetirementAgeStrategyDifference => {
			const alternativeOutcome = alternative.outcomes.find(
				(candidate) => candidate.strategyId === baselineOutcome.strategyId,
			);

			if (!alternativeOutcome) {
				throw new Error(
					`Missing alternative outcome for strategy: ${baselineOutcome.strategyId}`,
				);
			}

			const baselineIncome = baselineOutcome.sustainableAnnualRetirementIncome;

			const alternativeIncome = alternativeOutcome.sustainableAnnualRetirementIncome;

			const annualIncomeDifference = alternativeIncome - baselineIncome;

			return {
				strategyId: baselineOutcome.strategyId,

				strategyName: baselineOutcome.strategyName,

				baselineAnnualRetirementIncome: baselineIncome,

				alternativeAnnualRetirementIncome: alternativeIncome,

				annualIncomeDifference,

				percentageDifference:
					baselineIncome > 0 ? annualIncomeDifference / baselineIncome : null,
			};
		},
	);

	return {
		baselineRetirementAge: input.baselineRetirementAge,

		alternativeRetirementAge: input.alternativeRetirementAge,

		baseline,

		alternative,

		differences,
	};
}

import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import type { MarketPath, PortfolioStrategy } from "../simulation/types";
import type { LifecycleRetirementSafetyNet } from "./lifecycleSafetyNet";
import {
	findSustainableRetirementIncome,
	type SustainableRetirementIncomeResult,
} from "./sustainableRetirementIncome";

export interface InheritanceObjectiveComparisonInput {
	household: HouseholdFinancialState;

	assumptions: ProjectionAssumptions;

	retirementAge: number;

	strategy: PortfolioStrategy;

	marketPaths: MarketPath[];

	maximumShortfallProbability: number;

	inheritanceTargetAmount: number;

	maximumInheritanceShortfallProbability: number;

	maximumAnnualSpending: number;

	spendingPrecision?: number;

	retirementSafetyNet?: LifecycleRetirementSafetyNet;
}

export interface InheritanceObjectiveComparisonResult {
	retirementAge: number;

	strategyId: string;

	strategyName: string;

	inheritanceTargetAmount: number;

	maximumInheritanceShortfallProbability: number;

	baselineAnnualRetirementIncome: number;

	withInheritanceObjectiveAnnualRetirementIncome: number;

	annualRetirementIncomeDifference: number;

	percentageDifference: number | null;

	objectiveAchievableAtZeroSpending: boolean;

	baseline: SustainableRetirementIncomeResult;

	withInheritanceObjective: SustainableRetirementIncomeResult;
}

/**
 * Compare sustainable retirement spending with and without an
 * inheritance objective using exactly the same household,
 * strategy, assumptions and simulated market paths.
 *
 * The inheritance objective is therefore the only financial
 * planning constraint changed by this comparison.
 */
export function compareInheritanceObjective(
	input: InheritanceObjectiveComparisonInput,
): InheritanceObjectiveComparisonResult {
	if (!Number.isFinite(input.inheritanceTargetAmount) || input.inheritanceTargetAmount < 0) {
		throw new Error("Inheritance target amount must be a non-negative finite number.");
	}

	if (
		!Number.isFinite(input.maximumInheritanceShortfallProbability) ||
		input.maximumInheritanceShortfallProbability < 0 ||
		input.maximumInheritanceShortfallProbability > 1
	) {
		throw new Error("Maximum inheritance shortfall probability must be between 0 and 1.");
	}

	const sharedInput = {
		household: input.household,

		assumptions: input.assumptions,

		retirementAge: input.retirementAge,

		strategy: input.strategy,

		marketPaths: input.marketPaths,

		maximumShortfallProbability: input.maximumShortfallProbability,

		maximumAnnualSpending: input.maximumAnnualSpending,

		spendingPrecision: input.spendingPrecision,

		retirementSafetyNet: input.retirementSafetyNet,
	};

	const baseline = findSustainableRetirementIncome(sharedInput);

	const withInheritanceObjective = findSustainableRetirementIncome({
		...sharedInput,

		inheritanceObjective: {
			minimumEndingNetWorth: input.inheritanceTargetAmount,

			maximumShortfallProbability: input.maximumInheritanceShortfallProbability,
		},
	});

	const baselineIncome = baseline.sustainableAnnualRetirementIncome;

	const constrainedIncome = withInheritanceObjective.sustainableAnnualRetirementIncome;

	const annualRetirementIncomeDifference = constrainedIncome - baselineIncome;

	return {
		retirementAge: input.retirementAge,

		strategyId: input.strategy.id,

		strategyName: input.strategy.name,

		inheritanceTargetAmount: input.inheritanceTargetAmount,

		maximumInheritanceShortfallProbability: input.maximumInheritanceShortfallProbability,

		baselineAnnualRetirementIncome: baselineIncome,

		withInheritanceObjectiveAnnualRetirementIncome: constrainedIncome,

		annualRetirementIncomeDifference,

		percentageDifference:
			baselineIncome > 0 ? annualRetirementIncomeDifference / baselineIncome : null,

		objectiveAchievableAtZeroSpending:
			withInheritanceObjective.assessment.inheritanceObjective?.meetsObjective ?? true,

		baseline,

		withInheritanceObjective,
	};
}

import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import { analyseSurvivorScenario, type SurvivorScenarioAnalysis } from "./survivorScenario";

export interface CompareLifeInsuranceInput {
	household: HouseholdFinancialState;
	assumptions: ProjectionAssumptions;
	personId: string;
	startDate: string;

	/**
	 * Explicit planning assumption.
	 *
	 * This must not be inferred from genetics, mortality risk,
	 * employment status or total household income.
	 */
	annualIncomeLost: number;

	annualAdditionalExpenses?: number;
	oneOffExpense?: number;
}

export interface LifeInsuranceComparison {
	personId: string;
	annualIncomeLost: number;
	recordedLifeInsuranceCover: number;

	withRecordedCover: SurvivorScenarioAnalysis;
	withoutRecordedCover: SurvivorScenarioAnalysis;

	difference: {
		additionalScenarioSupport: number;
		reductionInAdditionalUnfundedNeed: number;
		endingLiquidWealthImpact: number;
		endingNetWorthImpact: number;
	};

	qualifications: string[];
}

/**
 * Compares the same survivor scenario twice:
 *
 * 1. using the person's recorded life insurance cover; and
 * 2. excluding that cover.
 *
 * Everything else is held constant.
 *
 * This answers the narrow economic question:
 *
 * "What difference does the recorded life insurance make
 * under this explicit survivor scenario?"
 *
 * It does not determine how much insurance a person should
 * hold and it is not an insurance recommendation.
 */
export function compareLifeInsurance(input: CompareLifeInsuranceInput): LifeInsuranceComparison {
	const sharedInput = {
		household: input.household,
		assumptions: input.assumptions,
		personId: input.personId,
		startDate: input.startDate,
		annualIncomeLost: input.annualIncomeLost,
		annualAdditionalExpenses: input.annualAdditionalExpenses,
		oneOffExpense: input.oneOffExpense,
	};

	const withRecordedCover = analyseSurvivorScenario({
		...sharedInput,
		includeRecordedLifeInsurance: true,
	});

	const withoutRecordedCover = analyseSurvivorScenario({
		...sharedInput,
		includeRecordedLifeInsurance: false,
	});

	return {
		personId: input.personId,
		annualIncomeLost: input.annualIncomeLost,
		recordedLifeInsuranceCover: withRecordedCover.lifeInsuranceProceeds,

		withRecordedCover,
		withoutRecordedCover,

		difference: {
			additionalScenarioSupport:
				withRecordedCover.scenario.summary.totalScenarioSupport -
				withoutRecordedCover.scenario.summary.totalScenarioSupport,

			reductionInAdditionalUnfundedNeed:
				withoutRecordedCover.resilience.additionalUnfundedNeed -
				withRecordedCover.resilience.additionalUnfundedNeed,

			endingLiquidWealthImpact:
				withRecordedCover.scenario.summary.endingLiquidWealthImpact -
				withoutRecordedCover.scenario.summary.endingLiquidWealthImpact,

			endingNetWorthImpact:
				withRecordedCover.scenario.summary.endingNetWorthImpact -
				withoutRecordedCover.scenario.summary.endingNetWorthImpact,
		},

		qualifications: [
			"The comparison changes only whether recorded life insurance proceeds are included. Other scenario assumptions are held constant.",
			"Annual income lost and any additional expenses are explicit planning assumptions rather than predictions.",
			"The comparison does not assess policy eligibility, exclusions, taxation, ownership or beneficiary arrangements.",
			"A stronger result with insurance does not mean the current amount is optimal or that the policy should be retained.",
			"A similar result without insurance does not by itself mean the policy is unnecessary.",
		],
	};
}

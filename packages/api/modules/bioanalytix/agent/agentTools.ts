import { assessEstatePosition } from "../../financial/estate/estateAnalysis";
import type { HouseholdFinancialState } from "../../financial/household/types";
import { compareLifeInsurance } from "../../financial/protection/compareLifeInsurance";
import { assessProtectionPosition } from "../../financial/protection/protectionAnalysis";
import { analyseSurvivorScenario } from "../../financial/protection/survivorScenario";
import { compareRetirementAges } from "../../financial/retirement/compareRetirementAges";
import type { BioanalytixPlanningProfileV1 } from "../../planning/planningProfile";
import { buildBioanalytixProjectionAssumptions } from "../../planning/projectionPolicy";
import {
	buildBioanalytixRetirementSimulationPolicy,
	getBioanalytixBaselineRetirementAge,
} from "../../planning/retirementSimulationPolicy";
import { buildBioanalytixAgentContext } from "./agentContext";
import type { BioanalytixToolName } from "./agentContract";

export interface BioanalytixAgentToolInput {
	tool: BioanalytixToolName;

	household: HouseholdFinancialState;

	profile: BioanalytixPlanningProfileV1;

	parameters?: {
		personId?: string;

		alternativeRetirementAge?: number;

		startDate?: string;

		annualIncomeLost?: number;

		annualAdditionalExpenses?: number;

		oneOffExpense?: number;
	};
}

export type BioanalytixAgentToolResult =
	| {
			status: "completed";
			tool: "review_plan";
			result: ReturnType<typeof buildBioanalytixAgentContext>;
	  }
	| {
			status: "completed";
			tool: "compare_retirement_age";
			result: ReturnType<typeof compareRetirementAges>;
	  }
	| {
			status: "completed";
			tool: "assess_protection";
			result: ReturnType<typeof assessProtectionPosition>;
	  }
	| {
			status: "completed";
			tool: "run_survivor_scenario";
			result: ReturnType<typeof analyseSurvivorScenario>;
	  }
	| {
			status: "completed";
			tool: "compare_life_insurance";
			result: ReturnType<typeof compareLifeInsurance>;
	  }
	| {
			status: "completed";
			tool: "assess_estate";
			result: ReturnType<typeof assessEstatePosition>;
	  }
	| {
			status: "needs_input";
			tool: BioanalytixToolName;
			missingInputs: Array<{
				key: string;
				question: string;
				reason: string;
			}>;
	  };

function primaryPersonId(household: HouseholdFinancialState): string {
	const primaryPerson =
		household.people.find((person) => person.role === "primary") ?? household.people[0];

	if (!primaryPerson) {
		throw new Error("Bioanalytix agent requires at least one household person.");
	}

	return primaryPerson.id;
}

function positiveFinite(value: number | undefined): value is number {
	return value !== undefined && Number.isFinite(value) && value > 0;
}

function nonNegativeFinite(value: number | undefined): value is number {
	return value !== undefined && Number.isFinite(value) && value >= 0;
}

export function runBioanalytixAgentTool(
	input: BioanalytixAgentToolInput,
): BioanalytixAgentToolResult {
	const parameters = input.parameters ?? {};

	switch (input.tool) {
		case "review_plan":
			return {
				status: "completed",
				tool: "review_plan",
				result: buildBioanalytixAgentContext(input.profile),
			};

		case "assess_protection": {
			const personId = parameters.personId ?? primaryPersonId(input.household);

			return {
				status: "completed",
				tool: "assess_protection",
				result: assessProtectionPosition(input.household, personId),
			};
		}

		case "assess_estate":
			return {
				status: "completed",
				tool: "assess_estate",
				result: assessEstatePosition(input.household),
			};

		case "compare_retirement_age": {
			if (!positiveFinite(parameters.alternativeRetirementAge)) {
				return {
					status: "needs_input",
					tool: "compare_retirement_age",
					missingInputs: [
						{
							key: "alternativeRetirementAge",
							question: "What retirement age would you like me to test?",
							reason: "Retirement age must be an explicit planning assumption rather than inferred from genetics or other personal information.",
						},
					],
				};
			}

			const baselineRetirementAge = getBioanalytixBaselineRetirementAge(input.household);

			const simulationPolicy = buildBioanalytixRetirementSimulationPolicy(input.household);

			return {
				status: "completed",
				tool: "compare_retirement_age",
				result: compareRetirementAges({
					household: input.household,
					assumptions: simulationPolicy.projectionAssumptions,
					baselineRetirementAge,
					alternativeRetirementAge: parameters.alternativeRetirementAge,
					marketPaths: simulationPolicy.marketPaths,
					maximumShortfallProbability: simulationPolicy.maximumShortfallProbability,
					maximumAnnualSpending: simulationPolicy.maximumAnnualSpending,
					spendingPrecision: simulationPolicy.spendingPrecision,
				}),
			};
		}

		case "run_survivor_scenario": {
			const missingInputs: Array<{
				key: string;
				question: string;
				reason: string;
			}> = [];

			if (!parameters.startDate) {
				missingInputs.push({
					key: "startDate",
					question: "What date should I use for the survivor scenario?",
					reason: "The financial scenario needs an explicit start date.",
				});
			}

			if (!nonNegativeFinite(parameters.annualIncomeLost)) {
				missingInputs.push({
					key: "annualIncomeLost",
					question: "How much annual household income should I assume would be lost?",
					reason: "Income loss must be an explicit planning assumption and must not be inferred from genetics or total household income.",
				});
			}

			if (missingInputs.length > 0) {
				return {
					status: "needs_input",
					tool: "run_survivor_scenario",
					missingInputs,
				};
			}

			const personId = parameters.personId ?? primaryPersonId(input.household);

			return {
				status: "completed",
				tool: "run_survivor_scenario",
				result: analyseSurvivorScenario({
					household: input.household,
					assumptions: buildBioanalytixProjectionAssumptions(input.household),
					personId,
					startDate: parameters.startDate!,
					annualIncomeLost: parameters.annualIncomeLost!,
					annualAdditionalExpenses: parameters.annualAdditionalExpenses,
					oneOffExpense: parameters.oneOffExpense,
					includeRecordedLifeInsurance: true,
				}),
			};
		}

		case "compare_life_insurance": {
			const missingInputs: Array<{
				key: string;
				question: string;
				reason: string;
			}> = [];

			if (!parameters.startDate) {
				missingInputs.push({
					key: "startDate",
					question: "What date should I use for the insurance comparison?",
					reason: "The comparison requires an explicit scenario start date.",
				});
			}

			if (!nonNegativeFinite(parameters.annualIncomeLost)) {
				missingInputs.push({
					key: "annualIncomeLost",
					question: "How much annual household income should I assume would be lost?",
					reason: "The insurance comparison must use an explicit income-loss assumption rather than infer one.",
				});
			}

			if (missingInputs.length > 0) {
				return {
					status: "needs_input",
					tool: "compare_life_insurance",
					missingInputs,
				};
			}

			const personId = parameters.personId ?? primaryPersonId(input.household);

			return {
				status: "completed",
				tool: "compare_life_insurance",
				result: compareLifeInsurance({
					household: input.household,
					assumptions: buildBioanalytixProjectionAssumptions(input.household),
					personId,
					startDate: parameters.startDate!,
					annualIncomeLost: parameters.annualIncomeLost!,
					annualAdditionalExpenses: parameters.annualAdditionalExpenses,
					oneOffExpense: parameters.oneOffExpense,
				}),
			};
		}
	}
}

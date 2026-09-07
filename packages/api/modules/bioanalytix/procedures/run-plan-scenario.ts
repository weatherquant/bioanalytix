import {
	createBioScenarioRun,
	getBioPlanForHousehold,
	getOrCreatePrimaryBioHousehold,
} from "@repo/database";
import { BioScenarioSource } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";
import type { HouseholdFinancialState } from "../../financial/household/types";
import { runFinancialScenario } from "../../financial/scenarios/scenarioEngine";
import {
	buildPlanScenarioIntent,
	PLAN_SCENARIO_ADAPTER_VERSION,
} from "../../planning/planScenarioAdapter";
import {
	buildBioanalytixProjectionAssumptions,
	BIOANALYTIX_PROJECTION_POLICY_VERSION,
} from "../../planning/projectionPolicy";
import type { SavedBioanalytixPlanV1, SavedPlanningQuestion } from "../../planning/savedPlan";

const inputSchema = z.object({
	questionId: z.string().min(1),
});

function sourceForQuestion(question: SavedPlanningQuestion): BioScenarioSource {
	switch (question.source) {
		case "genetic_profile":
			return BioScenarioSource.GENETIC_PROFILE;

		case "longevity":
			return BioScenarioSource.LONGEVITY_PROFILE;

		case "user":
			return BioScenarioSource.USER_SELECTED;

		case "household":
		case "estate":
		case "insurance":
		default:
			return BioScenarioSource.HOUSEHOLD;
	}
}

export const runBioanalytixPlanScenario = protectedProcedure
	.route({
		method: "POST",
		path: "/bioanalytix/plan/scenario",
		tags: ["Bioanalytix"],
		summary: "Run a saved Bioanalytix planning scenario",
		description:
			"Execute one user-selected financial planning scenario using the saved household and Plan assumptions.",
	})
	.input(inputSchema)
	.handler(async ({ context, input }) => {
		const household = await getOrCreatePrimaryBioHousehold({
			userId: context.user.id,

			name: context.user.name ? `${context.user.name}'s household` : "My household",
		});

		if (!household.financialState) {
			throw new Error("Household financial state is not available.");
		}

		const householdState = household.financialState as unknown as HouseholdFinancialState;

		const savedPlanRecord = await getBioPlanForHousehold(household.id);

		if (!savedPlanRecord) {
			throw new Error("Save your Bioanalytix Plan before running a scenario.");
		}

		const plan = savedPlanRecord.plan as unknown as SavedBioanalytixPlanV1;

		const question = plan.questions.find((candidate) => candidate.id === input.questionId);

		if (!question) {
			throw new Error("Planning question was not found in the saved Plan.");
		}

		if (!question.selected) {
			throw new Error("Select and save this planning question before running it.");
		}

		const intent = buildPlanScenarioIntent({
			question,
			household: householdState,
			assumptions: plan.assumptions,
		});

		if (!intent.ready) {
			return {
				status: "needs_input" as const,

				mode: intent.mode,

				questionId: question.id,

				missingInputs: intent.missingInputs,

				geneticContext: intent.geneticContext,
			};
		}

		/*
		 * Projection comparisons and readiness reviews
		 * are deliberately not forced through the
		 * financial shock engine.
		 */
		if (intent.mode !== "financial_scenario") {
			return {
				status: "not_financial_scenario" as const,

				mode: intent.mode,

				questionId: question.id,

				missingInputs: [],

				geneticContext: intent.geneticContext,
			};
		}

		if (!intent.scenario) {
			throw new Error("Financial scenario intent did not contain a scenario definition.");
		}

		const projectionAssumptions = buildBioanalytixProjectionAssumptions(householdState);

		const result = runFinancialScenario({
			household: householdState,

			assumptions: projectionAssumptions,

			scenario: intent.scenario,
		});

		const engineVersion = [
			"scenario-engine-v1",
			PLAN_SCENARIO_ADAPTER_VERSION,
			BIOANALYTIX_PROJECTION_POLICY_VERSION,
		].join("|");

		const run = await createBioScenarioRun({
			householdId: household.id,

			scenarioQuestionId: question.id,

			source: sourceForQuestion(question),

			parameters: {
				scenario: intent.scenario,

				planAssumptions: plan.assumptions,

				projectionAssumptions,

				geneticContext: intent.geneticContext,
			},

			result,

			engineVersion,
		});

		return {
			status: "completed" as const,

			runId: run.id,

			questionId: question.id,

			mode: intent.mode,

			geneticContext: intent.geneticContext,

			projectionAssumptions,

			result,

			createdAt: run.createdAt.toISOString(),
		};
	});

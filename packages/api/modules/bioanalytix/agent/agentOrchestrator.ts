import { generateText, textModel } from "@repo/ai";

import type { HouseholdFinancialState } from "../../financial/household/types";
import type { BioanalytixPlanningProfileV1 } from "../../planning/planningProfile";
import { buildBioanalytixAgentContext } from "./agentContext";
import {
	bioanalytixAgentAnswerSchema,
	type BioanalytixAgentAnswer,
	type BioanalytixMissingAssumption,
	type BioanalytixAgentDecision,
} from "./agentContract";
import { generateBioanalytixAgentDecision } from "./agentDecision";
import { buildBioanalytixAgentExplanationPrompt } from "./agentPrompt";
import { runBioanalytixAgentTool, type BioanalytixAgentToolResult } from "./agentTools";

export interface RunBioanalytixAgentInput {
	question: string;
	household: HouseholdFinancialState;
	profile: BioanalytixPlanningProfileV1;
}

export interface BioanalytixAgentDependencies {
	generateDecision: (input: {
		question: string;
		context: ReturnType<typeof buildBioanalytixAgentContext>;
	}) => Promise<BioanalytixAgentDecision>;

	generateExplanation: (input: {
		question: string;
		context: ReturnType<typeof buildBioanalytixAgentContext>;
		toolResult: BioanalytixAgentToolResult;
	}) => Promise<string>;
}

const defaultDependencies: BioanalytixAgentDependencies = {
	generateDecision: generateBioanalytixAgentDecision,

	generateExplanation: async ({ question, context, toolResult }) => {
		const explanation = await generateText({
			model: textModel,
			system: "You are Ask Bioanalytix. Explain deterministic Bioanalytix financial analysis clearly and conservatively. Never replace the supplied calculation with your own calculation or invent missing facts.",
			prompt: buildBioanalytixAgentExplanationPrompt({
				question,
				context,
				toolResult,
			}),
		});

		return explanation.text;
	},
};

function missingInputAnswer(missingAssumptions: BioanalytixMissingAssumption[]): string {
	if (missingAssumptions.length === 0) {
		return "I need a little more information before I can run that analysis.";
	}

	if (missingAssumptions.length === 1) {
		return missingAssumptions[0]!.question;
	}

	return [
		"I need a couple of assumptions before I can run that analysis:",
		"",
		...missingAssumptions.map((assumption) => `- ${assumption.question}`),
	].join("\n");
}

export async function runBioanalytixAgent(
	input: RunBioanalytixAgentInput,
	dependencies: BioanalytixAgentDependencies = defaultDependencies,
): Promise<BioanalytixAgentAnswer> {
	const context = buildBioanalytixAgentContext(input.profile);

	const decision = await dependencies.generateDecision({
		question: input.question,
		context,
	});

	if (!decision.tool) {
		return bioanalytixAgentAnswerSchema.parse({
			answer: "I can help with questions about your Bioanalytix Plan, including retirement, financial resilience, protection, estate planning and the planning relevance of your genetic results. I don't have an approved analysis for that question yet.",
			intent: decision.intent,
			toolUsed: null,
			missingAssumptions: decision.missingAssumptions,
			proposedPlanChange: null,
		});
	}

	const toolResult = runBioanalytixAgentTool({
		tool: decision.tool,
		household: input.household,
		profile: input.profile,
		parameters: {
			personId: decision.parameters.personId ?? undefined,
			alternativeRetirementAge: decision.parameters.alternativeRetirementAge ?? undefined,
			startDate: decision.parameters.startDate ?? undefined,
			annualIncomeLost: decision.parameters.annualIncomeLost ?? undefined,
			annualAdditionalExpenses: decision.parameters.annualAdditionalExpenses ?? undefined,
			oneOffExpense: decision.parameters.oneOffExpense ?? undefined,
		},
	});

	if (toolResult.status === "needs_input") {
		return bioanalytixAgentAnswerSchema.parse({
			answer: missingInputAnswer(toolResult.missingInputs),
			intent: decision.intent,
			toolUsed: decision.tool,
			missingAssumptions: toolResult.missingInputs,
			proposedPlanChange: null,
		});
	}

	const explanation = await dependencies.generateExplanation({
		question: input.question,
		context,
		toolResult,
	});

	return bioanalytixAgentAnswerSchema.parse({
		answer: explanation,
		intent: decision.intent,
		toolUsed: toolResult.tool,
		missingAssumptions: [],
		proposedPlanChange: null,
	});
}

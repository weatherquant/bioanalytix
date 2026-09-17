import { generateObject, textModel } from "@repo/ai";

import type { BioanalytixAgentContext } from "./agentContext";
import { bioanalytixAgentDecisionSchema, type BioanalytixAgentDecision } from "./agentContract";
import {
	BIOANALYTIX_AGENT_SYSTEM_PROMPT,
	buildBioanalytixAgentDecisionPrompt,
} from "./agentPrompt";

export interface GenerateBioanalytixAgentDecisionInput {
	question: string;
	context: BioanalytixAgentContext;
}

export async function generateBioanalytixAgentDecision(
	input: GenerateBioanalytixAgentDecisionInput,
): Promise<BioanalytixAgentDecision> {
	const result = await generateObject({
		model: textModel,
		schema: bioanalytixAgentDecisionSchema,
		system: BIOANALYTIX_AGENT_SYSTEM_PROMPT,
		prompt: buildBioanalytixAgentDecisionPrompt({
			question: input.question,
			context: input.context,
		}),
	});

	return bioanalytixAgentDecisionSchema.parse(result.object);
}

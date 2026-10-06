import { getCurrentBioPlanningProfile, getOrCreatePrimaryBioHousehold } from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";
import type { HouseholdFinancialState } from "../../financial/household/types";
import type { BioanalytixPlanningProfileV1 } from "../../planning/planningProfile";
import { bioanalytixAgentRequestSchema } from "../agent/agentContract";
import { runBioanalytixAgent } from "../agent/agentOrchestrator";

export const askBioanalytix = protectedProcedure
	.route({
		method: "POST",
		path: "/bioanalytix/ask",
		tags: ["Bioanalytix"],
		summary: "Ask Bioanalytix",
		description:
			"Answer a financial planning question using the authenticated household's planning profile and approved deterministic financial tools.",
	})
	.input(bioanalytixAgentRequestSchema)
	.handler(async ({ context, input }) => {
		const household = await getOrCreatePrimaryBioHousehold({
			userId: context.user.id,
			name: context.user.name ? `${context.user.name}'s household` : "My household",
		});

		if (!household.financialState) {
			throw new Error(
				"Complete Bioanalytix onboarding before asking financial planning questions.",
			);
		}

		const planningProfileRecord = await getCurrentBioPlanningProfile(household.id);

		const financialState = household.financialState as unknown as HouseholdFinancialState;

		const planningProfile =
			(planningProfileRecord?.profile as unknown as BioanalytixPlanningProfileV1 | null) ??
			null;

		return runBioanalytixAgent({
			question: input.question,
			household: financialState,
			profile: planningProfile,
			continuation: input.continuation,
		});
	});

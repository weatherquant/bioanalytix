import { ORPCError } from "@orpc/server";
import { saveBioHouseholdOnboardingDraft } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

const onboardingDraftSchema = z.object({
	householdId: z.string().min(1),

	onboardingStep: z.number().int().min(1).max(4),

	draft: z.record(z.string(), z.unknown()),
});

export const saveBioanalytixOnboardingDraft = protectedProcedure
	.route({
		method: "POST",
		path: "/bioanalytix/onboarding/draft",
		tags: ["Bioanalytix"],
		summary: "Save Bioanalytix onboarding draft",
		description:
			"Persist partial Bioanalytix setup answers for the authenticated user's household.",
	})
	.input(onboardingDraftSchema)
	.handler(async ({ context, input }) => {
		const household = await saveBioHouseholdOnboardingDraft({
			householdId: input.householdId,
			userId: context.user.id,
			onboardingDraft: input.draft,
			onboardingStep: input.onboardingStep,
		});

		if (!household) {
			throw new ORPCError("NOT_FOUND");
		}

		return {
			household,
		};
	});

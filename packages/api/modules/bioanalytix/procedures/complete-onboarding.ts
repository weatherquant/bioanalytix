import { ORPCError } from "@orpc/server";
import { completeBioHouseholdOnboarding, getBioHouseholdForUser } from "@repo/database";
import type { Prisma } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";
import { bioanalytixSetupSchema } from "../onboarding/setupSchema";
import {
	BioanalytixSetupError,
	toHouseholdFinancialState,
} from "../onboarding/toHouseholdFinancialState";

const completeOnboardingSchema = bioanalytixSetupSchema.extend({
	householdId: z.string().min(1),
});

export const completeBioanalytixOnboarding = protectedProcedure
	.route({
		method: "POST",
		path: "/bioanalytix/onboarding/complete",
		tags: ["Bioanalytix"],
		summary: "Complete Bioanalytix onboarding",
		description:
			"Validate setup data, persist the canonical household financial state, and mark Bioanalytix onboarding complete.",
	})
	.input(completeOnboardingSchema)
	.handler(async ({ context, input }) => {
		const household = await getBioHouseholdForUser({
			householdId: input.householdId,
			userId: context.user.id,
		});

		if (!household) {
			throw new ORPCError("NOT_FOUND");
		}

		const { householdId, ...setupInput } = input;

		try {
			const financialState = toHouseholdFinancialState({
				householdId,
				input: setupInput,
			});

			const updated = await completeBioHouseholdOnboarding({
				householdId,
				userId: context.user.id,
				financialState: financialState as unknown as Prisma.InputJsonValue,
			});

			if (!updated) {
				throw new ORPCError("NOT_FOUND");
			}

			return {
				household: updated,
				financialState,
			};
		} catch (error) {
			if (error instanceof BioanalytixSetupError) {
				throw new ORPCError("BAD_REQUEST", {
					message: error.message,
					data: {
						reasons: error.reasons,
					},
				});
			}

			throw error;
		}
	});

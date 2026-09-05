import { getOrCreatePrimaryBioHousehold } from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";

export const getBioanalytixOnboarding = protectedProcedure
	.route({
		method: "GET",
		path: "/bioanalytix/onboarding",
		tags: ["Bioanalytix"],
		summary: "Get Bioanalytix onboarding state",
		description: "Get or create the authenticated user's primary Bioanalytix household.",
	})
	.handler(async ({ context }) => {
		const household = await getOrCreatePrimaryBioHousehold({
			userId: context.user.id,
			name: context.user.name ? `${context.user.name}'s household` : "My household",
		});

		return {
			household,
		};
	});

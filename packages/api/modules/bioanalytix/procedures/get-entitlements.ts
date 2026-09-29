import { getPurchasesByUserId } from "@repo/database";
import { createPurchasesHelper } from "@repo/payments/lib/helper";

import { protectedProcedure } from "../../../orpc/procedures";
import { getBioanalytixEntitlements, resolveBioanalytixTierFromPlanId } from "../entitlements";

export const getBioanalytixUserEntitlements = protectedProcedure
	.route({
		method: "GET",
		path: "/bioanalytix/entitlements",
		tags: ["Bioanalytix"],
		summary: "Get Bioanalytix entitlements",
		description: "Get the current user's Bioanalytix tier and capabilities",
	})
	.handler(async ({ context: { user } }) => {
		const purchases = await getPurchasesByUserId(user.id);
		const { activePlan } = createPurchasesHelper(purchases);

		const tier = resolveBioanalytixTierFromPlanId(activePlan?.id);

		return getBioanalytixEntitlements(tier);
	});

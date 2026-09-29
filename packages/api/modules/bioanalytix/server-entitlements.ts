import { getPurchasesByUserId } from "@repo/database";
import { createPurchasesHelper } from "@repo/payments/lib/helper";

import { getBioanalytixEntitlements, resolveBioanalytixTierFromPlanId } from "./entitlements";

export async function getBioanalytixUserEntitlements(userId: string) {
	const purchases = await getPurchasesByUserId(userId);
	const { activePlan } = createPurchasesHelper(purchases);

	const tier = resolveBioanalytixTierFromPlanId(activePlan?.id);

	return getBioanalytixEntitlements(tier);
}

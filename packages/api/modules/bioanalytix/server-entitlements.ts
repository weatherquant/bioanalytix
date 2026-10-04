import { getPurchasesByUserId } from "@repo/database";
import { createPurchasesHelper } from "@repo/payments/lib/helper";

import {
	getBioanalytixEntitlements,
	isBioanalytixPaidSubscriptionStatus,
	resolveBioanalytixTierFromPlanId,
} from "./entitlements";

export async function getBioanalytixUserEntitlements(userId: string) {
	const purchases = await getPurchasesByUserId(userId);
	const { activePlan } = createPurchasesHelper(purchases);

	const tier = isBioanalytixPaidSubscriptionStatus(activePlan?.status)
		? resolveBioanalytixTierFromPlanId(activePlan?.id)
		: "free";

	return getBioanalytixEntitlements(tier);
}

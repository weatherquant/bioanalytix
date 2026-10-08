import { getPurchasesByUserId } from "@repo/database";
import { createPurchasesHelper } from "@repo/payments/lib/helper";

import {
	getBioanalytixEntitlements,
	getDevelopmentTierOverride,
	isBioanalytixPaidSubscriptionStatus,
	resolveBioanalytixTierFromPlanId,
} from "./entitlements";

export async function getBioanalytixUserEntitlements(userId: string) {
	const developmentTierOverride = getDevelopmentTierOverride();

	if (developmentTierOverride) {
		return getBioanalytixEntitlements(developmentTierOverride);
	}

	const purchases = await getPurchasesByUserId(userId);
	const { activePlan } = createPurchasesHelper(purchases);

	const tier = isBioanalytixPaidSubscriptionStatus(activePlan?.status)
		? resolveBioanalytixTierFromPlanId(activePlan?.id)
		: "free";

	return getBioanalytixEntitlements(tier);
}

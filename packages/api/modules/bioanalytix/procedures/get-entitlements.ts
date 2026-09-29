import { protectedProcedure } from "../../../orpc/procedures";
import { getBioanalytixUserEntitlements } from "../server-entitlements";

export const getBioanalytixUserEntitlementsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/bioanalytix/entitlements",
		tags: ["Bioanalytix"],
		summary: "Get Bioanalytix entitlements",
		description: "Get the current user's Bioanalytix tier and capabilities",
	})
	.handler(async ({ context: { user } }) => {
		return getBioanalytixUserEntitlements(user.id);
	});

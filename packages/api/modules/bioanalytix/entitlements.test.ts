import { describe, expect, it } from "vitest";

import {
	getBioanalytixEntitlements,
	hasBioanalytixCapability,
	isBioanalytixPaidSubscriptionStatus,
	resolveBioanalytixTierFromPlanId,
} from "./entitlements";

describe("Bioanalytix entitlements", () => {
	it("gives free users the core planning experience without DNA", () => {
		const entitlements = getBioanalytixEntitlements("free");

		expect(entitlements.capabilities.financialPlanning).toBe(true);
		expect(entitlements.capabilities.wealthPlanning).toBe(true);
		expect(entitlements.capabilities.longevityPlanning).toBe(true);
		expect(entitlements.capabilities.estatePlanning).toBe(true);
		expect(entitlements.capabilities.askBioanalytix).toBe(true);

		expect(entitlements.capabilities.dnaUpload).toBe(false);
		expect(entitlements.capabilities.geneticProfile).toBe(false);
		expect(entitlements.capabilities.personalisedResearch).toBe(false);
	});

	it("adds personal biological capabilities for individual users", () => {
		const entitlements = getBioanalytixEntitlements("individual");

		expect(entitlements.capabilities.dnaUpload).toBe(true);
		expect(entitlements.capabilities.geneticProfile).toBe(true);
		expect(entitlements.capabilities.personalisedResearch).toBe(true);

		expect(entitlements.capabilities.clientManagement).toBe(false);
		expect(entitlements.capabilities.organizationWorkspace).toBe(false);
	});

	it("adds organization capabilities for professional users", () => {
		const entitlements = getBioanalytixEntitlements("professional");

		expect(entitlements.capabilities.dnaUpload).toBe(true);
		expect(entitlements.capabilities.clientManagement).toBe(true);
		expect(entitlements.capabilities.organizationWorkspace).toBe(true);
	});

	it("checks individual capabilities", () => {
		const free = getBioanalytixEntitlements("free");

		expect(hasBioanalytixCapability(free, "wealthPlanning")).toBe(true);
		expect(hasBioanalytixCapability(free, "dnaUpload")).toBe(false);
	});
});

describe("Bioanalytix tier resolution", () => {
	it("maps the current paid consumer plan to individual", () => {
		expect(resolveBioanalytixTierFromPlanId("pro")).toBe("individual");
	});

	it("maps no purchase or the free plan to free", () => {
		expect(resolveBioanalytixTierFromPlanId(undefined)).toBe("free");
		expect(resolveBioanalytixTierFromPlanId(null)).toBe("free");
		expect(resolveBioanalytixTierFromPlanId("free")).toBe("free");
	});

	it("does not grant paid entitlements for legacy or unknown plans", () => {
		expect(resolveBioanalytixTierFromPlanId("lifetime")).toBe("free");
		expect(resolveBioanalytixTierFromPlanId("enterprise")).toBe("free");
		expect(resolveBioanalytixTierFromPlanId("future-plan")).toBe("free");
	});
});

describe("Bioanalytix paid subscription status", () => {
	it("allows active and trialing subscriptions", () => {
		expect(isBioanalytixPaidSubscriptionStatus("active")).toBe(true);
		expect(isBioanalytixPaidSubscriptionStatus("trialing")).toBe(true);
	});

	it("fails closed for non-entitling subscription states", () => {
		expect(isBioanalytixPaidSubscriptionStatus("canceled")).toBe(false);
		expect(isBioanalytixPaidSubscriptionStatus("expired")).toBe(false);
		expect(isBioanalytixPaidSubscriptionStatus("incomplete")).toBe(false);
		expect(isBioanalytixPaidSubscriptionStatus("incomplete_expired")).toBe(false);
		expect(isBioanalytixPaidSubscriptionStatus("past_due")).toBe(false);
		expect(isBioanalytixPaidSubscriptionStatus("paused")).toBe(false);
		expect(isBioanalytixPaidSubscriptionStatus("unpaid")).toBe(false);
	});

	it("fails closed for missing or unknown subscription states", () => {
		expect(isBioanalytixPaidSubscriptionStatus(undefined)).toBe(false);
		expect(isBioanalytixPaidSubscriptionStatus(null)).toBe(false);
		expect(isBioanalytixPaidSubscriptionStatus("future-status")).toBe(false);
	});
});

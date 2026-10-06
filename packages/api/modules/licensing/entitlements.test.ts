import { describe, expect, it } from "vitest";

import {
	CONSUMER_PLUS_ENTITLEMENTS,
	CONSUMER_TRIAL_ENTITLEMENTS,
	hasAllEntitlements,
	hasEntitlement,
} from "./entitlements";

describe("Bioanalytix entitlements", () => {
	it("allows a trial user to access the DNA profile", () => {
		expect(hasEntitlement(CONSUMER_TRIAL_ENTITLEMENTS, "profile.dna")).toBe(true);
	});

	it("does not expose genetics-driven scenarios on the trial tier", () => {
		expect(hasEntitlement(CONSUMER_TRIAL_ENTITLEMENTS, "scenario.genetic")).toBe(false);
	});

	it("allows consumer plus to run genetics-driven scenarios", () => {
		expect(hasEntitlement(CONSUMER_PLUS_ENTITLEMENTS, "scenario.genetic")).toBe(true);
	});

	it("supports compound capability checks", () => {
		expect(
			hasAllEntitlements(CONSUMER_PLUS_ENTITLEMENTS, [
				"profile.associations",
				"scenario.genetic",
				"simulation.protection",
			]),
		).toBe(true);
	});
});

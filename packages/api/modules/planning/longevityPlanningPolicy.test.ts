import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../financial/household/types";
import {
	LONGEVITY_PLANNING_POLICY_VERSION,
	buildLongevityPlanningPolicy,
} from "./longevityPlanningPolicy";

function householdWithPrimaryDateOfBirth(dateOfBirth: string): HouseholdFinancialState {
	return {
		id: "household-1",
		asOfDate: "2026-09-22",
		currency: "AUD",
		country: "AU",
		people: [
			{
				id: "person-1",
				role: "primary",
				dateOfBirth,
				employmentStatus: "employed",
			},
		],
		income: [],
		expenses: {
			essentialAnnual: 0,
			discretionaryAnnual: 0,
		},
		assets: [],
		superannuation: [],
		liabilities: [],
		insurance: [],
		estate: {},
		goals: [],
	};
}

describe("longevityPlanningPolicy", () => {
	it("exposes an explicit policy version", () => {
		expect(LONGEVITY_PLANNING_POLICY_VERSION).toBe("1.0.0");
	});

	it("uses explicit non-personalised MVP planning horizons", () => {
		const policy = buildLongevityPlanningPolicy(householdWithPrimaryDateOfBirth("1980-01-01"));

		expect(policy.range).toEqual({
			lowerAge: 85,
			centralAge: 95,
			upperAge: 100,
		});
	});

	it("projects through the upper planning age from the household as-of date", () => {
		const household = householdWithPrimaryDateOfBirth("1980-01-01");

		const policy = buildLongevityPlanningPolicy(household);

		expect(policy.projectionYears).toBe(55);
	});

	it("states that genetics does not automatically alter planning ages", () => {
		const policy = buildLongevityPlanningPolicy(householdWithPrimaryDateOfBirth("1980-01-01"));

		expect(
			policy.qualifications.some((qualification) =>
				qualification.toLowerCase().includes("genetic"),
			),
		).toBe(true);
	});
});

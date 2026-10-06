import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "./types";

function createHousehold(): HouseholdFinancialState {
	return {
		id: "household-1",

		asOfDate: "2026-09-01",

		currency: "AUD",

		country: "Australia",

		people: [
			{
				id: "person-1",

				role: "primary",

				dateOfBirth: "1970-09-02",

				employmentStatus: "employed",
			},
		],

		income: [
			{
				id: "income-1",

				personId: "person-1",

				type: "employment",

				annualAmount: 100000,

				taxable: true,
			},
		],

		expenses: {
			essentialAnnual: 40000,

			discretionaryAnnual: 10000,
		},

		assets: [
			{
				id: "cash-1",

				type: "cash",

				value: 100000,

				ownerPersonIds: ["person-1"],

				liquid: true,

				investable: true,

				incomeProducing: false,
			},
		],

		superannuation: [
			{
				id: "super-1",

				personId: "person-1",

				balance: 300000,

				annualContribution: 10000,

				preserved: true,
			},
		],

		liabilities: [],

		insurance: [],

		estate: {
			hasWill: true,
		},

		goals: [
			{
				id: "retirement-person-1",

				type: "retirement",

				personId: "person-1",

				targetAge: 60,

				priority: "high",
			},
		],
	};
}

describe("HouseholdFinancialState", () => {
	it("represents current household facts and declared goals", () => {
		const household = createHousehold();

		expect(household.id).toBe("household-1");

		expect(household.people[0]?.dateOfBirth).toBe("1970-09-02");

		expect(household.goals[0]?.type).toBe("retirement");

		expect(household.goals[0]?.targetAge).toBe(60);
	});

	it("does not contain projection assumptions, genetic state, or deterministic longevity fields", () => {
		const household = createHousehold();

		const serialized = JSON.stringify(household);

		expect("assumptions" in household).toBe(false);

		expect(serialized).not.toContain("genotype");

		expect(serialized).not.toContain("rsid");

		expect(serialized).not.toContain("longevity_score");

		expect(serialized).not.toContain("longevityScore");

		expect(serialized).not.toContain("geneticAge");

		expect(serialized).not.toContain("assumedDeathAge");
	});
});

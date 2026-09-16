import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../household/types";
import { assessEstatePosition } from "./estateAnalysis";

function household(): HouseholdFinancialState {
	return {
		id: "estate-test",
		asOfDate: "2026-09-16",
		currency: "AUD",
		country: "AU",

		people: [
			{
				id: "person-1",
				role: "primary",
				dateOfBirth: "1970-01-01",
				employmentStatus: "employed",
			},
		],

		income: [],

		expenses: {
			essentialAnnual: 60_000,
			discretionaryAnnual: 20_000,
		},

		assets: [
			{
				id: "cash",
				type: "cash",
				value: 100_000,
				liquid: true,
				investable: true,
				incomeProducing: false,
			},
			{
				id: "home",
				type: "property",
				value: 800_000,
				liquid: false,
				investable: false,
				incomeProducing: false,
			},
		],

		superannuation: [
			{
				id: "super-1",
				personId: "person-1",
				balance: 400_000,
				preserved: true,
			},
		],

		liabilities: [
			{
				id: "mortgage",
				type: "mortgage",
				balance: 300_000,
			},
		],

		insurance: [],

		estate: {
			hasWill: true,
			hasEnduringPowerOfAttorney: true,
			hasSuperBeneficiaryNomination: true,
		},

		goals: [
			{
				id: "estate-goal",
				type: "estate",
				targetAmount: 600_000,
				priority: "medium",
			},
		],
	};
}

describe("assessEstatePosition", () => {
	it("summarises current net household resources", () => {
		const result = assessEstatePosition(household());

		expect(result.totalAssets).toBe(1_300_000);
		expect(result.totalLiabilities).toBe(300_000);
		expect(result.netHouseholdResources).toBe(1_000_000);

		expect(result.inheritanceGoal).toBe(600_000);
		expect(result.currentSurplusOrShortfallToGoal).toBe(400_000);
	});

	it("recognises strong current economics and complete documentation", () => {
		const result = assessEstatePosition(household());

		expect(result.economicAssessment).toBe("strong");
		expect(result.documentationAssessment).toBe("strong");
		expect(result.assessment).toBe("strong");
	});

	it("recommends review when documentation is incomplete despite strong economics", () => {
		const input = household();

		input.estate.hasWill = true;
		input.estate.hasEnduringPowerOfAttorney = undefined;
		input.estate.hasSuperBeneficiaryNomination = false;

		const result = assessEstatePosition(input);

		expect(result.economicAssessment).toBe("strong");
		expect(result.documentationAssessment).toBe("worth_reviewing");
		expect(result.assessment).toBe("worth_reviewing");
	});

	it("does not treat absence of an inheritance goal as an estate deficiency", () => {
		const input = household();

		input.goals = [];

		const result = assessEstatePosition(input);

		expect(result.inheritanceGoal).toBeNull();
		expect(result.economicAssessment).toBe("comfortable");
		expect(result.assessment).toBe("comfortable");
	});

	it("flags negative current net household resources as exposed", () => {
		const input = household();

		input.liabilities = [
			{
				id: "large-debt",
				type: "other",
				balance: 1_500_000,
			},
		];

		const result = assessEstatePosition(input);

		expect(result.netHouseholdResources).toBe(-200_000);
		expect(result.economicAssessment).toBe("exposed");
		expect(result.assessment).toBe("exposed");
	});
});

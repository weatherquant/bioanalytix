import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import type { MarketPath, PortfolioStrategy } from "../simulation/types";
import { compareRetirementSpendingProfiles } from "./compareRetirementSpendingProfiles";

function household(): HouseholdFinancialState {
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

		income: [],

		expenses: {
			essentialAnnual: 0,

			discretionaryAnnual: 0,
		},

		assets: [
			{
				id: "cash",

				type: "cash",

				value: 5_000_000,

				liquid: true,

				investable: true,

				incomeProducing: false,
			},
		],

		superannuation: [],

		liabilities: [],

		insurance: [],

		estate: {},

		goals: [],
	};
}

function assumptions(): ProjectionAssumptions {
	return {
		inflationRate: 0,

		wageGrowthRate: 0,

		spendingGrowthRate: 0,

		cashReturnRate: 0,

		investmentReturnRate: 0,

		superReturnRate: 0,

		effectiveTaxRate: 0,

		projectionEndDate: "2059-09-01",
	};
}

function strategy(): PortfolioStrategy {
	return {
		id: "balanced",

		name: "Balanced",

		workingAllocation: {
			growth: 0.6,
			defensive: 0.35,
			cash: 0.05,
		},

		transitionAllocation: {
			growth: 0.6,
			defensive: 0.35,
			cash: 0.05,
		},

		retirementAllocation: {
			growth: 0.6,
			defensive: 0.35,
			cash: 0.05,
		},

		transitionYearsBeforeRetirement: 3,
	};
}

function marketPath(simulationIndex: number): MarketPath {
	return {
		simulationIndex,

		years: Array.from({ length: 33 }, (_, yearIndex) => ({
			yearIndex,

			growthReturn: 0,

			defensiveReturn: 0,

			cashReturn: 0,

			inflationRate: 0,
		})),
	};
}

describe("compareRetirementSpendingProfiles", () => {
	it("compares flat and age-adjusted spending using the same financial assumptions", () => {
		const result = compareRetirementSpendingProfiles({
			household: household(),

			assumptions: assumptions(),

			retirementAge: 60,

			annualRetirementSpending: 80_000,

			strategy: strategy(),

			marketPaths: [marketPath(0), marketPath(1)],
		});

		expect(result.simulationCount).toBe(2);

		expect(result.flat.id).toBe("flat");

		expect(result.ageAdjusted.id).toBe("age_adjusted");

		expect(result.ageAdjustedWithCare).toBeUndefined();

		expect(result.ageAdjusted.summary.endingNetWorth.percentiles.p50).toBeGreaterThan(
			result.flat.summary.endingNetWorth.percentiles.p50,
		);
	});

	it("shows the financial effect of an explicit later-life care scenario", () => {
		const result = compareRetirementSpendingProfiles({
			household: household(),

			assumptions: assumptions(),

			retirementAge: 60,

			annualRetirementSpending: 80_000,

			strategy: strategy(),

			marketPaths: [marketPath(0), marketPath(1)],

			laterLifeCare: {
				startAge: 85,

				annualCost: 50_000,

				durationYears: 3,
			},
		});

		expect(result.ageAdjustedWithCare).toBeDefined();

		const flatAge85 = result.flat.summary.years.find((year) => year.primaryAge === 85);

		const ageAdjustedAge85 = result.ageAdjusted.summary.years.find(
			(year) => year.primaryAge === 85,
		);

		const careAge85 = result.ageAdjustedWithCare!.summary.years.find(
			(year) => year.primaryAge === 85,
		);

		expect(flatAge85?.retirementSpending.percentiles.p50).toBe(80_000);

		expect(ageAdjustedAge85?.retirementSpending.percentiles.p50).toBe(64_000);

		expect(careAge85?.retirementSpending.percentiles.p50).toBe(114_000);

		expect(result.ageAdjustedWithCare!.summary.endingNetWorth.percentiles.p50).toBeLessThan(
			result.ageAdjusted.summary.endingNetWorth.percentiles.p50,
		);
	});

	it("rejects an empty set of market paths", () => {
		expect(() =>
			compareRetirementSpendingProfiles({
				household: household(),

				assumptions: assumptions(),

				retirementAge: 60,

				annualRetirementSpending: 80_000,

				strategy: strategy(),

				marketPaths: [],
			}),
		).toThrow("At least one market path is required.");
	});
});

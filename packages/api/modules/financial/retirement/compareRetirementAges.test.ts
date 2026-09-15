import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import type { MarketPath } from "../simulation/types";
import { compareRetirementAges } from "./compareRetirementAges";

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
			essentialAnnual: 0,
			discretionaryAnnual: 0,
		},

		assets: [],

		superannuation: [
			{
				id: "super-1",
				personId: "person-1",
				balance: 500000,
				annualContribution: 10000,
				preserved: true,
			},
		],

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
		effectiveTaxRate: 0.3,
		projectionEndDate: "2040-09-01",
	};
}

function marketPath(simulationIndex: number): MarketPath {
	return {
		simulationIndex,

		years: Array.from(
			{
				length: 14,
			},

			(_, yearIndex) => ({
				yearIndex,
				growthReturn: 0.06,
				defensiveReturn: 0.03,
				cashReturn: 0.02,
				inflationRate: 0,
			}),
		),
	};
}

describe("compareRetirementAges", () => {
	it("compares two retirement ages using the same strategies and market paths", () => {
		const paths = Array.from(
			{
				length: 10,
			},

			(_, simulationIndex) => marketPath(simulationIndex),
		);

		const result = compareRetirementAges({
			household: household(),

			assumptions: assumptions(),

			baselineRetirementAge: 60,

			alternativeRetirementAge: 55,

			marketPaths: paths,

			maximumShortfallProbability: 0.1,

			maximumAnnualSpending: 200000,

			spendingPrecision: 1000,
		});

		expect(result.baselineRetirementAge).toBe(60);

		expect(result.alternativeRetirementAge).toBe(55);

		expect(result.baseline.outcomes).toHaveLength(5);

		expect(result.alternative.outcomes).toHaveLength(5);

		expect(result.differences).toHaveLength(5);

		expect(result.baseline.outcomes.map((outcome) => outcome.strategyId)).toEqual(
			result.alternative.outcomes.map((outcome) => outcome.strategyId),
		);

		for (const difference of result.differences) {
			expect(difference.alternativeAnnualRetirementIncome).toBeLessThanOrEqual(
				difference.baselineAnnualRetirementIncome,
			);

			expect(difference.annualIncomeDifference).toBe(
				difference.alternativeAnnualRetirementIncome -
					difference.baselineAnnualRetirementIncome,
			);
		}
	});

	it("rejects an invalid retirement age", () => {
		expect(() =>
			compareRetirementAges({
				household: household(),

				assumptions: assumptions(),

				baselineRetirementAge: 0,

				alternativeRetirementAge: 55,

				marketPaths: [marketPath(0)],

				maximumShortfallProbability: 0.1,

				maximumAnnualSpending: 200000,
			}),
		).toThrow("Baseline retirement age must be a positive finite number.");
	});
});

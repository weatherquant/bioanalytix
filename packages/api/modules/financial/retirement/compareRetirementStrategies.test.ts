import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import type { MarketPath } from "../simulation/types";
import { compareRetirementStrategies } from "./compareRetirementStrategies";

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

		assets: [],

		superannuation: [
			{
				id: "super-1",
				personId: "person-1",
				balance: 500000,
				annualContribution: 0,
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
		projectionEndDate: "2031-09-01",
	};
}

function marketPath(
	simulationIndex: number,
	growthReturn: number,
	defensiveReturn: number,
	cashReturn: number,
): MarketPath {
	return {
		simulationIndex,

		years: Array.from(
			{
				length: 5,
			},

			(_, yearIndex) => ({
				yearIndex,
				growthReturn,
				defensiveReturn,
				cashReturn,
				inflationRate: 0,
			}),
		),
	};
}

describe("compareRetirementStrategies", () => {
	it("compares all five standard strategies in the intended risk order", () => {
		const paths = [
			marketPath(0, 0.08, 0.03, 0.02),
			marketPath(1, 0.08, 0.03, 0.02),
			marketPath(2, 0.08, 0.03, 0.02),
			marketPath(3, 0.08, 0.03, 0.02),
			marketPath(4, 0.08, 0.03, 0.02),
			marketPath(5, 0.08, 0.03, 0.02),
			marketPath(6, 0.08, 0.03, 0.02),
			marketPath(7, 0.08, 0.03, 0.02),
			marketPath(8, 0.08, 0.03, 0.02),
			marketPath(9, 0.08, 0.03, 0.02),
		];

		const result = compareRetirementStrategies({
			household: household(),

			assumptions: assumptions(),

			retirementAge: 55,

			marketPaths: paths,

			maximumShortfallProbability: 0.1,

			maximumAnnualSpending: 200000,

			spendingPrecision: 1000,
		});

		expect(result.outcomes).toHaveLength(5);

		expect(result.outcomes.map((outcome) => outcome.strategyId)).toEqual([
			"capital_stable",
			"conservative",
			"balanced",
			"growth",
			"high_growth",
		]);

		expect(result.outcomes.map((outcome) => outcome.riskLevel)).toEqual([
			"lower",
			"low_moderate",
			"moderate",
			"higher",
			"highest",
		]);

		for (const outcome of result.outcomes) {
			/*
			 * Every strategy must be evaluated against
			 * exactly the same supplied set of paths.
			 */
			expect(outcome.simulationCount).toBe(paths.length);

			expect(outcome.result.assessment.simulationCount).toBe(paths.length);

			expect(outcome.sustainableAnnualRetirementIncome).toBeGreaterThanOrEqual(0);
		}

		expect(result.simulationCount).toBe(paths.length);

		expect(result.highestSustainableIncome).toBeGreaterThanOrEqual(
			result.lowestSustainableIncome,
		);

		expect(result.incomeRange).toBe(
			result.highestSustainableIncome - result.lowestSustainableIncome,
		);
	});

	it("fails closed when no market paths are supplied", () => {
		expect(() =>
			compareRetirementStrategies({
				household: household(),

				assumptions: assumptions(),

				retirementAge: 55,

				marketPaths: [],

				maximumShortfallProbability: 0.1,

				maximumAnnualSpending: 200000,
			}),
		).toThrow("Retirement strategy comparison requires at least one market path.");
	});
});

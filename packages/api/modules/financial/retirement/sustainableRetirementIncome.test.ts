import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import type { MarketPath, PortfolioStrategy } from "../simulation/types";
import { findSustainableRetirementIncome } from "./sustainableRetirementIncome";

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
				balance: 100000,
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
		effectiveTaxRate: 0,
		projectionEndDate: "2028-09-01",
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

		transitionYearsBeforeRetirement: 0,
	};
}

function flatMarketPath(simulationIndex: number): MarketPath {
	return {
		simulationIndex,

		years: [
			{
				yearIndex: 0,
				growthReturn: 0,
				defensiveReturn: 0,
				cashReturn: 0,
				inflationRate: 0,
			},
			{
				yearIndex: 1,
				growthReturn: 0,
				defensiveReturn: 0,
				cashReturn: 0,
				inflationRate: 0,
			},
		],
	};
}

describe("findSustainableRetirementIncome", () => {
	it("finds the highest retirement spending level that meets the shortfall target", () => {
		const result = findSustainableRetirementIncome({
			household: household(),

			assumptions: assumptions(),

			retirementAge: 55,

			strategy: strategy(),

			marketPaths: [
				flatMarketPath(0),
				flatMarketPath(1),
				flatMarketPath(2),
				flatMarketPath(3),
				flatMarketPath(4),
				flatMarketPath(5),
				flatMarketPath(6),
				flatMarketPath(7),
				flatMarketPath(8),
				flatMarketPath(9),
			],

			maximumShortfallProbability: 0.1,

			maximumAnnualSpending: 100000,

			spendingPrecision: 1000,
		});

		/*
		 * The household starts retirement with $100,000
		 * and the projection covers two retirement years.
		 *
		 * With zero investment return, $50,000 p.a. can
		 * be fully funded for both years.
		 *
		 * At $51,000 p.a. the second year becomes partly
		 * unfunded on every market path.
		 *
		 * Therefore the sustainable boundary is $50,000.
		 */
		expect(result.sustainableAnnualRetirementIncome).toBe(50000);

		expect(result.assessment.annualRetirementSpending).toBe(50000);

		expect(result.assessment.pathsWithUnfundedCashFlow).toBe(0);

		expect(result.assessment.shortfallProbability).toBe(0);

		expect(result.assessment.meetsResilienceTarget).toBe(true);

		expect(result.assessment.simulationCount).toBe(10);
	});

	it("reduces sustainable spending when an inheritance objective is applied", () => {
		const result = findSustainableRetirementIncome({
			household: household(),

			assumptions: assumptions(),

			retirementAge: 55,

			strategy: strategy(),

			marketPaths: [
				flatMarketPath(0),
				flatMarketPath(1),
				flatMarketPath(2),
				flatMarketPath(3),
				flatMarketPath(4),
				flatMarketPath(5),
				flatMarketPath(6),
				flatMarketPath(7),
				flatMarketPath(8),
				flatMarketPath(9),
			],

			maximumShortfallProbability: 0.1,

			inheritanceObjective: {
				minimumEndingNetWorth: 40000,
				maximumShortfallProbability: 0.1,
			},

			maximumAnnualSpending: 100000,

			spendingPrecision: 1000,
		});

		/*
		 * The household starts with $100,000 and the
		 * projection covers two retirement years.
		 *
		 * Preserving $40,000 therefore leaves $60,000
		 * available across those two years: $30,000 p.a.
		 */
		expect(result.sustainableAnnualRetirementIncome).toBe(30000);

		expect(result.assessment.meetsResilienceTarget).toBe(true);

		expect(result.assessment.inheritanceObjective).toEqual({
			minimumEndingNetWorth: 40000,
			pathsBelowObjective: 0,
			shortfallProbability: 0,
			maximumShortfallProbability: 0.1,
			meetsObjective: true,
		});

		expect(result.assessment.meetsAllTargets).toBe(true);
	});

	it("preserves existing behaviour when no inheritance objective is supplied", () => {
		const result = findSustainableRetirementIncome({
			household: household(),

			assumptions: assumptions(),

			retirementAge: 55,

			strategy: strategy(),

			marketPaths: [flatMarketPath(0)],

			maximumShortfallProbability: 0.1,

			maximumAnnualSpending: 100000,

			spendingPrecision: 1000,
		});

		expect(result.sustainableAnnualRetirementIncome).toBe(50000);

		expect(result.assessment.inheritanceObjective).toBeUndefined();

		expect(result.assessment.meetsAllTargets).toBe(true);
	});

	it("reports when an inheritance objective is not achievable even with zero retirement spending", () => {
		const result = findSustainableRetirementIncome({
			household: household(),

			assumptions: assumptions(),

			retirementAge: 55,

			strategy: strategy(),

			marketPaths: [flatMarketPath(0)],

			maximumShortfallProbability: 0.1,

			inheritanceObjective: {
				minimumEndingNetWorth: 150000,
				maximumShortfallProbability: 0.1,
			},

			maximumAnnualSpending: 100000,

			spendingPrecision: 1000,
		});

		expect(result.sustainableAnnualRetirementIncome).toBe(0);

		expect(result.assessment.inheritanceObjective?.meetsObjective).toBe(false);

		expect(result.assessment.inheritanceObjective?.shortfallProbability).toBe(1);

		expect(result.assessment.meetsAllTargets).toBe(false);

		expect(result.iterations).toBe(0);
	});

	it("rejects an empty set of market paths", () => {
		expect(() =>
			findSustainableRetirementIncome({
				household: household(),

				assumptions: assumptions(),

				retirementAge: 55,

				strategy: strategy(),

				marketPaths: [],

				maximumShortfallProbability: 0.1,

				maximumAnnualSpending: 100000,
			}),
		).toThrow("Sustainable retirement income requires at least one market path.");
	});

	it("rejects an invalid shortfall probability", () => {
		expect(() =>
			findSustainableRetirementIncome({
				household: household(),

				assumptions: assumptions(),

				retirementAge: 55,

				strategy: strategy(),

				marketPaths: [flatMarketPath(0)],

				maximumShortfallProbability: 1.1,

				maximumAnnualSpending: 100000,
			}),
		).toThrow("Maximum shortfall probability must be between 0 and 1.");
	});
});

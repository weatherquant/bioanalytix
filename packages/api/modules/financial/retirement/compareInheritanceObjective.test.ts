import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import type { MarketPath, PortfolioStrategy } from "../simulation/types";
import { compareInheritanceObjective } from "./compareInheritanceObjective";

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

describe("compareInheritanceObjective", () => {
	it("isolates the retirement spending trade-off created by an inheritance objective", () => {
		const result = compareInheritanceObjective({
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

			inheritanceTargetAmount: 40000,

			maximumInheritanceShortfallProbability: 0.1,

			maximumAnnualSpending: 100000,

			spendingPrecision: 1000,
		});

		expect(result.baselineAnnualRetirementIncome).toBe(50000);

		expect(result.withInheritanceObjectiveAnnualRetirementIncome).toBe(30000);

		expect(result.annualRetirementIncomeDifference).toBe(-20000);

		expect(result.percentageDifference).toBe(-0.4);

		expect(result.objectiveAchievableAtZeroSpending).toBe(true);

		expect(result.baseline.strategyId).toBe(result.withInheritanceObjective.strategyId);

		expect(result.baseline.assessment.simulationCount).toBe(10);

		expect(result.withInheritanceObjective.assessment.simulationCount).toBe(10);
	});

	it("reports an inheritance objective that cannot be met even at zero spending", () => {
		const result = compareInheritanceObjective({
			household: household(),

			assumptions: assumptions(),

			retirementAge: 55,

			strategy: strategy(),

			marketPaths: [flatMarketPath(0)],

			maximumShortfallProbability: 0.1,

			inheritanceTargetAmount: 150000,

			maximumInheritanceShortfallProbability: 0.1,

			maximumAnnualSpending: 100000,

			spendingPrecision: 1000,
		});

		expect(result.objectiveAchievableAtZeroSpending).toBe(false);

		expect(result.withInheritanceObjectiveAnnualRetirementIncome).toBe(0);

		expect(result.withInheritanceObjective.assessment.meetsAllTargets).toBe(false);
	});

	it("rejects an invalid inheritance target", () => {
		expect(() =>
			compareInheritanceObjective({
				household: household(),

				assumptions: assumptions(),

				retirementAge: 55,

				strategy: strategy(),

				marketPaths: [flatMarketPath(0)],

				maximumShortfallProbability: 0.1,

				inheritanceTargetAmount: -1,

				maximumInheritanceShortfallProbability: 0.1,

				maximumAnnualSpending: 100000,
			}),
		).toThrow("Inheritance target amount must be a non-negative finite number.");
	});
});

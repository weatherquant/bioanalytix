import { describe, expect, it } from "vitest";

import type { LifecycleSimulationResult, LifecycleYear } from "../simulation/lifecycleTypes";
import type { PortfolioStrategy } from "../simulation/types";
import { buildWealthViewModel, WealthViewModelError } from "./wealthViewModel";

const testStrategy: PortfolioStrategy = {
	id: "test-strategy",

	name: "Test strategy",

	workingAllocation: {
		growth: 0.6,
		defensive: 0.3,
		cash: 0.1,
	},

	transitionAllocation: {
		growth: 0.5,
		defensive: 0.4,
		cash: 0.1,
	},

	retirementAllocation: {
		growth: 0.4,
		defensive: 0.5,
		cash: 0.1,
	},

	transitionYearsBeforeRetirement: 3,
};

function lifecycleYear(
	yearIndex: number,
	primaryAge: number,
	netWorth: number,
	liquidWealth: number,
	superannuation: number,
	unfundedCashFlow = 0,
): LifecycleYear {
	return {
		yearIndex,

		projectionDate: `${2030 + yearIndex}-01-01`,

		primaryAge,

		phase: primaryAge >= 65 ? "retired" : "working",

		allocation: testStrategy.retirementAllocation,

		growthReturn: 0,

		defensiveReturn: 0,

		cashReturn: 0,

		portfolioReturn: 0,

		inflationRate: 0,

		afterTaxIncome: 0,

		retirementSafetyNetIncome: 0,

		livingExpenses: 0,

		retirementSpending: 0,

		insurancePremiums: 0,

		debtRepayments: 0,

		superContributions: 0,

		netCashFlow: 0,

		unfundedCashFlow,

		cashAssets: liquidWealth,

		nonSuperInvestableWealth: 0,

		superannuation,

		liabilities: 0,

		netWorth,
	};
}

function simulation(simulationIndex: number, netWorths: number[]): LifecycleSimulationResult {
	const years = [
		lifecycleYear(0, 60, netWorths[0]!, netWorths[0]! * 0.4, netWorths[0]! * 0.5),

		lifecycleYear(1, 70, netWorths[1]!, netWorths[1]! * 0.35, netWorths[1]! * 0.5),

		lifecycleYear(2, 80, netWorths[2]!, netWorths[2]! * 0.3, netWorths[2]! * 0.5),

		lifecycleYear(3, 90, netWorths[3]!, netWorths[3]! * 0.25, netWorths[3]! * 0.5),

		lifecycleYear(4, 95, netWorths[4]!, netWorths[4]! * 0.2, netWorths[4]! * 0.5),
	];

	return {
		householdId: "household-1",

		strategyId: testStrategy.id,

		simulationIndex,

		plan: {
			retirementAge: 65,
			annualRetirementSpending: 70000,
		},

		strategy: testStrategy,

		years,

		summary: {
			startingNetWorth: years[0]!.netWorth,

			endingNetWorth: years[years.length - 1]!.netWorth,

			minimumLiquidWealth: Math.min(
				...years.map((year) => year.cashAssets + year.nonSuperInvestableWealth),
			),

			totalUnfundedCashFlow: years.reduce((sum, year) => sum + year.unfundedCashFlow, 0),

			endingSuperannuation: years[years.length - 1]!.superannuation,

			endingNonSuperInvestableWealth: years[years.length - 1]!.nonSuperInvestableWealth,

			totalRetirementSafetyNetIncome: 0,
		},
	};
}

describe("buildWealthViewModel", () => {
	it("maps lifecycle distributions into wealth percentile curves", () => {
		const results = [
			simulation(0, [800000, 760000, 650000, 500000, 400000]),
			simulation(1, [1000000, 950000, 850000, 700000, 600000]),
			simulation(2, [1200000, 1140000, 1050000, 900000, 800000]),
			simulation(3, [1400000, 1330000, 1250000, 1100000, 1000000]),
			simulation(4, [1600000, 1520000, 1450000, 1300000, 1200000]),
		];

		const viewModel = buildWealthViewModel(results, {
			lowerAge: 88,
			centralAge: 92,
			upperAge: 96,
		});

		expect(viewModel.simulationCount).toBe(5);

		expect(viewModel.projection).toHaveLength(5);

		expect(viewModel.projection[0]!.p25NetWealth).toBe(1000000);

		expect(viewModel.projection[0]!.medianNetWealth).toBe(1200000);

		expect(viewModel.projection[0]!.p75NetWealth).toBe(1400000);
	});

	it("uses the projection year closest to the central longevity age", () => {
		const results = [
			simulation(0, [800000, 760000, 650000, 500000, 400000]),
			simulation(1, [1000000, 950000, 850000, 700000, 600000]),
			simulation(2, [1200000, 1140000, 1050000, 900000, 800000]),
		];

		const viewModel = buildWealthViewModel(results, {
			lowerAge: 88,
			centralAge: 92,
			upperAge: 96,
		});

		expect(viewModel.atPlanningAge.age).toBe(90);

		expect(viewModel.atPlanningAge.medianNetWealth).toBe(700000);
	});

	it("preserves the longevity planning range", () => {
		const results = [
			simulation(0, [800000, 760000, 650000, 500000, 400000]),
			simulation(1, [1000000, 950000, 850000, 700000, 600000]),
			simulation(2, [1200000, 1140000, 1050000, 900000, 800000]),
		];

		const longevity = {
			lowerAge: 87,
			centralAge: 91,
			upperAge: 97,
		};

		const viewModel = buildWealthViewModel(results, longevity);

		expect(viewModel.longevity).toEqual(longevity);
	});

	it("rejects an invalid longevity range", () => {
		const results = [simulation(0, [800000, 760000, 650000, 500000, 400000])];

		expect(() =>
			buildWealthViewModel(results, {
				lowerAge: 95,
				centralAge: 90,
				upperAge: 100,
			}),
		).toThrow(WealthViewModelError);
	});
});

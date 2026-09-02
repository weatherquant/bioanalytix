import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import { runLifecycleSimulation } from "./lifecycleSimulation";
import { LifecycleSimulationError, type LifecyclePlan } from "./lifecycleTypes";
import type { MarketPath, PortfolioStrategy } from "./types";

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
			essentialAnnual: 50000,

			discretionaryAnnual: 20000,
		},

		assets: [
			{
				id: "cash",

				type: "cash",

				value: 20000,

				liquid: true,

				investable: true,

				incomeProducing: false,
			},

			{
				id: "portfolio",

				type: "investment",

				value: 100000,

				liquid: true,

				investable: true,

				incomeProducing: true,
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

		projectionEndDate: "2046-09-01",
	};
}

function plan(): LifecyclePlan {
	return {
		retirementAge: 60,

		annualRetirementSpending: 70000,
	};
}

function strategy(): PortfolioStrategy {
	return {
		id: "balanced",

		name: "Balanced",

		workingAllocation: {
			growth: 0.7,

			defensive: 0.2,

			cash: 0.1,
		},

		transitionAllocation: {
			growth: 0.6,

			defensive: 0.3,

			cash: 0.1,
		},

		retirementAllocation: {
			growth: 0.5,

			defensive: 0.4,

			cash: 0.1,
		},

		transitionYearsBeforeRetirement: 3,
	};
}

function flatMarketPath(years = 20): MarketPath {
	return {
		simulationIndex: 0,

		years: Array.from(
			{
				length: years,
			},

			(_, yearIndex) => ({
				yearIndex,

				growthReturn: 0,

				defensiveReturn: 0,

				cashReturn: 0,

				inflationRate: 0,
			}),
		),
	};
}

describe("runLifecycleSimulation", () => {
	it("projects the household across the requested calendar horizon", () => {
		const result = runLifecycleSimulation({
			household: household(),

			assumptions: assumptions(),

			plan: plan(),

			strategy: strategy(),

			marketPath: flatMarketPath(),
		});

		expect(result.years).toHaveLength(21);

		expect(result.years[0]?.projectionDate).toBe("2026-09-01");

		expect(result.years[20]?.projectionDate).toBe("2046-09-01");
	});

	it("uses working, transition and retired allocations at the appropriate ages", () => {
		const result = runLifecycleSimulation({
			household: household(),

			assumptions: assumptions(),

			plan: plan(),

			strategy: strategy(),

			marketPath: flatMarketPath(),
		});

		const age56 = result.years.find((year) => year.primaryAge === 56);

		const age58 = result.years.find((year) => year.primaryAge === 58);

		const age60 = result.years.find((year) => year.primaryAge === 60);

		expect(age56?.phase).toBe("working");

		expect(age58?.phase).toBe("retirement_transition");

		expect(age60?.phase).toBe("retired");
	});

	it("applies the portfolio allocation to the supplied market path", () => {
		const market = flatMarketPath();

		market.years[0] = {
			yearIndex: 0,

			growthReturn: 0.1,

			defensiveReturn: 0.05,

			cashReturn: 0.02,

			inflationRate: 0,
		};

		const result = runLifecycleSimulation({
			household: household(),

			assumptions: assumptions(),

			plan: plan(),

			strategy: strategy(),

			marketPath: market,
		});

		expect(result.years[1]?.portfolioReturn).toBeCloseTo(0.082);
	});

	it("stops primary employment income at retirement", () => {
		const result = runLifecycleSimulation({
			household: household(),

			assumptions: assumptions(),

			plan: plan(),

			strategy: strategy(),

			marketPath: flatMarketPath(),
		});

		const retiredYear = result.years.find(
			(year) => year.phase === "retired" && year.yearIndex > 0,
		);

		expect(retiredYear?.afterTaxIncome).toBe(0);
	});

	it("uses retirement spending after retirement rather than working-life living expenses", () => {
		const result = runLifecycleSimulation({
			household: household(),

			assumptions: assumptions(),

			plan: plan(),

			strategy: strategy(),

			marketPath: flatMarketPath(),
		});

		const retiredYear = result.years.find(
			(year) => year.phase === "retired" && year.yearIndex > 0,
		)!;

		expect(retiredYear.livingExpenses).toBe(0);

		expect(retiredYear.retirementSpending).toBe(70000);
	});

	it("draws cash and non-super investments before super", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.assets = [
			{
				id: "cash",

				type: "cash",

				value: 10000,

				liquid: true,

				investable: true,

				incomeProducing: false,
			},

			{
				id: "portfolio",

				type: "investment",

				value: 20000,

				liquid: true,

				investable: true,

				incomeProducing: true,
			},
		];

		const inputPlan = plan();

		inputPlan.retirementAge = 55;

		inputPlan.annualRetirementSpending = 40000;

		const result = runLifecycleSimulation({
			household: inputHousehold,

			assumptions: assumptions(),

			plan: inputPlan,

			strategy: strategy(),

			marketPath: flatMarketPath(),
		});

		expect(result.years[1]?.cashAssets).toBe(0);

		expect(result.years[1]?.nonSuperInvestableWealth).toBe(0);

		expect(result.years[1]?.superannuation).toBeLessThan(300000);
	});

	it("records unfunded cash flow when available retirement resources are exhausted", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.assets = [];

		inputHousehold.superannuation = [];

		const inputPlan = plan();

		inputPlan.retirementAge = 55;

		inputPlan.annualRetirementSpending = 50000;

		const result = runLifecycleSimulation({
			household: inputHousehold,

			assumptions: assumptions(),

			plan: inputPlan,

			strategy: strategy(),

			marketPath: flatMarketPath(),
		});

		expect(result.summary.totalUnfundedCashFlow).toBeGreaterThan(0);

		expect(result.summary.firstUnfundedDate).toBe("2027-09-01");
	});

	it("produces different outcomes for different strategies on the same market path", () => {
		const market = flatMarketPath();

		for (const year of market.years) {
			year.growthReturn = 0.1;

			year.defensiveReturn = 0.02;
		}

		const growthStrategy = strategy();

		const defensiveStrategy: PortfolioStrategy = {
			...strategy(),

			id: "defensive",

			name: "Defensive",

			workingAllocation: {
				growth: 0.2,

				defensive: 0.7,

				cash: 0.1,
			},

			transitionAllocation: {
				growth: 0.2,

				defensive: 0.7,

				cash: 0.1,
			},

			retirementAllocation: {
				growth: 0.2,

				defensive: 0.7,

				cash: 0.1,
			},
		};

		const growthResult = runLifecycleSimulation({
			household: household(),

			assumptions: assumptions(),

			plan: plan(),

			strategy: growthStrategy,

			marketPath: market,
		});

		const defensiveResult = runLifecycleSimulation({
			household: household(),

			assumptions: assumptions(),

			plan: plan(),

			strategy: defensiveStrategy,

			marketPath: market,
		});

		/**
		 * Compare the strategies before terminal depletion can
		 * erase the difference between their wealth paths.
		 *
		 * Both strategies experience exactly the same market
		 * sequence. The only difference is portfolio allocation.
		 */
		const comparisonYearIndex = 5;

		const growthYear = growthResult.years[comparisonYearIndex]!;

		const defensiveYear = defensiveResult.years[comparisonYearIndex]!;

		expect(growthYear.portfolioReturn).toBeGreaterThan(defensiveYear.portfolioReturn);

		expect(growthYear.superannuation).toBeGreaterThan(defensiveYear.superannuation);

		expect(growthYear.netWorth).toBeGreaterThan(defensiveYear.netWorth);
	});

	it("fails closed when the market path is shorter than the lifecycle horizon", () => {
		expect(() =>
			runLifecycleSimulation({
				household: household(),

				assumptions: assumptions(),

				plan: plan(),

				strategy: strategy(),

				marketPath: flatMarketPath(5),
			}),
		).toThrow(LifecycleSimulationError);
	});

	it("preserves the supplied annual portfolio return when there are no cash flows", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.expenses = {
			essentialAnnual: 0,
			discretionaryAnnual: 0,
		};

		inputHousehold.insurance = [];

		inputHousehold.superannuation = [];

		inputHousehold.assets = [
			{
				id: "portfolio",

				type: "investment",

				value: 100000,

				liquid: true,

				investable: true,

				incomeProducing: true,
			},
		];

		const inputAssumptions = assumptions();

		inputAssumptions.projectionEndDate = "2027-09-01";

		const market = flatMarketPath(1);

		market.years[0] = {
			yearIndex: 0,

			growthReturn: 0.1,

			defensiveReturn: 0.1,

			cashReturn: 0.1,

			inflationRate: 0,
		};

		const result = runLifecycleSimulation({
			household: inputHousehold,

			assumptions: inputAssumptions,

			plan: plan(),

			strategy: strategy(),

			marketPath: market,
		});

		expect(result.years[1]?.nonSuperInvestableWealth).toBeCloseTo(110000, 8);
	});

	it("gives mid-period positive cash flow approximately half a year of cash return", () => {
		const inputHousehold = household();

		inputHousehold.assets = [];

		inputHousehold.superannuation = [];

		inputHousehold.expenses = {
			essentialAnnual: 0,
			discretionaryAnnual: 0,
		};

		inputHousehold.income = [
			{
				id: "income",

				personId: "person-1",

				type: "employment",

				annualAmount: 100000,

				taxable: false,
			},
		];

		const inputAssumptions = assumptions();

		inputAssumptions.projectionEndDate = "2027-09-01";

		const market = flatMarketPath(1);

		market.years[0] = {
			yearIndex: 0,

			growthReturn: 0,

			defensiveReturn: 0,

			cashReturn: 0.1025,

			inflationRate: 0,
		};

		const result = runLifecycleSimulation({
			household: inputHousehold,

			assumptions: inputAssumptions,

			plan: plan(),

			strategy: strategy(),

			marketPath: market,
		});

		/**
		 * 10.25% annual return corresponds to two 5%
		 * half-period returns.
		 *
		 * The $100,000 mid-period surplus therefore receives
		 * only the second 5% return.
		 */
		expect(result.years[1]?.cashAssets).toBeCloseTo(105000, 8);
	});
});

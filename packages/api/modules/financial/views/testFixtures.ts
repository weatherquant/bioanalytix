import type { HouseholdFinancialState } from "../household/types";
import type { LifecycleSimulationResult, LifecycleYear } from "../simulation/lifecycleTypes";
import type { PortfolioStrategy } from "../simulation/types";

export const viewTestStrategy: PortfolioStrategy = {
	id: "view-test-strategy",

	name: "View test strategy",

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

function createYear(
	yearIndex: number,
	age: number,
	netWorth: number,
	unfundedCashFlow = 0,
): LifecycleYear {
	return {
		yearIndex,

		projectionDate: `${2030 + yearIndex}-01-01`,

		primaryAge: age,

		phase: age >= 65 ? "retired" : "working",

		allocation: viewTestStrategy.retirementAllocation,

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

		cashAssets: netWorth * 0.2,

		nonSuperInvestableWealth: netWorth * 0.2,

		superannuation: netWorth * 0.5,

		liabilities: 0,

		netWorth,
	};
}

export function createViewSimulation(
	simulationIndex: number,
	netWorths: number[],
): LifecycleSimulationResult {
	const ages = [60, 70, 80, 90, 95];

	if (netWorths.length !== ages.length) {
		throw new Error("View simulation fixture requires five net-worth observations.");
	}

	const years = ages.map((age, index) => createYear(index, age, netWorths[index]!));

	return {
		householdId: "household-1",

		strategyId: viewTestStrategy.id,

		simulationIndex,

		plan: {
			retirementAge: 65,
			annualRetirementSpending: 70000,
		},

		strategy: viewTestStrategy,

		years,

		summary: {
			startingNetWorth: years[0]!.netWorth,

			endingNetWorth: years[years.length - 1]!.netWorth,

			minimumLiquidWealth: Math.min(
				...years.map((year) => year.cashAssets + year.nonSuperInvestableWealth),
			),

			totalUnfundedCashFlow: 0,

			endingSuperannuation: years[years.length - 1]!.superannuation,

			endingNonSuperInvestableWealth: years[years.length - 1]!.nonSuperInvestableWealth,

			totalRetirementSafetyNetIncome: 0,
		},
	};
}

export function createViewHousehold(): HouseholdFinancialState {
	return {
		id: "household-1",

		asOfDate: "2030-01-01",

		currency: "AUD",

		country: "AU",

		people: [
			{
				id: "primary",

				role: "primary",

				dateOfBirth: "1970-01-01",

				employmentStatus: "employed",
			},
		],

		income: [],

		expenses: {
			essentialAnnual: 40000,

			discretionaryAnnual: 20000,
		},

		assets: [
			{
				id: "home",

				type: "property",

				value: 900000,

				liquid: false,

				investable: false,

				incomeProducing: false,
			},
		],

		superannuation: [],

		liabilities: [
			{
				id: "mortgage",

				type: "mortgage",

				balance: 200000,
			},
		],

		insurance: [
			{
				id: "life-cover",

				personId: "primary",

				type: "life",

				sumInsured: 500000,

				annualPremium: 1200,
			},
		],

		estate: {
			hasWill: true,

			hasEnduringPowerOfAttorney: true,

			hasSuperBeneficiaryNomination: false,
		},

		goals: [
			{
				id: "estate-goal",

				type: "estate",

				description: "Desired inheritance",

				targetAmount: 600000,

				priority: "high",
			},
		],
	};
}

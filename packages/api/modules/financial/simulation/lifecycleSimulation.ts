import type { Asset, HouseholdFinancialState, IncomeSource, Person } from "../household/types";
import { calculateAgeOnDate, validateHouseholdFinancialState } from "../household/validation";
import { isValidIsoDate } from "../household/validation";
import { assessLifecycleSafetyNet } from "../retirement/lifecycleSafetyNet";
import {
	LifecycleSimulationError,
	type LifecycleSimulationInput,
	type LifecycleSimulationResult,
	type LifecycleYear,
} from "./lifecycleTypes";
import {
	allocationForPhase,
	calculatePortfolioReturn,
	lifecyclePhaseForAge,
	validatePortfolioStrategy,
} from "./portfolioStrategy";

function addYearsToIsoDate(isoDate: string, years: number): string {
	const [yearText, monthText, dayText] = isoDate.split("-");

	const year = Number(yearText) + years;

	const month = Number(monthText);

	const day = Number(dayText);

	const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

	return [
		String(year).padStart(4, "0"),
		String(month).padStart(2, "0"),
		String(Math.min(day, lastDay)).padStart(2, "0"),
	].join("-");
}

function primaryPerson(household: HouseholdFinancialState): Person {
	const primary = household.people.find((person) => person.role === "primary");

	if (!primary) {
		throw new LifecycleSimulationError(
			"Lifecycle simulation cannot identify the primary person.",
			["Household must contain a primary person."],
		);
	}

	return primary;
}

function validateInput(input: LifecycleSimulationInput): void {
	const reasons: string[] = [];

	const householdValidation = validateHouseholdFinancialState(input.household);

	if (!householdValidation.valid) {
		reasons.push(...householdValidation.errors.map((issue) => issue.message));
	}

	if (
		!Number.isInteger(input.plan.retirementAge) ||
		input.plan.retirementAge < 0 ||
		input.plan.retirementAge > 120
	) {
		reasons.push("Retirement age must be an integer between 0 and 120.");
	}

	if (
		!Number.isFinite(input.plan.annualRetirementSpending) ||
		input.plan.annualRetirementSpending < 0
	) {
		reasons.push("Annual retirement spending must be a non-negative finite number.");
	}

	if (!isValidIsoDate(input.assumptions.projectionEndDate)) {
		reasons.push("Projection end date must be a valid ISO date.");
	}

	if (input.assumptions.projectionEndDate <= input.household.asOfDate) {
		reasons.push("Projection end date must be after the household as-of date.");
	}

	const rateChecks: Array<[number, string]> = [
		[input.assumptions.wageGrowthRate, "Wage growth rate"],
		[input.assumptions.effectiveTaxRate, "Effective tax rate"],
	];

	for (const [value, label] of rateChecks) {
		if (!Number.isFinite(value)) {
			reasons.push(`${label} must be finite.`);
		}
	}

	if (input.assumptions.effectiveTaxRate < 0 || input.assumptions.effectiveTaxRate > 1) {
		reasons.push("Effective tax rate must be between 0 and 1.");
	}

	const numberOfYears =
		Number(input.assumptions.projectionEndDate.slice(0, 4)) -
		Number(input.household.asOfDate.slice(0, 4));

	if (input.assumptions.projectionEndDate.slice(5) !== input.household.asOfDate.slice(5)) {
		reasons.push(
			"Projection end date must fall on an annual anniversary of the household as-of date for Lifecycle Simulation v1.",
		);
	}

	if (input.marketPath.years.length < numberOfYears) {
		reasons.push(
			"Market path does not contain enough years for the lifecycle projection horizon.",
		);
	}

	try {
		validatePortfolioStrategy(input.strategy);
	} catch (error) {
		if (error instanceof LifecycleSimulationError) {
			reasons.push(...error.reasons);
		} else {
			throw error;
		}
	}

	if (reasons.length > 0) {
		throw new LifecycleSimulationError("Lifecycle simulation input is invalid.", reasons);
	}
}

function recurringIncomeForYear(
	income: IncomeSource[],
	people: Person[],
	primaryAge: number,
	retirementAge: number,
	yearIndex: number,
	wageGrowthRate: number,
): {
	taxable: number;
	nonTaxable: number;
} {
	let taxable = 0;
	let nonTaxable = 0;

	for (const source of income) {
		if (source.type === "employment") {
			const person = source.personId
				? people.find((candidate) => candidate.id === source.personId)
				: undefined;

			if (person?.role === "primary" && primaryAge >= retirementAge) {
				continue;
			}

			if (person?.employmentStatus === "retired") {
				continue;
			}
		}

		const amount = source.annualAmount * Math.pow(1 + wageGrowthRate, yearIndex);

		if (source.taxable) {
			taxable += amount;
		} else {
			nonTaxable += amount;
		}
	}

	return {
		taxable,
		nonTaxable,
	};
}

function halfPeriodReturn(annualReturn: number): number {
	if (!Number.isFinite(annualReturn) || annualReturn <= -1) {
		throw new LifecycleSimulationError(
			"Annual return cannot be converted to a half-period return.",
			["Annual simple return must be finite and greater than -1."],
		);
	}

	return Math.sqrt(1 + annualReturn) - 1;
}

function totalAssetValue(assets: Asset[], predicate: (asset: Asset) => boolean): number {
	return assets.filter(predicate).reduce((total, asset) => total + asset.value, 0);
}

export function runLifecycleSimulation(input: LifecycleSimulationInput): LifecycleSimulationResult {
	validateInput(input);

	const { household, assumptions, plan, strategy, marketPath } = input;

	const primary = primaryPerson(household);

	const numberOfYears =
		Number(assumptions.projectionEndDate.slice(0, 4)) - Number(household.asOfDate.slice(0, 4));

	let cashAssets = totalAssetValue(household.assets, (asset) => asset.type === "cash");

	let nonSuperInvestableWealth = totalAssetValue(
		household.assets,
		(asset) => asset.investable && asset.type !== "cash",
	);

	const nonInvestableAssets = totalAssetValue(
		household.assets,
		(asset) => !asset.investable && asset.type !== "cash",
	);

	let superannuation = household.superannuation.reduce(
		(total, account) => total + account.balance,
		0,
	);

	let liabilities = household.liabilities.reduce(
		(total, liability) => total + liability.balance,
		0,
	);

	let cumulativeInflation = 1;

	let totalUnfundedCashFlow = 0;

	let totalRetirementSafetyNetIncome = 0;

	let firstUnfundedDate: string | undefined;

	const years: LifecycleYear[] = [];

	const openingAge = calculateAgeOnDate(primary.dateOfBirth, household.asOfDate);

	const openingPhase = lifecyclePhaseForAge(
		openingAge,
		plan.retirementAge,
		strategy.transitionYearsBeforeRetirement,
	);

	const openingAllocation = allocationForPhase(strategy, openingPhase);

	const openingNetWorth =
		cashAssets + nonSuperInvestableWealth + nonInvestableAssets + superannuation - liabilities;

	years.push({
		yearIndex: 0,

		projectionDate: household.asOfDate,

		primaryAge: openingAge,

		phase: openingPhase,

		allocation: openingAllocation,

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

		unfundedCashFlow: 0,

		cashAssets,

		nonSuperInvestableWealth,

		superannuation,

		liabilities,

		netWorth: openingNetWorth,
	});

	for (let yearIndex = 0; yearIndex < numberOfYears; yearIndex += 1) {
		const marketYear = marketPath.years[yearIndex]!;

		const periodStartDate = addYearsToIsoDate(household.asOfDate, yearIndex);

		const periodEndDate = addYearsToIsoDate(household.asOfDate, yearIndex + 1);

		const ageAtStart = calculateAgeOnDate(primary.dateOfBirth, periodStartDate);

		const ageAtEnd = calculateAgeOnDate(primary.dateOfBirth, periodEndDate);

		/**
		 * Lifecycle Simulation v1 uses the age reached during
		 * the annual projection period to determine the phase
		 * applied to that period.
		 *
		 * This avoids delaying retirement by almost a full year
		 * when the household projection anniversary falls shortly
		 * before the person's birthday.
		 *
		 * A future monthly/event-driven model can represent the
		 * exact retirement date and prorate income and spending.
		 */
		const phaseAge = Math.max(ageAtStart, ageAtEnd);

		const phase = lifecyclePhaseForAge(
			phaseAge,
			plan.retirementAge,
			strategy.transitionYearsBeforeRetirement,
		);

		const allocation = allocationForPhase(strategy, phase);

		const portfolioReturn = calculatePortfolioReturn(allocation, marketYear);

		const portfolioHalfReturn = halfPeriodReturn(portfolioReturn);

		const cashHalfReturn = halfPeriodReturn(marketYear.cashReturn);

		/**
		 * Lifecycle Simulation v1 uses a mid-period cash-flow
		 * convention.
		 *
		 * Opening financial balances earn one half-period return,
		 * annual cash flows are then applied, and remaining
		 * balances earn the second half-period return.
		 *
		 * The half-period rate is derived geometrically so that,
		 * in the absence of cash flows:
		 *
		 * (1 + halfReturn)^2 = 1 + annualReturn
		 */
		cashAssets *= 1 + cashHalfReturn;

		nonSuperInvestableWealth *= 1 + portfolioHalfReturn;

		superannuation *= 1 + portfolioHalfReturn;

		const income = recurringIncomeForYear(
			household.income,
			household.people,
			phaseAge,
			plan.retirementAge,
			yearIndex,
			assumptions.wageGrowthRate,
		);

		const afterTaxIncome =
			income.taxable * (1 - assumptions.effectiveTaxRate) + income.nonTaxable;

		let retirementSafetyNetIncome = 0;

		if (input.retirementSafetyNet && phase === "retired") {
			const assessment = assessLifecycleSafetyNet(input.retirementSafetyNet, {
				projectionDate: periodEndDate,

				primaryAge: phaseAge,

				cashAssets,

				nonSuperInvestableWealth,

				superannuation,

				liabilities,

				afterTaxIncomeBeforeSafetyNet: afterTaxIncome,
			});

			retirementSafetyNetIncome = assessment.result.annualIncome;

			totalRetirementSafetyNetIncome += retirementSafetyNetIncome;
		}

		const livingExpenses =
			phase === "retired"
				? 0
				: (household.expenses.essentialAnnual + household.expenses.discretionaryAnnual) *
					cumulativeInflation;

		const retirementSpending =
			phase === "retired" ? plan.annualRetirementSpending * cumulativeInflation : 0;

		const oneOffExpenses = yearIndex === 0 ? (household.expenses.oneOffAnnual ?? 0) : 0;

		const insurancePremiums = household.insurance.reduce((total, cover) => {
			if (cover.endAge !== undefined && ageAtStart >= cover.endAge) {
				return total;
			}

			return total + cover.annualPremium * cumulativeInflation;
		}, 0);

		let debtRepayments = 0;

		for (const liability of household.liabilities) {
			if (liabilities <= 0) {
				break;
			}

			const repayment = liability.annualRepayment ?? 0;

			debtRepayments += repayment;
		}

		debtRepayments = Math.min(debtRepayments, liabilities);

		liabilities -= debtRepayments;

		let superContributions = 0;

		if (phase !== "retired") {
			superContributions = household.superannuation.reduce(
				(total, account) =>
					total +
					(account.annualContribution ?? 0) *
						Math.pow(1 + assumptions.wageGrowthRate, yearIndex),
				0,
			);

			superannuation += superContributions;
		}

		const spending =
			livingExpenses +
			retirementSpending +
			oneOffExpenses +
			insurancePremiums +
			debtRepayments;

		const netCashFlow = afterTaxIncome + retirementSafetyNetIncome - spending;

		let unfundedCashFlow = 0;

		if (netCashFlow >= 0) {
			cashAssets += netCashFlow;
		} else {
			let remainingNeed = -netCashFlow;

			const cashUsed = Math.min(cashAssets, remainingNeed);

			cashAssets -= cashUsed;

			remainingNeed -= cashUsed;

			const investmentsUsed = Math.min(nonSuperInvestableWealth, remainingNeed);

			nonSuperInvestableWealth -= investmentsUsed;

			remainingNeed -= investmentsUsed;

			/**
			 * Retirement spending may draw on super once
			 * retirement has begun.
			 *
			 * Detailed Australian preservation and pension
			 * rules are intentionally deferred.
			 */
			if (phase === "retired" && remainingNeed > 0) {
				const superUsed = Math.min(superannuation, remainingNeed);

				superannuation -= superUsed;

				remainingNeed -= superUsed;
			}

			unfundedCashFlow = Math.max(0, remainingNeed);
		}

		if (unfundedCashFlow > 0 && firstUnfundedDate === undefined) {
			firstUnfundedDate = periodEndDate;
		}

		totalUnfundedCashFlow += unfundedCashFlow;

		/**
		 * Apply the second half-period return after the annual
		 * cash-flow event.
		 */
		cashAssets *= 1 + cashHalfReturn;

		nonSuperInvestableWealth *= 1 + portfolioHalfReturn;

		superannuation *= 1 + portfolioHalfReturn;

		const netWorth =
			cashAssets +
			nonSuperInvestableWealth +
			nonInvestableAssets +
			superannuation -
			liabilities;

		years.push({
			yearIndex: yearIndex + 1,

			projectionDate: periodEndDate,

			primaryAge: ageAtEnd,

			phase,

			allocation,

			growthReturn: marketYear.growthReturn,

			defensiveReturn: marketYear.defensiveReturn,

			cashReturn: marketYear.cashReturn,

			portfolioReturn,

			inflationRate: marketYear.inflationRate,

			afterTaxIncome,

			livingExpenses,

			retirementSpending,

			retirementSafetyNetIncome,

			insurancePremiums,

			debtRepayments,

			superContributions,

			netCashFlow,

			unfundedCashFlow,

			cashAssets,

			nonSuperInvestableWealth,

			superannuation,

			liabilities,

			netWorth,
		});

		cumulativeInflation *= 1 + marketYear.inflationRate;
	}

	const finalYear = years[years.length - 1]!;

	return {
		householdId: household.id,

		strategyId: strategy.id,

		simulationIndex: marketPath.simulationIndex,

		plan: {
			...plan,
		},

		strategy: {
			...strategy,

			workingAllocation: {
				...strategy.workingAllocation,
			},

			transitionAllocation: {
				...strategy.transitionAllocation,
			},

			retirementAllocation: {
				...strategy.retirementAllocation,
			},
		},

		years,

		summary: {
			startingNetWorth: years[0]!.netWorth,

			endingNetWorth: finalYear.netWorth,

			minimumLiquidWealth: Math.min(
				...years.map((year) => year.cashAssets + year.nonSuperInvestableWealth),
			),

			totalUnfundedCashFlow,

			firstUnfundedDate,

			endingSuperannuation: finalYear.superannuation,

			endingNonSuperInvestableWealth: finalYear.nonSuperInvestableWealth,

			totalRetirementSafetyNetIncome,
		},
	};
}

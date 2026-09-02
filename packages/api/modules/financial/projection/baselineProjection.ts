import type { Asset, HouseholdFinancialState, Person, SuperAccount } from "../household/types";
import {
	calculateAgeOnDate,
	isValidIsoDate,
	validateHouseholdFinancialState,
} from "../household/validation";
import {
	BaselineProjectionError,
	type BaselineProjectionInput,
	type BaselineProjectionResult,
	type ProjectionAssumptions,
	type ProjectionYear,
} from "./types";

interface AssetBalance {
	id: string;

	type: Asset["type"];

	value: number;

	liquid: boolean;

	investable: boolean;
}

interface SuperBalance {
	account: SuperAccount;

	balance: number;
}

interface LiabilityBalance {
	id: string;

	balance: number;

	annualInterestRate: number;

	annualRepayment: number;
}

interface AnnualDebtResult {
	totalRepayment: number;

	totalBalance: number;
}

const SYNTHETIC_CASH_ID = "__projection_cash__";

function sum(values: readonly number[]): number {
	return values.reduce((total, value) => total + value, 0);
}

function compound(value: number, rate: number, years: number): number {
	return value * Math.pow(1 + rate, years);
}

function addYearsToIsoDate(value: string, years: number): string {
	const [year, month, day] = value.split("-").map(Number);

	if (year === undefined || month === undefined || day === undefined) {
		throw new BaselineProjectionError("Projection date could not be calculated.", [
			`Invalid ISO date "${value}".`,
		]);
	}

	const targetYear = year + years;

	const finalDayOfTargetMonth = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();

	const targetDay = Math.min(day, finalDayOfTargetMonth);

	return [
		targetYear.toString().padStart(4, "0"),

		month.toString().padStart(2, "0"),

		targetDay.toString().padStart(2, "0"),
	].join("-");
}

function projectionYearsBetween(asOfDate: string, projectionEndDate: string): number {
	const startYear = Number(asOfDate.slice(0, 4));

	const endYear = Number(projectionEndDate.slice(0, 4));

	return endYear - startYear;
}

function getPrimaryPerson(household: HouseholdFinancialState): Person {
	const primaryPeople = household.people.filter((person) => person.role === "primary");

	if (primaryPeople.length !== 1) {
		throw new BaselineProjectionError(
			"Baseline projection requires exactly one primary household member.",
			[`Expected exactly one primary household member but found ${primaryPeople.length}.`],
		);
	}

	return primaryPeople[0]!;
}

function getRetirementAge(
	household: HouseholdFinancialState,
	personId: string,
): number | undefined {
	const retirementGoals = household.goals.filter(
		(goal) =>
			goal.type === "retirement" &&
			goal.personId === personId &&
			goal.targetAge !== undefined,
	);

	if (retirementGoals.length === 0) {
		return undefined;
	}

	/**
	 * Baseline v1 uses the highest-priority declared
	 * retirement goal where more than one exists.
	 *
	 * Priority ordering is intentionally deterministic.
	 */
	const priorityRank = {
		high: 3,
		medium: 2,
		low: 1,
	} as const;

	const sorted = [...retirementGoals].sort(
		(a, b) => priorityRank[b.priority] - priorityRank[a.priority],
	);

	return sorted[0]?.targetAge;
}

function validateRate(value: number, label: string): string | undefined {
	if (!Number.isFinite(value)) {
		return `${label} must be a finite number.`;
	}

	if (value <= -1) {
		return `${label} must be greater than -1.`;
	}

	return undefined;
}

function validateProjectionAssumptions(
	household: HouseholdFinancialState,
	assumptions: ProjectionAssumptions,
): string[] {
	const reasons: string[] = [];

	const rates: Array<[number, string]> = [
		[assumptions.inflationRate, "Inflation rate"],

		[assumptions.wageGrowthRate, "Wage growth rate"],

		[assumptions.spendingGrowthRate, "Spending growth rate"],

		[assumptions.cashReturnRate, "Cash return rate"],

		[assumptions.investmentReturnRate, "Investment return rate"],

		[assumptions.superReturnRate, "Superannuation return rate"],
	];

	rates.forEach(([value, label]) => {
		const reason = validateRate(value, label);

		if (reason) {
			reasons.push(reason);
		}
	});

	if (
		!Number.isFinite(assumptions.effectiveTaxRate) ||
		assumptions.effectiveTaxRate < 0 ||
		assumptions.effectiveTaxRate > 1
	) {
		reasons.push("Effective tax rate must be a finite decimal rate between 0 and 1.");
	}

	if (!isValidIsoDate(assumptions.projectionEndDate)) {
		reasons.push("Projection end date must be a valid ISO date in YYYY-MM-DD format.");

		return reasons;
	}

	if (isValidIsoDate(household.asOfDate) && assumptions.projectionEndDate <= household.asOfDate) {
		reasons.push("Projection end date must be after the household as-of date.");
	}

	/**
	 * Baseline Projection v1 runs in complete annual
	 * periods. Requiring an anniversary-aligned horizon
	 * avoids pretending a partial year received a full
	 * year of income, returns and expenditure.
	 */
	if (
		isValidIsoDate(household.asOfDate) &&
		assumptions.projectionEndDate.slice(5) !== household.asOfDate.slice(5)
	) {
		reasons.push(
			"Projection end date must fall on an annual anniversary of the household as-of date for Baseline Projection v1.",
		);
	}

	return reasons;
}

function validateProjectionInput(input: BaselineProjectionInput): void {
	const { household, assumptions } = input;

	const householdValidation = validateHouseholdFinancialState(household);

	const reasons = [
		...householdValidation.errors.map((issue) => `${issue.path}: ${issue.message}`),

		...validateProjectionAssumptions(household, assumptions),
	];

	if (reasons.length > 0) {
		throw new BaselineProjectionError(
			"Household financial state cannot be projected.",
			reasons,
		);
	}
}

function personAgeAtOffset(
	person: Person,
	household: HouseholdFinancialState,
	yearOffset: number,
): number | undefined {
	const projectionDate = addYearsToIsoDate(household.asOfDate, yearOffset);

	return calculateAgeOnDate(person.dateOfBirth, projectionDate);
}

function incomeIsActive(
	sourceIndex: number,
	household: HouseholdFinancialState,
	yearOffset: number,
): boolean {
	const source = household.income[sourceIndex];

	if (!source) {
		return false;
	}

	/**
	 * Baseline v1 treats non-employment income already
	 * present in household state as recurring.
	 *
	 * Future pensions, future business exits and other
	 * scheduled income belong in later projection-plan
	 * structures, not current household state.
	 */
	if (source.type !== "employment") {
		return true;
	}

	if (source.personId === undefined) {
		return false;
	}

	const person = household.people.find((candidate) => candidate.id === source.personId);

	if (!person) {
		return false;
	}

	if (person.employmentStatus === "retired") {
		return false;
	}

	const age = personAgeAtOffset(person, household, yearOffset);

	if (age === undefined) {
		return false;
	}

	const retirementAge = getRetirementAge(household, person.id);

	if (retirementAge !== undefined && age >= retirementAge) {
		return false;
	}

	return true;
}

function calculateAfterTaxIncome(
	household: HouseholdFinancialState,
	assumptions: ProjectionAssumptions,
	yearOffset: number,
): number {
	return sum(
		household.income.map((source, index) => {
			if (!incomeIsActive(index, household, yearOffset)) {
				return 0;
			}

			const grownIncome = compound(
				source.annualAmount,
				assumptions.wageGrowthRate,
				yearOffset,
			);

			if (!source.taxable) {
				return grownIncome;
			}

			return grownIncome * (1 - assumptions.effectiveTaxRate);
		}),
	);
}

function calculateLivingExpenses(
	household: HouseholdFinancialState,
	assumptions: ProjectionAssumptions,
	yearOffset: number,
): number {
	const recurringExpenses =
		household.expenses.essentialAnnual + household.expenses.discretionaryAnnual;

	const recurring = compound(recurringExpenses, assumptions.spendingGrowthRate, yearOffset);

	const oneOff = yearOffset === 0 ? (household.expenses.oneOffAnnual ?? 0) : 0;

	return recurring + oneOff;
}

function calculateInsurancePremiums(
	household: HouseholdFinancialState,
	assumptions: ProjectionAssumptions,
	yearOffset: number,
): number {
	return sum(
		household.insurance.map((cover) => {
			const person = household.people.find((candidate) => candidate.id === cover.personId);

			if (!person) {
				return 0;
			}

			const age = personAgeAtOffset(person, household, yearOffset);

			if (age === undefined) {
				return 0;
			}

			if (cover.endAge !== undefined && age > cover.endAge) {
				return 0;
			}

			return compound(cover.annualPremium, assumptions.inflationRate, yearOffset);
		}),
	);
}

function contributionIsActive(
	account: SuperAccount,
	household: HouseholdFinancialState,
	yearOffset: number,
): boolean {
	const person = household.people.find((candidate) => candidate.id === account.personId);

	if (!person) {
		return false;
	}

	if (person.employmentStatus === "retired") {
		return false;
	}

	const age = personAgeAtOffset(person, household, yearOffset);

	if (age === undefined) {
		return false;
	}

	const retirementAge = getRetirementAge(household, person.id);

	if (retirementAge !== undefined && age >= retirementAge) {
		return false;
	}

	return true;
}

function assetGrowthRate(asset: AssetBalance, assumptions: ProjectionAssumptions): number {
	if (asset.type === "cash") {
		return assumptions.cashReturnRate;
	}

	if (asset.type === "investment" || asset.type === "property" || asset.type === "business") {
		return assumptions.investmentReturnRate;
	}

	/**
	 * Vehicles and generic "other" assets are held
	 * flat in Baseline v1 rather than incorrectly
	 * assuming they earn investment returns.
	 */
	return 0;
}

function growAssets(assets: AssetBalance[], assumptions: ProjectionAssumptions): void {
	assets.forEach((asset) => {
		asset.value *= 1 + assetGrowthRate(asset, assumptions);
	});
}

function applyPositiveCashFlow(assets: AssetBalance[], amount: number): void {
	if (amount <= 0) {
		return;
	}

	let cashAsset = assets.find((asset) => asset.type === "cash");

	if (!cashAsset) {
		cashAsset = {
			id: SYNTHETIC_CASH_ID,

			type: "cash",

			value: 0,

			liquid: true,

			investable: true,
		};

		assets.push(cashAsset);
	}

	cashAsset.value += amount;
}

function applyNegativeCashFlow(assets: AssetBalance[], amount: number): number {
	if (amount >= 0) {
		return 0;
	}

	let remainingDeficit = Math.abs(amount);

	const fundingAssets = [
		...assets.filter((asset) => asset.liquid && asset.type === "cash"),

		...assets.filter((asset) => asset.liquid && asset.type !== "cash"),
	];

	for (const asset of fundingAssets) {
		if (remainingDeficit <= 0) {
			break;
		}

		const amountUsed = Math.min(asset.value, remainingDeficit);

		asset.value -= amountUsed;

		remainingDeficit -= amountUsed;
	}

	return remainingDeficit;
}

function rollForwardLiabilities(liabilities: LiabilityBalance[]): AnnualDebtResult {
	let totalRepayment = 0;

	liabilities.forEach((liability) => {
		const balanceWithInterest = liability.balance * (1 + liability.annualInterestRate);

		const repayment = Math.min(balanceWithInterest, liability.annualRepayment);

		liability.balance = Math.max(0, balanceWithInterest - repayment);

		totalRepayment += repayment;
	});

	return {
		totalRepayment,

		totalBalance: sum(liabilities.map((liability) => liability.balance)),
	};
}

function rollForwardSuper(
	superBalances: SuperBalance[],
	household: HouseholdFinancialState,
	assumptions: ProjectionAssumptions,
	yearOffset: number,
): {
	totalBalance: number;
	totalContribution: number;
} {
	let totalContribution = 0;

	superBalances.forEach((item) => {
		item.balance *= 1 + assumptions.superReturnRate;

		const baseContribution = item.account.annualContribution ?? 0;

		if (baseContribution > 0 && contributionIsActive(item.account, household, yearOffset)) {
			const contribution = compound(baseContribution, assumptions.wageGrowthRate, yearOffset);

			item.balance += contribution;

			totalContribution += contribution;
		}
	});

	return {
		totalBalance: sum(superBalances.map((item) => item.balance)),

		totalContribution,
	};
}

function totalCashAssets(assets: readonly AssetBalance[]): number {
	return sum(assets.filter((asset) => asset.type === "cash").map((asset) => asset.value));
}

function totalLiquidWealth(assets: readonly AssetBalance[]): number {
	return sum(assets.filter((asset) => asset.liquid).map((asset) => asset.value));
}

function totalInvestableWealth(assets: readonly AssetBalance[]): number {
	return sum(assets.filter((asset) => asset.investable).map((asset) => asset.value));
}

function totalAssets(assets: readonly AssetBalance[]): number {
	return sum(assets.map((asset) => asset.value));
}

function createProjectionYear(args: {
	yearIndex: number;

	projectionDate: string;

	primaryAge: number;

	afterTaxIncome: number;

	livingExpenses: number;

	insurancePremiums: number;

	debtRepayments: number;

	superContributions: number;

	netCashFlow: number;

	unfundedCashFlow: number;

	assets: AssetBalance[];

	superBalance: number;

	liabilityBalance: number;
}): ProjectionYear {
	const nonSuperAssets = totalAssets(args.assets);

	return {
		yearIndex: args.yearIndex,

		projectionDate: args.projectionDate,

		calendarYear: Number(args.projectionDate.slice(0, 4)),

		primaryAge: args.primaryAge,

		afterTaxIncome: args.afterTaxIncome,

		livingExpenses: args.livingExpenses,

		insurancePremiums: args.insurancePremiums,

		debtRepayments: args.debtRepayments,

		superContributions: args.superContributions,

		netCashFlow: args.netCashFlow,

		unfundedCashFlow: args.unfundedCashFlow,

		cashAssets: totalCashAssets(args.assets),

		liquidWealth: totalLiquidWealth(args.assets),

		investableWealth: totalInvestableWealth(args.assets),

		nonSuperAssets,

		superannuation: args.superBalance,

		liabilities: args.liabilityBalance,

		netWorth: nonSuperAssets + args.superBalance - args.liabilityBalance,
	};
}

export function runBaselineProjection(input: BaselineProjectionInput): BaselineProjectionResult {
	validateProjectionInput(input);

	const { household, assumptions } = input;

	const primaryPerson = getPrimaryPerson(household);

	const primaryCurrentAge = calculateAgeOnDate(primaryPerson.dateOfBirth, household.asOfDate);

	if (primaryCurrentAge === undefined) {
		throw new BaselineProjectionError("Primary household member has an invalid age.", [
			"Primary household member age could not be calculated.",
		]);
	}

	const projectionYears = projectionYearsBetween(
		household.asOfDate,
		assumptions.projectionEndDate,
	);

	const assets: AssetBalance[] = household.assets.map((asset) => ({
		id: asset.id,

		type: asset.type,

		value: asset.value,

		liquid: asset.liquid,

		investable: asset.investable,
	}));

	const superBalances: SuperBalance[] = household.superannuation.map((account) => ({
		account,

		balance: account.balance,
	}));

	const liabilities: LiabilityBalance[] = household.liabilities.map((liability) => ({
		id: liability.id,

		balance: liability.balance,

		annualInterestRate: liability.annualInterestRate ?? 0,

		annualRepayment: liability.annualRepayment ?? 0,
	}));

	const openingSuperBalance = sum(superBalances.map((item) => item.balance));

	const openingLiabilityBalance = sum(liabilities.map((item) => item.balance));

	const years: ProjectionYear[] = [
		createProjectionYear({
			yearIndex: 0,

			projectionDate: household.asOfDate,

			primaryAge: primaryCurrentAge,

			afterTaxIncome: 0,

			livingExpenses: 0,

			insurancePremiums: 0,

			debtRepayments: 0,

			superContributions: 0,

			netCashFlow: 0,

			unfundedCashFlow: 0,

			assets,

			superBalance: openingSuperBalance,

			liabilityBalance: openingLiabilityBalance,
		}),
	];

	for (let yearIndex = 1; yearIndex <= projectionYears; yearIndex += 1) {
		/**
		 * Activity during each annual period is assessed
		 * at the beginning of that period.
		 */
		const activityOffset = yearIndex - 1;

		const afterTaxIncome = calculateAfterTaxIncome(household, assumptions, activityOffset);

		const livingExpenses = calculateLivingExpenses(household, assumptions, activityOffset);

		const insurancePremiums = calculateInsurancePremiums(
			household,
			assumptions,
			activityOffset,
		);

		growAssets(assets, assumptions);

		const debtResult = rollForwardLiabilities(liabilities);

		const superResult = rollForwardSuper(superBalances, household, assumptions, activityOffset);

		const netCashFlow =
			afterTaxIncome - livingExpenses - insurancePremiums - debtResult.totalRepayment;

		let unfundedCashFlow = 0;

		if (netCashFlow >= 0) {
			applyPositiveCashFlow(assets, netCashFlow);
		} else {
			unfundedCashFlow = applyNegativeCashFlow(assets, netCashFlow);
		}

		const projectionDate = addYearsToIsoDate(household.asOfDate, yearIndex);

		const primaryAge = calculateAgeOnDate(primaryPerson.dateOfBirth, projectionDate);

		if (primaryAge === undefined) {
			throw new BaselineProjectionError("Projected primary age could not be calculated.", [
				`Age could not be calculated at ${projectionDate}.`,
			]);
		}

		years.push(
			createProjectionYear({
				yearIndex,

				projectionDate,

				primaryAge,

				afterTaxIncome,

				livingExpenses,

				insurancePremiums,

				debtRepayments: debtResult.totalRepayment,

				superContributions: superResult.totalContribution,

				netCashFlow,

				unfundedCashFlow,

				assets,

				superBalance: superResult.totalBalance,

				liabilityBalance: debtResult.totalBalance,
			}),
		);
	}

	const firstYear = years[0]!;

	const finalYear = years[years.length - 1]!;

	const minimumLiquidWealth = Math.min(...years.map((year) => year.liquidWealth));

	const totalUnfundedCashFlow = sum(years.map((year) => year.unfundedCashFlow));

	const firstUnfundedYear = years.find((year) => year.unfundedCashFlow > 0);

	return {
		householdId: household.id,

		asOfDate: household.asOfDate,

		assumptions: {
			...assumptions,
		},

		years,

		summary: {
			startingNetWorth: firstYear.netWorth,

			endingNetWorth: finalYear.netWorth,

			startingLiquidWealth: firstYear.liquidWealth,

			endingLiquidWealth: finalYear.liquidWealth,

			minimumLiquidWealth,

			totalUnfundedCashFlow,

			firstUnfundedAge: firstUnfundedYear?.primaryAge,

			firstUnfundedDate: firstUnfundedYear?.projectionDate,
		},
	};
}

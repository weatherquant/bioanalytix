import type { HouseholdFinancialState } from "../household/types";

export interface ProjectionAssumptions {
	/**
	 * General price inflation assumption.
	 *
	 * Used where nominal contractual amounts, such as
	 * insurance premiums, require escalation.
	 */
	inflationRate: number;

	/**
	 * Growth rate for employment and other income that
	 * the baseline model treats as wage-linked.
	 */
	wageGrowthRate: number;

	/**
	 * Growth rate for recurring living expenditure.
	 *
	 * Kept separate from inflation so later planning
	 * cases can test changes in real consumption.
	 */
	spendingGrowthRate: number;

	cashReturnRate: number;

	investmentReturnRate: number;

	superReturnRate: number;

	/**
	 * Simplified effective tax assumption for
	 * Baseline Projection v1.
	 *
	 * It is intentionally explicit and replaceable.
	 * It is not a jurisdiction-specific tax engine.
	 */
	effectiveTaxRate: number;

	/**
	 * Authoritative execution horizon.
	 *
	 * Baseline Projection v1 operates on annual
	 * anniversaries of the household as-of date.
	 */
	projectionEndDate: string;
}

export interface ProjectionYear {
	/**
	 * Zero is the opening household state.
	 */
	yearIndex: number;

	projectionDate: string;

	calendarYear: number;

	/**
	 * Convenience output only.
	 *
	 * Primary age does not determine the projection
	 * horizon.
	 */
	primaryAge: number;

	afterTaxIncome: number;

	livingExpenses: number;

	insurancePremiums: number;

	debtRepayments: number;

	superContributions: number;

	netCashFlow: number;

	unfundedCashFlow: number;

	cashAssets: number;

	liquidWealth: number;

	investableWealth: number;

	nonSuperAssets: number;

	superannuation: number;

	liabilities: number;

	netWorth: number;
}

export interface BaselineProjectionSummary {
	startingNetWorth: number;

	endingNetWorth: number;

	startingLiquidWealth: number;

	endingLiquidWealth: number;

	minimumLiquidWealth: number;

	totalUnfundedCashFlow: number;

	firstUnfundedAge?: number;

	firstUnfundedDate?: string;
}

export interface BaselineProjectionResult {
	householdId: string;

	asOfDate: string;

	assumptions: ProjectionAssumptions;

	years: ProjectionYear[];

	summary: BaselineProjectionSummary;
}

export interface BaselineProjectionInput {
	household: HouseholdFinancialState;

	assumptions: ProjectionAssumptions;
}

export class BaselineProjectionError extends Error {
	readonly reasons: string[];

	constructor(message: string, reasons: string[]) {
		super(message);

		this.name = "BaselineProjectionError";

		this.reasons = reasons;
	}
}

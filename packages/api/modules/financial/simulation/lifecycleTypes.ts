import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import type { LifecycleRetirementSafetyNet } from "../retirement/lifecycleSafetyNet";
import type { MarketPath, PortfolioStrategy, AssetClassAllocation } from "./types";

export type LifecyclePhase = "working" | "retirement_transition" | "retired";

export interface LifecyclePlan {
	/**
	 * Retirement age used for lifecycle execution.
	 *
	 * This is deliberately separate from household state.
	 */
	retirementAge: number;

	/**
	 * Desired annual retirement spending in today's
	 * dollars.
	 *
	 * It is indexed by the simulated inflation path.
	 */
	annualRetirementSpending: number;
}

export interface LifecycleYear {
	yearIndex: number;

	projectionDate: string;

	primaryAge: number;

	phase: LifecyclePhase;

	allocation: AssetClassAllocation;

	growthReturn: number;

	defensiveReturn: number;

	cashReturn: number;

	portfolioReturn: number;

	inflationRate: number;

	afterTaxIncome: number;

	retirementSafetyNetIncome: number;

	livingExpenses: number;

	retirementSpending: number;

	insurancePremiums: number;

	debtRepayments: number;

	superContributions: number;

	netCashFlow: number;

	unfundedCashFlow: number;

	cashAssets: number;

	nonSuperInvestableWealth: number;

	superannuation: number;

	liabilities: number;

	netWorth: number;
}

export interface LifecycleSimulationInput {
	household: HouseholdFinancialState;

	assumptions: ProjectionAssumptions;

	plan: LifecyclePlan;

	strategy: PortfolioStrategy;

	marketPath: MarketPath;

	/**
	 * Optional public retirement-income safety net.
	 *
	 * The lifecycle engine consumes only the generic interface.
	 * Country-specific eligibility and assessment rules remain
	 * outside the simulation engine.
	 */
	retirementSafetyNet?: LifecycleRetirementSafetyNet;
}

export interface LifecycleSimulationResult {
	householdId: string;

	strategyId: string;

	simulationIndex: number;

	plan: LifecyclePlan;

	strategy: PortfolioStrategy;

	years: LifecycleYear[];

	summary: {
		startingNetWorth: number;

		endingNetWorth: number;

		minimumLiquidWealth: number;

		totalUnfundedCashFlow: number;

		firstUnfundedDate?: string;

		endingSuperannuation: number;

		endingNonSuperInvestableWealth: number;

		totalRetirementSafetyNetIncome: number;
	};
}

export class LifecycleSimulationError extends Error {
	readonly reasons: string[];

	constructor(message: string, reasons: string[]) {
		super(message);

		this.name = "LifecycleSimulationError";

		this.reasons = reasons;
	}
}

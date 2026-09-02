import type { HouseholdFinancialState } from "../household/types";
import type {
	BaselineProjectionResult,
	ProjectionAssumptions,
	ProjectionYear,
} from "../projection/types";

export const SCENARIO_KINDS = [
	"income_interruption",
	"premature_death",
	"care_dependency",
	"health_cost",
	"partner_dependency",
] as const;

export type ScenarioKind = (typeof SCENARIO_KINDS)[number];

/**
 * Financial effects are explicit scenario assumptions.
 *
 * They are financial planning inputs. They must not be
 * inferred directly from genotype, disease probability,
 * biological model identifiers or genetic risk scores.
 */
export interface ScenarioEffects {
	/**
	 * Reduction in annual household after-tax income
	 * while the scenario is active.
	 */
	annualIncomeReduction?: number;

	/**
	 * Additional recurring household expenditure while
	 * the scenario is active.
	 */
	annualAdditionalExpenses?: number;

	/**
	 * Additional expense occurring once when the
	 * scenario first becomes active.
	 */
	oneOffExpense?: number;

	/**
	 * Recurring insurance or other financial support.
	 */
	annualInsuranceBenefit?: number;

	/**
	 * One-off insurance or other financial support.
	 */
	oneOffInsuranceProceeds?: number;
}

export interface ScenarioDefinition {
	id: string;

	name: string;

	kind: ScenarioKind;

	affectedPersonId?: string;

	/**
	 * ISO date in YYYY-MM-DD format.
	 *
	 * Scenario Engine v1 operates on annual periods and
	 * therefore requires anniversary alignment with the
	 * household as-of date.
	 */
	startDate: string;

	/**
	 * Number of complete annual periods during which
	 * recurring scenario effects apply.
	 *
	 * Undefined means the effects continue to the end
	 * of the projection.
	 */
	durationYears?: number;

	effects: ScenarioEffects;

	rationale?: string;
}

export interface ScenarioAnnualImpact {
	active: boolean;

	annualIncomeReduction: number;

	annualAdditionalExpenses: number;

	oneOffExpense: number;

	annualInsuranceBenefit: number;

	oneOffInsuranceProceeds: number;

	/**
	 * Total financial demand created by the scenario
	 * during this period.
	 */
	grossScenarioCost: number;

	/**
	 * Insurance or other explicit financial support
	 * available during this period.
	 */
	scenarioSupport: number;

	/**
	 * Positive means financial support exceeds scenario
	 * cost. Negative means the scenario creates an
	 * additional cash requirement.
	 */
	netScenarioCashFlow: number;
}

export interface ScenarioProjectionYear {
	/**
	 * Baseline projection result for the same reporting
	 * anniversary.
	 */
	baseline: ProjectionYear;

	/**
	 * Undefined for the opening state.
	 */
	periodStartDate?: string;

	periodEndDate: string;

	scenarioImpact: ScenarioAnnualImpact;

	/**
	 * Signed baseline funding capacity for this period:
	 *
	 * liquid wealth - unfunded cash flow
	 */
	baselineFundingPosition: number;

	/**
	 * Signed funding position after applying scenario
	 * effects and any carried liquid-wealth difference.
	 *
	 * Positive = resources remain.
	 * Negative = funding need remains unmet.
	 */
	stressedFundingPosition: number;

	stressedLiquidWealth: number;

	stressedNetWorth: number;

	stressedUnfundedCashFlow: number;

	/**
	 * Signed change in the funding gap.
	 *
	 * Positive = scenario increased unmet need.
	 * Negative = scenario reduced an existing unmet need.
	 */
	unfundedCashFlowImpact: number;

	/**
	 * Positive-only convenience measure for additional
	 * unmet need caused by the scenario.
	 */
	additionalUnfundedCashFlow: number;

	/**
	 * Positive-only convenience measure showing how much
	 * scenario support reduced an existing baseline gap.
	 */
	reducedUnfundedCashFlow: number;

	liquidWealthImpact: number;

	netWorthImpact: number;
}

export interface ScenarioSummary {
	totalIncomeReduction: number;

	totalAdditionalExpenses: number;

	/**
	 * Income reductions + additional expenditure.
	 */
	totalScenarioCost: number;

	/**
	 * Insurance benefits + other explicit support.
	 */
	totalScenarioSupport: number;

	/**
	 * Retained for convenient financial reporting.
	 * Equivalent to totalScenarioSupport.
	 */
	totalInsuranceSupport: number;

	totalNetScenarioCashFlow: number;

	/**
	 * Positive-only total additional funding need.
	 */
	totalAdditionalUnfundedCashFlow: number;

	/**
	 * Positive-only total reduction in pre-existing
	 * baseline funding gaps.
	 */
	totalReducedUnfundedCashFlow: number;

	/**
	 * Signed aggregate change in unfunded cash flow.
	 *
	 * Positive = more unmet need.
	 * Negative = baseline unmet need was reduced.
	 */
	totalUnfundedCashFlowImpact: number;

	endingLiquidWealthImpact: number;

	endingNetWorthImpact: number;

	firstAdditionalUnfundedDate?: string;
}

export interface ScenarioResult {
	scenario: ScenarioDefinition;

	baseline: BaselineProjectionResult;

	years: ScenarioProjectionYear[];

	summary: ScenarioSummary;
}

export interface ScenarioInput {
	household: HouseholdFinancialState;

	assumptions: ProjectionAssumptions;

	scenario: ScenarioDefinition;
}

export class ScenarioEngineError extends Error {
	readonly reasons: string[];

	constructor(message: string, reasons: string[]) {
		super(message);

		this.name = "ScenarioEngineError";

		this.reasons = reasons;
	}
}

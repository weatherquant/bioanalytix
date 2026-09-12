import type { HouseholdFinancialState } from "../financial/household/types";
import type { ScenarioDefinition } from "../financial/scenarios/types";
import type { PlanScenarioAssumptions, SavedPlanningQuestion } from "./savedPlan";

export const PLAN_SCENARIO_ADAPTER_VERSION = "1.0.0";

export type PlanScenarioExecutionMode =
	| "financial_scenario"
	| "projection_comparison"
	| "readiness_review";

export interface PlanScenarioGeneticContext {
	/**
	 * True only when the planning question originated from
	 * eligible genetic evidence.
	 *
	 * Genetics informs why the scenario is surfaced. It never
	 * supplies the scenario's financial values.
	 */
	informed: boolean;

	sourceInsightIds: string[];
}

export interface PlanScenarioIntent {
	questionId: string;

	mode: PlanScenarioExecutionMode;

	ready: boolean;

	missingInputs: string[];

	geneticContext: PlanScenarioGeneticContext;

	/**
	 * Present only when the existing financial scenario engine
	 * can execute the question directly.
	 */
	scenario?: ScenarioDefinition;
}

/**
 * These duration fields are intentionally supported by the
 * adapter before they are exposed fully in the Plan UI.
 *
 * They should subsequently be added to PlanScenarioAssumptions
 * and the save-plan Zod schema.
 */
type ExtendedPlanScenarioAssumptions = PlanScenarioAssumptions & {
	healthCostDurationYears?: number;
	careCostDurationYears?: number;
};

function geneticContext(question: SavedPlanningQuestion): PlanScenarioGeneticContext {
	return {
		informed: question.source === "genetic_profile",

		sourceInsightIds: question.sourceInsightIds ?? [],
	};
}

function firstPrimaryPersonId(household: HouseholdFinancialState): string | undefined {
	return (
		household.people.find((person) => person.role === "primary")?.id ?? household.people[0]?.id
	);
}

function totalRecordedAnnualIncome(household: HouseholdFinancialState): number {
	return household.income.reduce((total, income) => total + income.annualAmount, 0);
}

function positiveNumber(value: number | undefined): value is number {
	return value !== undefined && Number.isFinite(value) && value > 0;
}

function positiveInteger(value: number | undefined): value is number {
	return positiveNumber(value) && Number.isInteger(value);
}

function baseScenario({
	question,
	household,
	name,
	kind,
}: {
	question: SavedPlanningQuestion;
	household: HouseholdFinancialState;
	name: string;
	kind: ScenarioDefinition["kind"];
}): Omit<ScenarioDefinition, "effects"> {
	return {
		id: question.id,

		name,

		kind,

		startDate: household.asOfDate,

		rationale: question.rationale,
	};
}

function incomeInterruptionIntent({
	question,
	household,
	assumptions,
}: {
	question: SavedPlanningQuestion;
	household: HouseholdFinancialState;
	assumptions: ExtendedPlanScenarioAssumptions;
}): PlanScenarioIntent {
	const missingInputs: string[] = [];

	const months = assumptions.incomeInterruptionMonths;

	if (months === undefined || !positiveInteger(months)) {
		missingInputs.push("Enter an income interruption period.");
	} else if (months % 12 !== 0) {
		/*
		 * Scenario Engine v1 works on complete annual periods.
		 * Never silently round a user's six-month scenario to
		 * twelve months.
		 */
		missingInputs.push(
			"Scenario Engine v1 currently requires income interruption periods in complete years: 12, 24, 36 months, and so on.",
		);
	}

	const annualIncome = totalRecordedAnnualIncome(household);

	if (annualIncome <= 0) {
		missingInputs.push("No household income is recorded to interrupt.");
	}

	if (missingInputs.length > 0) {
		return {
			questionId: question.id,
			mode: "financial_scenario",
			ready: false,
			missingInputs,
			geneticContext: geneticContext(question),
		};
	}

	if (months === undefined) {
		throw new Error(
			"Income interruption months must be defined before constructing the scenario.",
		);
	}

	return {
		questionId: question.id,

		mode: "financial_scenario",

		ready: true,

		missingInputs: [],

		geneticContext: geneticContext(question),

		scenario: {
			...baseScenario({
				question,
				household,
				name: "Income interruption",
				kind: "income_interruption",
			}),

			affectedPersonId: firstPrimaryPersonId(household),

			durationYears: months / 12,

			effects: {
				/*
				 * This amount comes from the user's recorded
				 * household financial profile, not genetics.
				 *
				 * A future UI can allow the user to override
				 * the amount independently.
				 */
				annualIncomeReduction: annualIncome,
			},
		},
	};
}

function healthCostIntent({
	question,
	household,
	assumptions,
}: {
	question: SavedPlanningQuestion;
	household: HouseholdFinancialState;
	assumptions: ExtendedPlanScenarioAssumptions;
}): PlanScenarioIntent {
	const missingInputs: string[] = [];

	const annualCost = assumptions.additionalAnnualHealthCosts;

	const durationYears = assumptions.healthCostDurationYears;

	if (!positiveNumber(annualCost)) {
		missingInputs.push("Enter additional annual health costs.");
	}

	if (!positiveInteger(durationYears)) {
		missingInputs.push(
			"Enter the number of years for which the additional health costs should apply.",
		);
	}

	if (missingInputs.length > 0) {
		return {
			questionId: question.id,
			mode: "financial_scenario",
			ready: false,
			missingInputs,
			geneticContext: geneticContext(question),
		};
	}

	return {
		questionId: question.id,

		mode: "financial_scenario",

		ready: true,

		missingInputs: [],

		geneticContext: geneticContext(question),

		scenario: {
			...baseScenario({
				question,
				household,
				name: "Higher health costs",
				kind: "health_cost",
			}),

			durationYears,

			effects: {
				/*
				 * Explicit user-entered financial assumption.
				 * Genetic evidence must never populate this.
				 */
				annualAdditionalExpenses: annualCost,
			},
		},
	};
}

function careDependencyIntent({
	question,
	household,
	assumptions,
}: {
	question: SavedPlanningQuestion;
	household: HouseholdFinancialState;
	assumptions: ExtendedPlanScenarioAssumptions;
}): PlanScenarioIntent {
	const missingInputs: string[] = [];

	const annualCost = assumptions.additionalAnnualCareCosts;

	const durationYears = assumptions.careCostDurationYears;

	if (!positiveNumber(annualCost)) {
		missingInputs.push("Enter additional annual care costs.");
	}

	if (!positiveInteger(durationYears)) {
		missingInputs.push(
			"Enter the number of years for which the additional care costs should apply.",
		);
	}

	if (missingInputs.length > 0) {
		return {
			questionId: question.id,
			mode: "financial_scenario",
			ready: false,
			missingInputs,
			geneticContext: geneticContext(question),
		};
	}

	return {
		questionId: question.id,

		mode: "financial_scenario",

		ready: true,

		missingInputs: [],

		geneticContext: geneticContext(question),

		scenario: {
			...baseScenario({
				question,
				household,
				name: "Care dependency",
				kind: "care_dependency",
			}),

			affectedPersonId: firstPrimaryPersonId(household),

			durationYears,

			effects: {
				annualAdditionalExpenses: annualCost,
			},
		},
	};
}

function prematureMortalityIntent({
	question,
	household,
	assumptions,
}: {
	question: SavedPlanningQuestion;
	household: HouseholdFinancialState;
	assumptions: ExtendedPlanScenarioAssumptions;
}): PlanScenarioIntent {
	const shortfall = assumptions.insuranceShortfall;

	if (!positiveNumber(shortfall)) {
		return {
			questionId: question.id,

			mode: "financial_scenario",

			ready: false,

			missingInputs: [
				"Enter an amount representing the financial shortfall you want to stress-test.",
			],

			geneticContext: geneticContext(question),
		};
	}

	return {
		questionId: question.id,

		mode: "financial_scenario",

		ready: true,

		missingInputs: [],

		geneticContext: geneticContext(question),

		scenario: {
			...baseScenario({
				question,
				household,
				name: "Earlier-death financial resilience",
				kind: "premature_death",
			}),

			affectedPersonId: firstPrimaryPersonId(household),

			durationYears: 1,

			effects: {
				/*
				 * This is deliberately modelled as an explicit
				 * user-entered financial shortfall rather than
				 * calculating an economic loss from genotype,
				 * disease probability or mortality assumptions.
				 */
				oneOffExpense: shortfall,
			},
		},
	};
}

function partnerDependencyIntent({
	question,
	household,
	assumptions,
}: {
	question: SavedPlanningQuestion;
	household: HouseholdFinancialState;
	assumptions: ExtendedPlanScenarioAssumptions;
}): PlanScenarioIntent {
	const annualCost = assumptions.additionalAnnualCareCosts;

	const durationYears = assumptions.careCostDurationYears;

	const missingInputs: string[] = [];

	if (!positiveNumber(annualCost)) {
		missingInputs.push("Enter an annual financial impact for the partner-dependency scenario.");
	}

	if (!positiveInteger(durationYears)) {
		missingInputs.push(
			"Enter the number of years for which the partner-dependency impact should apply.",
		);
	}

	if (missingInputs.length > 0) {
		return {
			questionId: question.id,

			mode: "financial_scenario",

			ready: false,

			missingInputs,

			geneticContext: geneticContext(question),
		};
	}

	return {
		questionId: question.id,

		mode: "financial_scenario",

		ready: true,

		missingInputs: [],

		geneticContext: geneticContext(question),

		scenario: {
			...baseScenario({
				question,
				household,
				name: "Partner dependency",
				kind: "partner_dependency",
			}),

			durationYears,

			effects: {
				annualAdditionalExpenses: annualCost,
			},
		},
	};
}

/**
 * Convert a saved Bioanalytix planning question into an
 * executable planning intent.
 *
 * This function deliberately separates:
 *
 * 1. why the question was surfaced;
 * 2. what financial assumptions the user wants to test; and
 * 3. how the existing scenario engine executes those inputs.
 *
 * Genetics may influence (1).
 * Genetics must never populate (2).
 */
export function buildPlanScenarioIntent({
	question,
	household,
	assumptions,
}: {
	question: SavedPlanningQuestion;
	household: HouseholdFinancialState;
	assumptions: PlanScenarioAssumptions;
}): PlanScenarioIntent {
	const extendedAssumptions = assumptions as ExtendedPlanScenarioAssumptions;

	switch (question.domain) {
		case "income_interruption":
			return incomeInterruptionIntent({
				question,
				household,
				assumptions: extendedAssumptions,
			});

		case "health_costs":
			return healthCostIntent({
				question,
				household,
				assumptions: extendedAssumptions,
			});

		case "care_dependency":
			return careDependencyIntent({
				question,
				household,
				assumptions: extendedAssumptions,
			});

		case "premature_mortality":
			return prematureMortalityIntent({
				question,
				household,
				assumptions: extendedAssumptions,
			});

		case "partner_dependency":
			return partnerDependencyIntent({
				question,
				household,
				assumptions: extendedAssumptions,
			});

		case "longevity":
			/*
			 * Longer-life analysis changes the projection
			 * horizon rather than applying a financial shock.
			 *
			 * It should therefore use a baseline/projection
			 * comparison rather than runFinancialScenario().
			 */
			return {
				questionId: question.id,

				mode: "projection_comparison",

				ready: positiveInteger(assumptions.retirementYearsExtension),

				missingInputs: positiveInteger(assumptions.retirementYearsExtension)
					? []
					: ["Enter the number of additional retirement years you want to test."],

				geneticContext: geneticContext(question),
			};

		case "estate":
			/*
			 * Estate readiness is initially a structured
			 * readiness review, not a cash-flow shock.
			 */
			return {
				questionId: question.id,

				mode: "readiness_review",

				ready: true,

				missingInputs: [],

				geneticContext: geneticContext(question),
			};

		case "healthy_working_life":
			/*
			 * For financial execution, healthy-working-life
			 * disruption maps onto an explicit income
			 * interruption test.
			 */
			return incomeInterruptionIntent({
				question,
				household,
				assumptions: extendedAssumptions,
			});

		case "insurance":
		case "family":
			return {
				questionId: question.id,
				mode: "readiness_review",
				ready: true,
				missingInputs: [],
				geneticContext: geneticContext(question),
			};

		default: {
			const exhaustiveCheck: never = question.domain;

			throw new Error(`Unsupported planning domain: ${String(exhaustiveCheck)}`);
		}
	}
}

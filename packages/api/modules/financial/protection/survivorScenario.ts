import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import { assessResilience } from "../resilience/assessResilience";
import type { ResilienceAssessment } from "../resilience/types";
import { runFinancialScenario } from "../scenarios/scenarioEngine";
import type { ScenarioDefinition, ScenarioResult } from "../scenarios/types";

export interface SurvivorScenarioInput {
	household: HouseholdFinancialState;

	assumptions: ProjectionAssumptions;

	personId: string;

	startDate: string;

	/**
	 * Explicit planning assumption for income that would
	 * disappear from the household following the person's
	 * death.
	 *
	 * This is deliberately supplied by the caller rather
	 * than inferred from genetics or mortality estimates.
	 */
	annualIncomeLost: number;

	/**
	 * Optional explicit additional annual household costs.
	 */
	annualAdditionalExpenses?: number;

	/**
	 * Optional explicit immediate costs associated with
	 * the scenario.
	 */
	oneOffExpense?: number;

	/**
	 * When true, recorded life cover for the affected
	 * person is included as scenario support.
	 */
	includeRecordedLifeInsurance?: boolean;
}

export interface SurvivorScenarioAnalysis {
	personId: string;

	annualIncomeLost: number;

	lifeInsuranceProceeds: number;

	scenario: ScenarioResult;

	resilience: ResilienceAssessment;

	qualifications: string[];
}

function recordedLifeCover(household: HouseholdFinancialState, personId: string): number {
	return household.insurance
		.filter((cover) => cover.personId === personId && cover.type === "life")
		.reduce((total, cover) => total + (cover.sumInsured ?? 0), 0);
}

function nonNegativeFinite(value: number | undefined, label: string): void {
	if (value === undefined) {
		return;
	}

	if (!Number.isFinite(value) || value < 0) {
		throw new Error(`${label} must be a non-negative finite number.`);
	}
}

export function analyseSurvivorScenario(input: SurvivorScenarioInput): SurvivorScenarioAnalysis {
	const {
		household,
		assumptions,
		personId,
		startDate,
		annualIncomeLost,
		annualAdditionalExpenses,
		oneOffExpense,
		includeRecordedLifeInsurance = true,
	} = input;

	const person = household.people.find((candidate) => candidate.id === personId);

	if (!person) {
		throw new Error(`Person "${personId}" does not exist in the household.`);
	}

	nonNegativeFinite(annualIncomeLost, "Annual income lost");

	nonNegativeFinite(annualAdditionalExpenses, "Annual additional expenses");

	nonNegativeFinite(oneOffExpense, "One-off expense");

	const lifeInsuranceProceeds = includeRecordedLifeInsurance
		? recordedLifeCover(household, personId)
		: 0;

	const scenario: ScenarioDefinition = {
		id: `survivor:${personId}:${startDate}`,

		name: "Survivor financial resilience",

		kind: "premature_death",

		affectedPersonId: personId,

		startDate,

		effects: {
			annualIncomeReduction: annualIncomeLost,

			annualAdditionalExpenses,

			oneOffExpense,

			oneOffInsuranceProceeds: lifeInsuranceProceeds,
		},

		rationale:
			"Tests the financial effect of an explicit survivor-planning scenario using user or plan assumptions.",
	};

	const scenarioResult = runFinancialScenario({
		household,
		assumptions,
		scenario,
	});

	const resilience = assessResilience({
		scenarioResult,
	});

	return {
		personId,

		annualIncomeLost,

		lifeInsuranceProceeds,

		scenario: scenarioResult,

		resilience,

		qualifications: [
			"This is a financial planning scenario and does not estimate the probability or timing of death.",
			"Income loss is an explicit planning assumption rather than an inference from genetics.",
			"Recorded life insurance is treated as financial support only when explicitly included in the scenario.",
			"Insurance payment eligibility, exclusions, tax treatment and beneficiary arrangements are not assessed.",
			"The analysis measures household financial resilience rather than recommending an amount of insurance.",
		],
	};
}

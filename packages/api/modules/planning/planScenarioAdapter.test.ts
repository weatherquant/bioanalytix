import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../financial/household/types";
import { buildPlanScenarioIntent, PLAN_SCENARIO_ADAPTER_VERSION } from "./planScenarioAdapter";
import type { PlanScenarioAssumptions, SavedPlanningQuestion } from "./savedPlan";

function household(): HouseholdFinancialState {
	return {
		id: "household-1",
		asOfDate: "2026-09-07",
		currency: "AUD",
		country: "AU",

		people: [
			{
				id: "person-1",
				role: "primary",
				dateOfBirth: "1970-01-01",
				employmentStatus: "employed",
				isFinanciallyDependent: false,
			},
		],

		income: [
			{
				id: "income-1",
				personId: "person-1",
				type: "employment",
				annualAmount: 200000,
				taxable: true,
			},
		],

		expenses: {
			essentialAnnual: 120000,
			discretionaryAnnual: 0,
		},

		assets: [
			{
				id: "cash",
				type: "cash",
				value: 250000,
				liquid: true,
				investable: false,
				incomeProducing: false,
			},
		],

		superannuation: [],

		liabilities: [],

		insurance: [],

		estate: {},

		goals: [],
	};
}

function question(overrides: Partial<SavedPlanningQuestion> = {}): SavedPlanningQuestion {
	return {
		id: "question-1",
		source: "household",
		domain: "income_interruption",
		title: "Income interruption",
		question: "What happens if income stops?",
		rationale: "Test household resilience.",
		significance: "moderate",
		selected: true,
		...overrides,
	};
}

describe("planScenarioAdapter", () => {
	it("exposes an explicit adapter version", () => {
		expect(PLAN_SCENARIO_ADAPTER_VERSION).toBe("1.0.0");
	});

	it("builds an annual income interruption scenario from household income and user duration", () => {
		const intent = buildPlanScenarioIntent({
			question: question(),
			household: household(),
			assumptions: {
				incomeInterruptionMonths: 12,
			},
		});

		expect(intent.ready).toBe(true);
		expect(intent.mode).toBe("financial_scenario");

		expect(intent.scenario).toBeDefined();

		expect(intent.scenario?.kind).toBe("income_interruption");

		expect(intent.scenario?.durationYears).toBe(1);

		expect(intent.scenario?.effects.annualIncomeReduction).toBe(200000);
	});

	it("fails closed rather than rounding partial-year income interruption", () => {
		const intent = buildPlanScenarioIntent({
			question: question(),
			household: household(),
			assumptions: {
				incomeInterruptionMonths: 6,
			},
		});

		expect(intent.ready).toBe(false);

		expect(intent.scenario).toBeUndefined();

		expect(intent.missingInputs.join(" ")).toContain("complete years");
	});

	it("uses explicit user-entered health costs and duration", () => {
		const assumptions = {
			additionalAnnualHealthCosts: 25000,
			healthCostDurationYears: 3,
		} as PlanScenarioAssumptions;

		const intent = buildPlanScenarioIntent({
			question: question({
				domain: "health_costs",
				title: "Higher health costs",
			}),
			household: household(),
			assumptions,
		});

		expect(intent.ready).toBe(true);

		expect(intent.scenario?.kind).toBe("health_cost");

		expect(intent.scenario?.durationYears).toBe(3);

		expect(intent.scenario?.effects.annualAdditionalExpenses).toBe(25000);
	});

	it("records genetic context without changing the financial scenario values", () => {
		const financialQuestion = question({
			id: "financial-question",
			source: "household",
		});

		const geneticQuestion = question({
			id: "genetic-question",
			source: "genetic_profile",
			sourceInsightIds: ["insight-1"],
		});

		const assumptions: PlanScenarioAssumptions = {
			incomeInterruptionMonths: 12,
		};

		const financialIntent = buildPlanScenarioIntent({
			question: financialQuestion,
			household: household(),
			assumptions,
		});

		const geneticIntent = buildPlanScenarioIntent({
			question: geneticQuestion,
			household: household(),
			assumptions,
		});

		expect(financialIntent.geneticContext.informed).toBe(false);

		expect(geneticIntent.geneticContext.informed).toBe(true);

		expect(geneticIntent.geneticContext.sourceInsightIds).toEqual(["insight-1"]);

		expect(geneticIntent.scenario?.effects).toEqual(financialIntent.scenario?.effects);

		expect(geneticIntent.scenario?.durationYears).toBe(financialIntent.scenario?.durationYears);
	});

	it("routes longevity to projection comparison rather than the financial shock engine", () => {
		const intent = buildPlanScenarioIntent({
			question: question({
				domain: "longevity",
				source: "longevity",
			}),
			household: household(),
			assumptions: {
				retirementYearsExtension: 10,
			},
		});

		expect(intent.mode).toBe("projection_comparison");

		expect(intent.ready).toBe(true);

		expect(intent.scenario).toBeUndefined();
	});

	it("routes estate readiness to a readiness review", () => {
		const intent = buildPlanScenarioIntent({
			question: question({
				domain: "estate",
				source: "estate",
			}),
			household: household(),
			assumptions: {},
		});

		expect(intent.mode).toBe("readiness_review");

		expect(intent.ready).toBe(true);

		expect(intent.scenario).toBeUndefined();
	});
});

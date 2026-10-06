import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import { runFinancialScenario } from "../scenarios/scenarioEngine";
import type { ScenarioDefinition } from "../scenarios/types";
import { assessResilience } from "./assessResilience";
import { ResilienceAssessmentError } from "./types";

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
			essentialAnnual: 60000,

			discretionaryAnnual: 20000,
		},

		assets: [
			{
				id: "cash-1",

				type: "cash",

				value: 50000,

				liquid: true,

				investable: true,

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

function assumptions(): ProjectionAssumptions {
	return {
		inflationRate: 0,

		wageGrowthRate: 0,

		spendingGrowthRate: 0,

		cashReturnRate: 0,

		investmentReturnRate: 0,

		superReturnRate: 0,

		effectiveTaxRate: 0,

		projectionEndDate: "2028-09-01",
	};
}

function scenario(effects: ScenarioDefinition["effects"]): ScenarioDefinition {
	return {
		id: "scenario-1",

		name: "Financial stress test",

		kind: "income_interruption",

		affectedPersonId: "person-1",

		startDate: "2026-09-01",

		durationYears: 1,

		effects,
	};
}

function runScenario(effects: ScenarioDefinition["effects"]) {
	return runFinancialScenario({
		household: household(),

		assumptions: assumptions(),

		scenario: scenario(effects),
	});
}

describe("assessResilience", () => {
	it("classifies a fully funded scenario as resilient", () => {
		const result = assessResilience({
			scenarioResult: runScenario({
				oneOffExpense: 30000,
			}),
		});

		expect(result.level).toBe("resilient");

		expect(result.grossScenarioCost).toBe(30000);

		expect(result.additionalUnfundedNeed).toBe(0);

		expect(result.absorbedScenarioCost).toBe(30000);

		expect(result.absorptionRatio).toBe(1);
	});

	it("classifies a mostly absorbed scenario with a residual gap as strained", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.expenses = {
			essentialAnnual: 0,

			discretionaryAnnual: 0,
		};

		inputHousehold.assets[0]!.value = 90000;

		const scenarioResult = runFinancialScenario({
			household: inputHousehold,

			assumptions: assumptions(),

			scenario: scenario({
				oneOffExpense: 100000,
			}),
		});

		const result = assessResilience({
			scenarioResult,
		});

		expect(result.additionalUnfundedNeed).toBe(10000);

		expect(result.absorbedScenarioCost).toBe(90000);

		expect(result.absorptionRatio).toBeCloseTo(0.9);

		expect(result.level).toBe("strained");
	});

	it("classifies a materially underfunded scenario as unfunded", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.expenses = {
			essentialAnnual: 0,

			discretionaryAnnual: 0,
		};

		inputHousehold.assets[0]!.value = 20000;

		const scenarioResult = runFinancialScenario({
			household: inputHousehold,

			assumptions: assumptions(),

			scenario: scenario({
				oneOffExpense: 100000,
			}),
		});

		const result = assessResilience({
			scenarioResult,
		});

		expect(result.additionalUnfundedNeed).toBe(80000);

		expect(result.absorbedScenarioCost).toBe(20000);

		expect(result.absorptionRatio).toBeCloseTo(0.2);

		expect(result.level).toBe("unfunded");
	});

	it("recognises explicit financial support when assessing resilience", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.expenses = {
			essentialAnnual: 0,

			discretionaryAnnual: 0,
		};

		inputHousehold.assets[0]!.value = 20000;

		const scenarioResult = runFinancialScenario({
			household: inputHousehold,

			assumptions: assumptions(),

			scenario: scenario({
				oneOffExpense: 100000,

				oneOffInsuranceProceeds: 70000,
			}),
		});

		const result = assessResilience({
			scenarioResult,
		});

		expect(result.scenarioSupport).toBe(70000);

		expect(result.additionalUnfundedNeed).toBe(10000);

		expect(result.absorbedScenarioCost).toBe(90000);

		expect(result.level).toBe("strained");
	});

	it("reports the minimum stressed liquidity across the projection", () => {
		const result = assessResilience({
			scenarioResult: runScenario({
				oneOffExpense: 30000,
			}),
		});

		expect(result.minimumStressedLiquidWealth).toBeGreaterThanOrEqual(0);

		expect(result.endingStressedLiquidWealth).toBeGreaterThanOrEqual(0);
	});

	it("preserves the first additional unfunded date from the scenario result", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.expenses = {
			essentialAnnual: 0,

			discretionaryAnnual: 0,
		};

		inputHousehold.assets[0]!.value = 10000;

		const scenarioResult = runFinancialScenario({
			household: inputHousehold,

			assumptions: assumptions(),

			scenario: scenario({
				oneOffExpense: 50000,
			}),
		});

		const result = assessResilience({
			scenarioResult,
		});

		expect(result.firstAdditionalUnfundedDate).toBe("2027-09-01");
	});

	it("allows the resilience classification threshold to be explicit and configurable", () => {
		const inputHousehold = household();

		inputHousehold.income = [];

		inputHousehold.expenses = {
			essentialAnnual: 0,

			discretionaryAnnual: 0,
		};

		inputHousehold.assets[0]!.value = 90000;

		const scenarioResult = runFinancialScenario({
			household: inputHousehold,

			assumptions: assumptions(),

			scenario: scenario({
				oneOffExpense: 100000,
			}),
		});

		const result = assessResilience({
			scenarioResult,

			thresholds: {
				resilientAbsorptionRatio: 0.95,
			},
		});

		expect(result.absorptionRatio).toBeCloseTo(0.9);

		expect(result.level).toBe("unfunded");
	});

	it("fails closed for invalid classification thresholds", () => {
		expect(() =>
			assessResilience({
				scenarioResult: runScenario({
					oneOffExpense: 10000,
				}),

				thresholds: {
					resilientAbsorptionRatio: 1.1,
				},
			}),
		).toThrow(ResilienceAssessmentError);
	});
});

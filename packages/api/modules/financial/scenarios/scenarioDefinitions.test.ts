import { describe, expect, it } from "vitest";

import { SCENARIO_KINDS, type ScenarioDefinition } from "./types";

describe("financial scenario definitions", () => {
	it("supports the initial Bioanalytix financial resilience scenario families", () => {
		expect(SCENARIO_KINDS).toEqual([
			"income_interruption",
			"premature_death",
			"care_dependency",
			"health_cost",
			"partner_dependency",
		]);
	});

	it("represents financial consequences rather than biological predictions", () => {
		const definition: ScenarioDefinition = {
			id: "care-1",

			name: "Later-life care dependency",

			kind: "care_dependency",

			startDate: "2030-09-01",

			durationYears: 3,

			effects: {
				annualAdditionalExpenses: 30000,
			},

			rationale:
				"Test whether household liquid resources remain sufficient during a sustained period of additional care expenditure.",
		};

		expect(definition.kind).toBe("care_dependency");

		expect(definition.effects.annualAdditionalExpenses).toBe(30000);
	});

	it("does not require probability, diagnosis, genotype, or longevity adjustments", () => {
		const definition: ScenarioDefinition = {
			id: "health-cost-1",

			name: "Additional health expenditure",

			kind: "health_cost",

			startDate: "2028-09-01",

			durationYears: 2,

			effects: {
				annualAdditionalExpenses: 15000,
			},
		};

		const serialized = JSON.stringify(definition);

		expect("probability" in definition).toBe(false);

		expect(serialized).not.toContain("genotype");

		expect(serialized).not.toContain("rsid");

		expect(serialized).not.toContain("absoluteRisk");

		expect(serialized).not.toContain("longevityAdjustment");

		expect(serialized).not.toContain("diagnosis");
	});

	it("requires scenario financial parameters to remain explicit", () => {
		const definition: ScenarioDefinition = {
			id: "death-1",

			name: "Premature mortality resilience",

			kind: "premature_death",

			affectedPersonId: "person-1",

			startDate: "2030-09-01",

			effects: {
				annualIncomeReduction: 70000,

				oneOffExpense: 20000,

				oneOffInsuranceProceeds: 500000,
			},
		};

		expect(definition.effects.annualIncomeReduction).toBe(70000);

		expect(definition.effects.oneOffExpense).toBe(20000);

		expect(definition.effects.oneOffInsuranceProceeds).toBe(500000);
	});
});

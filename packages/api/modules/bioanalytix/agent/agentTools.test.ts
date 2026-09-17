import { describe, expect, it } from "vitest";

import { toHouseholdFinancialState } from "../onboarding/toHouseholdFinancialState";
import { buildProfile } from "./agentContext.test";
import { runBioanalytixAgentTool } from "./agentTools";

function buildHousehold() {
	return toHouseholdFinancialState({
		householdId: "agent-tools-test",
		input: {
			dateOfBirth: "1975-04-12",
			country: "AU",
			currency: "AUD",
			employmentStatus: "employed",
			hasPartner: false,
			hasDependants: false,
			annualHouseholdIncome: 160_000,
			cashAndSavings: 50_000,
			investments: 120_000,
			propertyAndOtherAssets: 800_000,
			retirementSavings: 350_000,
			totalDebt: 300_000,
			annualHouseholdSpending: 85_000,
			lifeInsuranceCover: 500_000,
			incomeProtectionAnnualBenefit: 80_000,
			desiredInheritance: 600_000,
			expectedRetirementAge: 60,
		},
	});
}

describe("runBioanalytixAgentTool", () => {
	it("returns bounded plan context for review_plan", () => {
		const result = runBioanalytixAgentTool({
			tool: "review_plan",
			household: buildHousehold(),
			profile: buildProfile(),
		});

		expect(result.status).toBe("completed");

		if (result.status !== "completed" || result.tool !== "review_plan") {
			throw new Error("Expected completed review_plan result.");
		}

		expect(result.result.household.currency).toBe("AUD");
		expect(result.result.guardrails.geneticsChangesFinancialParameters).toBe(false);
	});

	it("assesses protection using the household financial state", () => {
		const household = buildHousehold();

		const result = runBioanalytixAgentTool({
			tool: "assess_protection",
			household,
			profile: buildProfile(),
		});

		expect(result.status).toBe("completed");

		if (result.status !== "completed" || result.tool !== "assess_protection") {
			throw new Error("Expected completed assess_protection result.");
		}

		expect(result.result.lifeInsuranceCover).toBe(500_000);
		expect(result.result.personId).toBe(household.people[0]!.id);
	});

	it("assesses the current estate position directly from household data", () => {
		const result = runBioanalytixAgentTool({
			tool: "assess_estate",
			household: buildHousehold(),
			profile: buildProfile(),
		});

		expect(result.status).toBe("completed");

		if (result.status !== "completed" || result.tool !== "assess_estate") {
			throw new Error("Expected completed assess_estate result.");
		}

		expect(result.result.inheritanceGoal).toBe(600_000);
		expect(result.result.netHouseholdResources).toBeGreaterThan(0);
	});

	it("requires an explicit retirement age before running a retirement comparison", () => {
		const result = runBioanalytixAgentTool({
			tool: "compare_retirement_age",
			household: buildHousehold(),
			profile: buildProfile(),
		});

		expect(result).toEqual({
			status: "needs_input",
			tool: "compare_retirement_age",
			missingInputs: [
				{
					key: "alternativeRetirementAge",
					question: "What retirement age would you like me to test?",
					reason: "Retirement age must be an explicit planning assumption rather than inferred from genetics or other personal information.",
				},
			],
		});
	});

	it("requires explicit survivor assumptions rather than inferring them", () => {
		const result = runBioanalytixAgentTool({
			tool: "run_survivor_scenario",
			household: buildHousehold(),
			profile: buildProfile(),
		});

		expect(result.status).toBe("needs_input");

		if (result.status !== "needs_input" || result.tool !== "run_survivor_scenario") {
			throw new Error("Expected survivor scenario to require input.");
		}

		expect(result.missingInputs.map((input) => input.key)).toEqual([
			"startDate",
			"annualIncomeLost",
		]);
	});

	it("requires explicit assumptions before comparing life insurance", () => {
		const result = runBioanalytixAgentTool({
			tool: "compare_life_insurance",
			household: buildHousehold(),
			profile: buildProfile(),
		});

		expect(result.status).toBe("needs_input");

		if (result.status !== "needs_input" || result.tool !== "compare_life_insurance") {
			throw new Error("Expected life insurance comparison to require input.");
		}

		expect(result.missingInputs.map((input) => input.key)).toEqual([
			"startDate",
			"annualIncomeLost",
		]);
	});
});

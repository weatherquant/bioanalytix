import { describe, expect, it, vi } from "vitest";

import { toHouseholdFinancialState } from "../onboarding/toHouseholdFinancialState";
import type { BioanalytixAgentContext } from "./agentContext";
import { buildProfile } from "./agentContext.test";
import type { BioanalytixAgentDecision } from "./agentContract";
import { runBioanalytixAgent, type BioanalytixAgentDependencies } from "./agentOrchestrator";

function buildHousehold() {
	return toHouseholdFinancialState({
		householdId: "agent-orchestrator-test",
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

type ExplanationInput = {
	question: string;
	context: BioanalytixAgentContext;
	toolResult: Awaited<ReturnType<typeof import("./agentTools").runBioanalytixAgentTool>>;
};

describe("runBioanalytixAgent", () => {
	it("runs deterministic retirement analysis before generating the explanation", async () => {
		const generateDecision = vi.fn<
			(input: {
				question: string;
				context: BioanalytixAgentContext;
			}) => Promise<BioanalytixAgentDecision>
		>(async () => ({
			intent: "retirement",
			tool: "compare_retirement_age",
			parameters: {
				personId: null,
				alternativeRetirementAge: 55,
				startDate: null,
				annualIncomeLost: null,
				annualAdditionalExpenses: null,
				oneOffExpense: null,
			},
			missingAssumptions: [],
		}));

		const generateExplanation = vi.fn<(input: ExplanationInput) => Promise<string>>(
			async () => {
				return "Testing retirement at 55 changes the sustainable retirement income supported by the modelled plan.";
			},
		);

		const dependencies: BioanalytixAgentDependencies = {
			generateDecision,
			generateExplanation,
		};

		const result = await runBioanalytixAgent(
			{
				question: "Can I afford to retire at 55?",
				household: buildHousehold(),
				profile: buildProfile(),
			},
			dependencies,
		);

		expect(result.intent).toBe("retirement");
		expect(result.toolUsed).toBe("compare_retirement_age");
		expect(result.missingAssumptions).toEqual([]);
		expect(result.proposedPlanChange).toBeNull();

		expect(generateExplanation).toHaveBeenCalledTimes(1);

		const explanationInput = generateExplanation.mock.calls[0]?.[0];

		expect(explanationInput).toBeDefined();

		if (!explanationInput) {
			throw new Error("Expected the explanation model to receive a deterministic result.");
		}

		expect(explanationInput.toolResult.status).toBe("completed");
		expect(explanationInput.toolResult.tool).toBe("compare_retirement_age");

		if (
			explanationInput.toolResult.status !== "completed" ||
			explanationInput.toolResult.tool !== "compare_retirement_age"
		) {
			throw new Error("Expected completed retirement comparison.");
		}

		expect(explanationInput.toolResult.result.baselineRetirementAge).toBe(60);

		expect(explanationInput.toolResult.result.alternativeRetirementAge).toBe(55);
	}, 60_000);

	it("asks for missing insurance assumptions without invoking the explanation model", async () => {
		const generateDecision = vi.fn<
			(input: {
				question: string;
				context: BioanalytixAgentContext;
			}) => Promise<BioanalytixAgentDecision>
		>(async () => ({
			intent: "protection",
			tool: "compare_life_insurance",
			parameters: {
				personId: null,
				alternativeRetirementAge: null,
				startDate: null,
				annualIncomeLost: null,
				annualAdditionalExpenses: null,
				oneOffExpense: null,
			},
			missingAssumptions: [],
		}));

		const generateExplanation = vi.fn<(input: ExplanationInput) => Promise<string>>(
			async () => {
				throw new Error("Explanation model must not run when assumptions are missing.");
			},
		);

		const dependencies: BioanalytixAgentDependencies = {
			generateDecision,
			generateExplanation,
		};

		const result = await runBioanalytixAgent(
			{
				question: "Would we be okay without my life insurance?",
				household: buildHousehold(),
				profile: buildProfile(),
			},
			dependencies,
		);

		expect(result.intent).toBe("protection");
		expect(result.toolUsed).toBe("compare_life_insurance");
		expect(result.proposedPlanChange).toBeNull();

		expect(result.missingAssumptions.map((assumption) => assumption.key)).toEqual([
			"startDate",
			"annualIncomeLost",
		]);

		expect(result.answer).toContain("What date should I use for the insurance comparison?");

		expect(result.answer).toContain(
			"How much annual household income should I assume would be lost?",
		);

		expect(generateExplanation).not.toHaveBeenCalled();
	});
});

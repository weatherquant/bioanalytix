import { describe, expect, it, vi } from "vitest";

import { toHouseholdFinancialState } from "../onboarding/toHouseholdFinancialState";
import type { BioanalytixAgentContext } from "./agentContext";
import { buildProfile } from "./agentContext.test";
import type { BioanalytixAgentDecision } from "./agentContract";
import { runBioanalytixAgent, type BioanalytixAgentDependencies } from "./agentOrchestrator";
import type { BioanalytixAgentToolResult } from "./agentTools";

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
	toolResult: BioanalytixAgentToolResult;
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
			generateNoToolResponse: vi.fn(
				async () => "That question is outside the current Bioanalytix analysis.",
			),
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
				annualIncomeLost: 160_000,
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
			generateNoToolResponse: vi.fn(
				async () => "That question is outside the current Bioanalytix analysis.",
			),
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
			"annualIncomeLost",
		]);

		expect(result.answer).toBe(
			"I need a little more information before I can run that analysis.",
		);

		expect(generateExplanation).not.toHaveBeenCalled();
	});

	it("accepts an annual income loss explicitly stated by the user", async () => {
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
				annualIncomeLost: 100_000,
				annualAdditionalExpenses: null,
				oneOffExpense: null,
			},
			missingAssumptions: [],
		}));

		const generateExplanation = vi.fn<(input: ExplanationInput) => Promise<string>>(
			async () => {
				return "The comparison has been completed using the explicitly stated annual income loss.";
			},
		);

		const dependencies: BioanalytixAgentDependencies = {
			generateDecision,
			generateExplanation,
			generateNoToolResponse: vi.fn(
				async () => "That question is outside the current Bioanalytix analysis.",
			),
		};

		const result = await runBioanalytixAgent(
			{
				question:
					"If I died and our household lost $100,000 of income a year, what difference would my life insurance make?",
				household: buildHousehold(),
				profile: buildProfile(),
			},
			dependencies,
		);

		expect(result.intent).toBe("protection");
		expect(result.toolUsed).toBe("compare_life_insurance");
		expect(result.missingAssumptions).toEqual([]);
		expect(result.continuation).toBeNull();
		expect(result.proposedPlanChange).toBeNull();

		expect(generateExplanation).toHaveBeenCalledTimes(1);

		const explanationInput = generateExplanation.mock.calls[0]?.[0];

		expect(explanationInput).toBeDefined();

		if (!explanationInput) {
			throw new Error(
				"Expected the explanation model to receive the deterministic insurance comparison.",
			);
		}

		expect(explanationInput.toolResult.status).toBe("completed");
		expect(explanationInput.toolResult.tool).toBe("compare_life_insurance");
	});

	it.each([
		{
			name: "genetics question without an approved financial tool",
			question: "Does my genetic result mean I will get Alzheimer's?",
			intent: "genetics_planning" as const,
			response:
				"A genetic result is not a diagnosis or a prediction that you will develop a condition. Bioanalytix can help explain supported genetic evidence and why particular financial planning questions may be worth exploring.",
		},
		{
			name: "major personal decision outside Bioanalytix's role",
			question: "Should I get divorced?",
			intent: "unsupported" as const,
			response:
				"Bioanalytix cannot make that personal decision for you. If you are considering separation, it can help explore general financial consequences using household assumptions you choose.",
		},
		{
			name: "unrelated general-purpose question",
			question: "What's the weather tomorrow?",
			intent: "unsupported" as const,
			response:
				"That question is outside Ask Bioanalytix's scope. I can help with genetics-informed financial planning questions and your Bioanalytix Plan.",
		},
	])("uses the bounded no-tool response for $name", async ({ question, intent, response }) => {
		const generateDecision = vi.fn<
			(input: {
				question: string;
				context: BioanalytixAgentContext;
			}) => Promise<BioanalytixAgentDecision>
		>(async () => ({
			intent,
			tool: null,
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
				throw new Error("Deterministic explanation must not run when no tool is selected.");
			},
		);

		const generateNoToolResponse = vi.fn<
			BioanalytixAgentDependencies["generateNoToolResponse"]
		>(async () => response);

		const dependencies: BioanalytixAgentDependencies = {
			generateDecision,
			generateExplanation,
			generateNoToolResponse,
		};

		const result = await runBioanalytixAgent(
			{
				question,
				household: buildHousehold(),
				profile: buildProfile(),
			},
			dependencies,
		);

		expect(result.intent).toBe(intent);
		expect(result.toolUsed).toBeNull();
		expect(result.answer).toBe(response);
		expect(result.missingAssumptions).toEqual([]);
		expect(result.continuation).toBeNull();
		expect(result.proposedPlanChange).toBeNull();

		expect(generateNoToolResponse).toHaveBeenCalledTimes(1);
		expect(generateExplanation).not.toHaveBeenCalled();

		const noToolInput = generateNoToolResponse.mock.calls[0]?.[0];

		expect(noToolInput).toBeDefined();

		if (!noToolInput) {
			throw new Error("Expected the bounded no-tool model to receive the question.");
		}

		expect(noToolInput.question).toBe(question);
		expect(noToolInput.intent).toBe(intent);
	});
});

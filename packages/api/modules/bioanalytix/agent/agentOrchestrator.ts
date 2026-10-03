import { generateText, textModel } from "@repo/ai";

import type { HouseholdFinancialState } from "../../financial/household/types";
import type { BioanalytixPlanningProfileV1 } from "../../planning/planningProfile";
import { buildBioanalytixAgentContext } from "./agentContext";
import {
	bioanalytixAgentAnswerSchema,
	type BioanalytixAgentAnswer,
	type BioanalytixAgentContinuation,
	type BioanalytixAgentDecision,
	type BioanalytixAgentToolParameters,
} from "./agentContract";
import { generateBioanalytixAgentDecision } from "./agentDecision";
import {
	BIOANALYTIX_AGENT_SYSTEM_PROMPT,
	buildBioanalytixAgentExplanationPrompt,
	buildBioanalytixAgentNoToolPrompt,
} from "./agentPrompt";
import { runBioanalytixAgentTool, type BioanalytixAgentToolResult } from "./agentTools";

export interface RunBioanalytixAgentInput {
	question: string;
	household: HouseholdFinancialState;
	profile?: BioanalytixPlanningProfileV1 | null;
	continuation?: BioanalytixAgentContinuation | null;
}

export interface BioanalytixAgentDependencies {
	generateDecision: (input: {
		question: string;
		context: ReturnType<typeof buildBioanalytixAgentContext>;
	}) => Promise<BioanalytixAgentDecision>;

	generateNoToolResponse: (input: {
		question: string;
		context: ReturnType<typeof buildBioanalytixAgentContext>;
		intent: BioanalytixAgentDecision["intent"];
	}) => Promise<string>;

	generateExplanation: (input: {
		question: string;
		toolResult: BioanalytixAgentToolResult;
	}) => Promise<string>;
}

const defaultDependencies: BioanalytixAgentDependencies = {
	generateDecision: generateBioanalytixAgentDecision,

	generateNoToolResponse: async ({ question, context, intent }) => {
		const response = await generateText({
			model: textModel,
			system: BIOANALYTIX_AGENT_SYSTEM_PROMPT,
			prompt: buildBioanalytixAgentNoToolPrompt({
				question,
				context,
				intent,
			}),
		});

		return response.text;
	},

	generateExplanation: async ({ question, toolResult }) => {
		const explanation = await generateText({
			model: textModel,
			system: "You are Ask Bioanalytix. Explain deterministic Bioanalytix financial analysis clearly and conservatively. The supplied deterministic result is authoritative. Never replace the supplied calculation with your own calculation, invent missing facts, or make a recommendation that the calculation does not establish.",
			prompt: buildBioanalytixAgentExplanationPrompt({
				question,
				toolResult,
			}),
		});

		return explanation.text;
	},
};

function emptyParameters(): BioanalytixAgentToolParameters {
	return {
		personId: null,
		alternativeRetirementAge: null,
		startDate: null,
		annualIncomeLost: null,
		annualAdditionalExpenses: null,
		oneOffExpense: null,
	};
}

function toToolParameters(parameters: BioanalytixAgentToolParameters) {
	return {
		personId: parameters.personId ?? undefined,
		alternativeRetirementAge: parameters.alternativeRetirementAge ?? undefined,
		startDate: parameters.startDate ?? undefined,
		annualIncomeLost: parameters.annualIncomeLost ?? undefined,
		annualAdditionalExpenses: parameters.annualAdditionalExpenses ?? undefined,
		oneOffExpense: parameters.oneOffExpense ?? undefined,
	};
}

function questionExplicitlyStatesAnnualIncomeLost(question: string): boolean {
	const normalized = question.toLowerCase();

	const hasIncomeLossLanguage =
		/\b(income|salary|earnings|wages)\b/.test(normalized) &&
		/\b(lost|lose|loss|disappear|disappeared|gone|reduced|reduction)\b/.test(normalized);

	const hasExplicitAmount =
		/\$\s*\d[\d,]*(?:\.\d+)?\s*(?:k|m|thousand|million)?\b/i.test(question) ||
		/\b\d[\d,]*(?:\.\d+)?\s*(?:k|m|thousand|million)\b/i.test(question);

	return hasIncomeLossLanguage && hasExplicitAmount;
}

function questionExplicitlyStatesAdditionalRetirementSpending(question: string): boolean {
	const normalized = question.toLowerCase();

	const hasRetirementSpendingLanguage =
		/\b(retirement|retire|retired)\b/.test(normalized) &&
		/\b(spend|spending|expense|expenses)\b/.test(normalized);

	const hasExplicitAmount =
		/\$\s*\d[\d,]*(?:\.\d+)?\s*(?:k|m|thousand|million)?\b/i.test(question) ||
		/\b\d[\d,]*(?:\.\d+)?\s*(?:k|m|thousand|million)\b/i.test(question);

	return hasRetirementSpendingLanguage && hasExplicitAmount;
}

function questionIsRetirementSpendingScenario(question: string): boolean {
	const normalized = question.toLowerCase();

	const hasRetirementLanguage = /\b(retirement|retire|retired)\b/.test(normalized);

	const hasSpendingLanguage = /\b(spend|spending|expense|expenses)\b/.test(normalized);

	const explicitlyAsksAboutRetirementAge =
		/\b(retirement age|retire at|retiring at|retire earlier|retire later)\b/.test(normalized);

	return hasRetirementLanguage && hasSpendingLanguage && !explicitlyAsksAboutRetirementAge;
}

function enforceExplicitInitialAssumptions({
	question,
	decision,
}: {
	question: string;
	decision: BioanalytixAgentDecision;
}): BioanalytixAgentDecision {
	const parameters = {
		...emptyParameters(),
		...decision.parameters,
	};

	const tool = questionIsRetirementSpendingScenario(question)
		? "compare_retirement_spending"
		: decision.tool;

	if (
		(tool === "compare_life_insurance" || tool === "run_survivor_scenario") &&
		!questionExplicitlyStatesAnnualIncomeLost(question)
	) {
		parameters.annualIncomeLost = null;
	}

	if (
		tool === "compare_retirement_spending" &&
		!questionExplicitlyStatesAdditionalRetirementSpending(question)
	) {
		parameters.annualAdditionalExpenses = null;
	}

	return {
		...decision,
		tool,
		parameters,
	};
}

function buildContinuation({
	question,
	decision,
}: {
	question: string;
	decision: BioanalytixAgentDecision;
}): BioanalytixAgentContinuation | null {
	if (!decision.tool) {
		return null;
	}

	return {
		originalQuestion: question,
		intent: decision.intent,
		tool: decision.tool,
		parameters: {
			...emptyParameters(),
			...decision.parameters,
		},
	};
}

function formatCurrency(value: number): string {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD",
		maximumFractionDigits: 0,
	}).format(value);
}

function formatPercentage(value: number): string {
	return `${(value * 100).toFixed(1)}%`;
}

function buildRetirementSpendingExplanation(
	toolResult: Extract<
		BioanalytixAgentToolResult,
		{ status: "completed"; tool: "compare_retirement_spending" }
	>,
): string {
	const result = toolResult.result;

	const baselineShortfall = result.baseline.summary.probabilityOfAnyUnfundedCashFlow;
	const alternativeShortfall = result.alternative.summary.probabilityOfAnyUnfundedCashFlow;

	const shortfallChange = (alternativeShortfall - baselineShortfall) * 100;

	const baselineEndingWealth = result.baseline.summary.endingNetWorth.percentiles.p50;
	const alternativeEndingWealth = result.alternative.summary.endingNetWorth.percentiles.p50;

	const endingWealthChange = alternativeEndingWealth - baselineEndingWealth;

	return [
		`Spending an additional ${formatCurrency(result.annualAdditionalRetirementSpending)} per year increases your modelled annual retirement spending from ${formatCurrency(result.baselineAnnualRetirementSpending)} to ${formatCurrency(result.alternativeAnnualRetirementSpending)}.`,
		"",
		"**Funding resilience**",
		`Baseline probability of an unfunded cash-flow period: ${formatPercentage(baselineShortfall)}`,
		`Higher-spending scenario: ${formatPercentage(alternativeShortfall)}`,
		`Change: ${shortfallChange >= 0 ? "+" : ""}${shortfallChange.toFixed(1)} percentage points`,
		"",
		"**Median ending net worth**",
		`Baseline: ${formatCurrency(baselineEndingWealth)}`,
		`Higher-spending scenario: ${formatCurrency(alternativeEndingWealth)}`,
		`Difference: ${endingWealthChange >= 0 ? "+" : "−"}${formatCurrency(Math.abs(endingWealthChange))}`,
		"",
		`This comparison uses ${result.simulationCount.toLocaleString("en-AU")} simulated market paths and holds retirement age ${result.retirementAge}, the ${result.strategyName ?? result.strategyId} portfolio strategy, market paths and other projection assumptions constant while changing retirement spending.`,
		"",
		"These are illustrative simulated outcomes, not a forecast, guarantee or recommendation.",
	].join("\n");
}

function buildRetirementSpendingAnalysis(
	toolResult: Extract<
		BioanalytixAgentToolResult,
		{ status: "completed"; tool: "compare_retirement_spending" }
	>,
) {
	const result = toolResult.result;

	const series = result.baseline.summary.years.map((baselineYear, index) => {
		const alternativeYear = result.alternative.summary.years[index];

		if (!alternativeYear) {
			throw new Error("Retirement spending comparison contains misaligned lifecycle years.");
		}

		return {
			yearIndex: baselineYear.yearIndex,
			projectionDate: baselineYear.projectionDate,
			primaryAge: baselineYear.primaryAge,
			baselineLiquidWealth: baselineYear.liquidWealth.percentiles,
			alternativeLiquidWealth: alternativeYear.liquidWealth.percentiles,
		};
	});

	return {
		type: "retirement_spending_comparison" as const,
		retirementAge: result.retirementAge,
		strategyId: result.strategyId,
		strategyName: result.strategyName,
		simulationCount: result.simulationCount,

		baselineAnnualRetirementSpending: result.baselineAnnualRetirementSpending,
		alternativeAnnualRetirementSpending: result.alternativeAnnualRetirementSpending,
		annualAdditionalRetirementSpending: result.annualAdditionalRetirementSpending,

		baselineShortfallProbability: result.baseline.summary.probabilityOfAnyUnfundedCashFlow,
		alternativeShortfallProbability:
			result.alternative.summary.probabilityOfAnyUnfundedCashFlow,

		baselineTotalUnfundedCashFlow: result.baseline.summary.totalUnfundedCashFlow.percentiles,
		alternativeTotalUnfundedCashFlow:
			result.alternative.summary.totalUnfundedCashFlow.percentiles,

		baselineEndingNetWorth: result.baseline.summary.endingNetWorth.percentiles,
		alternativeEndingNetWorth: result.alternative.summary.endingNetWorth.percentiles,

		series,
	};
}

async function executeDecision({
	question,
	decision,
	household,
	profile,
	context,
	dependencies,
}: {
	question: string;
	decision: BioanalytixAgentDecision;
	household: HouseholdFinancialState;
	profile?: BioanalytixPlanningProfileV1 | null;
	context: ReturnType<typeof buildBioanalytixAgentContext>;
	dependencies: BioanalytixAgentDependencies;
}): Promise<BioanalytixAgentAnswer> {
	if (!decision.tool) {
		const answer = await dependencies.generateNoToolResponse({
			question,
			context,
			intent: decision.intent,
		});

		return bioanalytixAgentAnswerSchema.parse({
			answer,
			intent: decision.intent,
			toolUsed: null,
			missingAssumptions: [],
			continuation: null,
			proposedPlanChange: null,
			analysis: null,
		});
	}

	const toolResult = runBioanalytixAgentTool({
		tool: decision.tool,
		household,
		profile,
		parameters: toToolParameters(decision.parameters),
	});

	if (toolResult.status === "needs_input") {
		return bioanalytixAgentAnswerSchema.parse({
			answer: "I need a little more information before I can run that analysis.",
			intent: decision.intent,
			toolUsed: decision.tool,
			missingAssumptions: toolResult.missingInputs,
			continuation: buildContinuation({
				question,
				decision,
			}),
			proposedPlanChange: null,
			analysis: null,
		});
	}

	if (toolResult.status === "completed" && toolResult.tool === "compare_retirement_spending") {
		const explanation = buildRetirementSpendingExplanation(toolResult);

		return bioanalytixAgentAnswerSchema.parse({
			answer: explanation,
			intent: decision.intent,
			toolUsed: toolResult.tool,
			missingAssumptions: [],
			continuation: null,
			proposedPlanChange: null,
			analysis: buildRetirementSpendingAnalysis(toolResult),
		});
	}

	const explanation = await dependencies.generateExplanation({
		question,
		toolResult,
	});

	return bioanalytixAgentAnswerSchema.parse({
		answer: explanation,
		intent: decision.intent,
		toolUsed: toolResult.tool,
		missingAssumptions: [],
		continuation: null,
		proposedPlanChange: null,
		analysis: null,
	});
}

export async function runBioanalytixAgent(
	input: RunBioanalytixAgentInput,
	dependencies: BioanalytixAgentDependencies = defaultDependencies,
): Promise<BioanalytixAgentAnswer> {
	const context = buildBioanalytixAgentContext({
		household: input.household,
		profile: input.profile,
	});

	/*
	 * A continuation is deliberately not sent back through the model for
	 * tool selection. The original approved tool and intent are retained.
	 *
	 * The next UI step will collect explicit missing values and place them
	 * into continuation.parameters before resubmitting.
	 */
	if (input.continuation) {
		const decision: BioanalytixAgentDecision = {
			intent: input.continuation.intent,
			tool: input.continuation.tool,
			parameters: {
				...emptyParameters(),
				...input.continuation.parameters,
			},
			missingAssumptions: [],
		};

		return executeDecision({
			question: input.continuation.originalQuestion,
			decision,
			household: input.household,
			profile: input.profile,
			context,
			dependencies,
		});
	}

	const generatedDecision = await dependencies.generateDecision({
		question: input.question,
		context,
	});

	const decision = enforceExplicitInitialAssumptions({
		question: input.question,
		decision: generatedDecision,
	});

	return executeDecision({
		question: input.question,
		decision,
		household: input.household,
		profile: input.profile,
		context,
		dependencies,
	});
}

import { z } from "zod";

export const BIOANALYTIX_AGENT_VERSION = "1.0.0" as const;

export const bioanalytixAgentIntentSchema = z.enum([
	"general_plan",
	"retirement",
	"protection",
	"estate",
	"financial_resilience",
	"genetics_planning",
	"unsupported",
]);

export type BioanalytixAgentIntent = z.infer<typeof bioanalytixAgentIntentSchema>;

export const bioanalytixToolNameSchema = z.enum([
	"review_plan",
	"compare_retirement_age",
	"compare_retirement_spending",
	"assess_protection",
	"run_survivor_scenario",
	"compare_life_insurance",
	"assess_estate",
]);

export type BioanalytixToolName = z.infer<typeof bioanalytixToolNameSchema>;

export const bioanalytixMissingAssumptionSchema = z.object({
	key: z.string().min(1),
	question: z.string().min(1),
	reason: z.string().min(1),
});

export type BioanalytixMissingAssumption = z.infer<typeof bioanalytixMissingAssumptionSchema>;

export const bioanalytixProposedPlanChangeSchema = z.object({
	type: z.enum([
		"planning_priority",
		"planning_note",
		"scenario_assumption",
		"estate_objective",
		"review_item",
	]),
	title: z.string().min(1),
	description: z.string().min(1),
	payload: z.record(z.string(), z.unknown()),
	requiresConfirmation: z.literal(true),
});

export type BioanalytixProposedPlanChange = z.infer<typeof bioanalytixProposedPlanChangeSchema>;

export const bioanalytixAgentToolParametersSchema = z.object({
	personId: z.string().min(1).nullable(),
	alternativeRetirementAge: z.number().positive().nullable(),
	startDate: z.string().min(1).nullable(),
	annualIncomeLost: z.number().nonnegative().nullable(),
	annualAdditionalExpenses: z.number().nonnegative().nullable(),
	oneOffExpense: z.number().nonnegative().nullable(),
});

export type BioanalytixAgentToolParameters = z.infer<typeof bioanalytixAgentToolParametersSchema>;

export const bioanalytixAgentContinuationSchema = z.object({
	originalQuestion: z.string().trim().min(1).max(4000),
	intent: bioanalytixAgentIntentSchema,
	tool: bioanalytixToolNameSchema,
	parameters: bioanalytixAgentToolParametersSchema,
});

export type BioanalytixAgentContinuation = z.infer<typeof bioanalytixAgentContinuationSchema>;

export const bioanalytixAgentRequestSchema = z.object({
	question: z.string().trim().min(1).max(4000),
	continuation: bioanalytixAgentContinuationSchema.nullable().optional(),
});

export type BioanalytixAgentRequest = z.infer<typeof bioanalytixAgentRequestSchema>;

export const bioanalytixAgentDecisionSchema = z.object({
	intent: bioanalytixAgentIntentSchema,
	tool: bioanalytixToolNameSchema.nullable(),
	parameters: bioanalytixAgentToolParametersSchema,
	missingAssumptions: z.array(bioanalytixMissingAssumptionSchema),
});

export type BioanalytixAgentDecision = z.infer<typeof bioanalytixAgentDecisionSchema>;

const bioanalytixPercentileValuesSchema = z.object({
	p10: z.number(),
	p25: z.number(),
	p50: z.number(),
	p75: z.number(),
	p90: z.number(),
});

const bioanalytixRetirementSpendingSeriesPointSchema = z.object({
	yearIndex: z.number().int().nonnegative(),
	projectionDate: z.string().min(1),
	primaryAge: z.number().nonnegative(),
	baselineLiquidWealth: bioanalytixPercentileValuesSchema,
	alternativeLiquidWealth: bioanalytixPercentileValuesSchema,
});

const bioanalytixRetirementSpendingAnalysisSchema = z.object({
	type: z.literal("retirement_spending_comparison"),
	retirementAge: z.number().positive(),
	strategyId: z.string().min(1),
	strategyName: z.string().min(1),
	simulationCount: z.number().int().positive(),

	baselineAnnualRetirementSpending: z.number().nonnegative(),
	alternativeAnnualRetirementSpending: z.number().nonnegative(),
	annualAdditionalRetirementSpending: z.number().nonnegative(),

	baselineShortfallProbability: z.number().min(0).max(1),
	alternativeShortfallProbability: z.number().min(0).max(1),

	baselineTotalUnfundedCashFlow: bioanalytixPercentileValuesSchema,
	alternativeTotalUnfundedCashFlow: bioanalytixPercentileValuesSchema,

	baselineEndingNetWorth: bioanalytixPercentileValuesSchema,
	alternativeEndingNetWorth: bioanalytixPercentileValuesSchema,

	series: z.array(bioanalytixRetirementSpendingSeriesPointSchema),
});

export const bioanalytixAgentAnalysisSchema =
	bioanalytixRetirementSpendingAnalysisSchema.nullable();

export type BioanalytixAgentAnalysis = z.infer<typeof bioanalytixAgentAnalysisSchema>;

export const bioanalytixAgentAnswerSchema = z.object({
	answer: z.string().min(1),
	intent: bioanalytixAgentIntentSchema,
	analysis: bioanalytixAgentAnalysisSchema,
	toolUsed: bioanalytixToolNameSchema.nullable(),
	missingAssumptions: z.array(bioanalytixMissingAssumptionSchema),
	continuation: bioanalytixAgentContinuationSchema.nullable(),
	proposedPlanChange: bioanalytixProposedPlanChangeSchema.nullable(),
});

export type BioanalytixAgentAnswer = z.infer<typeof bioanalytixAgentAnswerSchema>;

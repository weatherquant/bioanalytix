import { getOrCreatePrimaryBioHousehold, saveBioPlan } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";
import { SAVED_PLAN_VERSION } from "../../planning/savedPlan";

const savedPlanningQuestionSchema = z.object({
	id: z.string().min(1),

	source: z.enum(["genetic_profile", "household", "estate", "insurance", "longevity", "user"]),

	domain: z.enum([
		"healthy_working_life",
		"health_costs",
		"care_dependency",
		"partner_dependency",
		"premature_mortality",
		"longevity",
		"income_interruption",
		"estate",
		"insurance",
		"family",
	]),

	title: z.string().min(1),

	question: z.string().min(1),

	rationale: z.string(),

	significance: z.enum(["low", "moderate", "high"]),

	selected: z.boolean(),

	sourceInsightIds: z.array(z.string()).optional(),
});

const savedPlanningAreaReviewSchema = z.object({
	area: z.enum([
		"financial_resilience",
		"income_work",
		"protection",
		"estate_family",
		"longevity_later_life",
	]),

	status: z.enum(["to_review", "reviewed"]),

	reviewedAt: z.string().optional(),
});

const savedPlanSchema = z.object({
	version: z.literal(SAVED_PLAN_VERSION),

	planningProfileId: z.string().optional(),

	questions: z.array(savedPlanningQuestionSchema),

	areaReviews: z.array(savedPlanningAreaReviewSchema).optional(),

	assumptions: z.object({
		incomeInterruptionMonths: z.number().nonnegative().optional(),

		essentialSpendingIncreasePercent: z.number().nonnegative().optional(),

		additionalAnnualHealthCosts: z.number().nonnegative().optional(),

		additionalAnnualCareCosts: z.number().nonnegative().optional(),

		retirementYearsExtension: z.number().nonnegative().optional(),

		retirementAgeToTest: z.number().positive().optional(),

		earlierDeathAge: z.number().nonnegative().optional(),

		insuranceShortfall: z.number().nonnegative().optional(),

		healthCostDurationYears: z.number().positive().optional(),

		careCostDurationYears: z.number().positive().optional(),
	}),

	estateObjective: z
		.object({
			targetAmount: z.number().positive(),
		})
		.optional(),

	priorities: z.array(z.string()),

	notes: z.string(),

	lastSavedAt: z.string().optional(),
});

export const saveBioanalytixPlan = protectedProcedure
	.route({
		method: "POST",
		path: "/bioanalytix/plan",
		tags: ["Bioanalytix"],
		summary: "Save Bioanalytix plan",
		description: "Persist the authenticated household's user-controlled Bioanalytix Plan.",
	})
	.input(savedPlanSchema)
	.handler(async ({ context, input }) => {
		const household = await getOrCreatePrimaryBioHousehold({
			userId: context.user.id,

			name: context.user.name ? `${context.user.name}'s household` : "My household",
		});

		const savedAt = new Date().toISOString();

		const plan = {
			...input,
			lastSavedAt: savedAt,
		};

		const record = await saveBioPlan({
			householdId: household.id,

			planVersion: SAVED_PLAN_VERSION,

			plan,
		});

		return {
			plan,

			updatedAt: record.updatedAt.toISOString(),
		};
	});

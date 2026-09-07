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
		"premature_mortality",
		"longevity",
		"income_interruption",
		"estate",
		"partner_dependency",
	]),

	title: z.string().min(1),

	question: z.string().min(1),

	rationale: z.string(),

	significance: z.enum(["low", "moderate", "high"]),

	selected: z.boolean(),

	sourceInsightIds: z.array(z.string()).optional(),
});

const savedPlanSchema = z.object({
	version: z.literal(SAVED_PLAN_VERSION),

	planningProfileId: z.string().optional(),

	questions: z.array(savedPlanningQuestionSchema),

	assumptions: z.object({
		incomeInterruptionMonths: z.number().nonnegative().optional(),

		essentialSpendingIncreasePercent: z.number().nonnegative().optional(),

		additionalAnnualHealthCosts: z.number().nonnegative().optional(),

		additionalAnnualCareCosts: z.number().nonnegative().optional(),

		retirementYearsExtension: z.number().nonnegative().optional(),

		earlierDeathAge: z.number().nonnegative().optional(),

		insuranceShortfall: z.number().nonnegative().optional(),

		healthCostDurationYears: z.number().positive().optional(),

		careCostDurationYears: z.number().positive().optional(),
	}),

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

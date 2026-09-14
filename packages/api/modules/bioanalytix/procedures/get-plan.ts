import {
	getBioPlanForHousehold,
	getCurrentBioPlanningProfile,
	getOrCreatePrimaryBioHousehold,
} from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";
import type { HouseholdFinancialState } from "../../financial/household/types";
import { buildBaselinePlanningQuestions } from "../../planning/baselineQuestions";
import type { BioanalytixPlanningProfileV1 } from "../../planning/planningProfile";
import { buildPlanningSummary } from "../../planning/planningSummary";
import {
	emptySavedPlan,
	type SavedBioanalytixPlanV1,
	type SavedPlanningQuestion,
} from "../../planning/savedPlan";

export const getBioanalytixPlan = protectedProcedure
	.route({
		method: "GET",
		path: "/bioanalytix/plan",
		tags: ["Bioanalytix"],
		summary: "Get Bioanalytix saved plan",
		description:
			"Return the authenticated household's persistent plan together with current planning suggestions.",
	})
	.handler(async ({ context }) => {
		const household = await getOrCreatePrimaryBioHousehold({
			userId: context.user.id,
			name: context.user.name ? `${context.user.name}'s household` : "My household",
		});

		const savedRecord = await getBioPlanForHousehold(household.id);

		const planningProfileRecord = await getCurrentBioPlanningProfile(household.id);

		const savedPlan =
			(savedRecord?.plan as unknown as SavedBioanalytixPlanV1 | null) ?? emptySavedPlan();

		const generatedProfile =
			(planningProfileRecord?.profile as unknown as BioanalytixPlanningProfileV1 | null) ??
			null;

		let baselineQuestions: SavedPlanningQuestion[] = [];

		if (household.financialState) {
			const financialState = household.financialState as unknown as HouseholdFinancialState;

			baselineQuestions = buildBaselinePlanningQuestions(financialState);
		}

		const geneticQuestions = generatedProfile?.questions ?? [];

		const planningSummary = generatedProfile ? buildPlanningSummary(generatedProfile) : null;

		/*
		 * Suggestions remain separate from savedPlan.
		 *
		 * A new DNA upload or regenerated planning profile
		 * must never silently overwrite user-selected Plan
		 * state.
		 */

		return {
			householdId: household.id,

			savedPlan,

			suggestions: {
				baseline: baselineQuestions,
				genetic: geneticQuestions,
			},

			planningProfile: planningProfileRecord
				? {
						id: planningProfileRecord.id,

						version: planningProfileRecord.profileVersion,

						geneticUploadId: planningProfileRecord.geneticUploadId,

						updatedAt: planningProfileRecord.updatedAt.toISOString(),

						geneticHighlights: generatedProfile?.geneticHighlights ?? [],

						planningInsights: generatedProfile?.planningInsights ?? [],

						geneticPlanningCoverage: generatedProfile?.geneticPlanningCoverage ?? null,
					}
				: null,

			planningSummary,

			updatedAt: savedRecord?.updatedAt.toISOString() ?? null,
		};
	});

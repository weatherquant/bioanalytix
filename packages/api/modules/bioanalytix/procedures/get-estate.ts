import { getBioPlanForHousehold, getOrCreatePrimaryBioHousehold } from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";
import { assessEstatePosition } from "../../financial/estate/estateAnalysis";
import type { HouseholdFinancialState } from "../../financial/household/types";
import { emptySavedPlan, type SavedBioanalytixPlanV1 } from "../../planning/savedPlan";

export const getBioanalytixEstate = protectedProcedure
	.route({
		method: "GET",
		path: "/bioanalytix/estate",
		tags: ["Bioanalytix"],
		summary: "Get Bioanalytix estate position",
		description:
			"Return the authenticated household's current estate position and saved inheritance objective.",
	})
	.handler(async ({ context }) => {
		const household = await getOrCreatePrimaryBioHousehold({
			userId: context.user.id,
		});

		const savedRecord = await getBioPlanForHousehold(household.id);

		const savedPlan =
			(savedRecord?.plan as unknown as SavedBioanalytixPlanV1 | null) ?? emptySavedPlan();

		const estateObjective = savedPlan.estateObjective ?? null;

		if (!household.financialState) {
			return {
				householdId: household.id,
				estatePosition: null,
				estateObjective,
				objectiveComparison: null,
			};
		}

		const financialState = household.financialState as unknown as HouseholdFinancialState;

		const estatePosition = assessEstatePosition(financialState);

		const objectiveComparison = estateObjective
			? {
					targetAmount: estateObjective.targetAmount,
					currentSurplusOrShortfall:
						estatePosition.netHouseholdResources - estateObjective.targetAmount,
				}
			: null;

		return {
			householdId: household.id,
			estatePosition,
			estateObjective,
			objectiveComparison,
		};
	});

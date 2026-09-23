import { getBioPlanForHousehold, getOrCreatePrimaryBioHousehold } from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";
import { assessEstatePosition } from "../../financial/estate/estateAnalysis";
import type { HouseholdFinancialState } from "../../financial/household/types";
import { standardPortfolioStrategy } from "../../financial/retirement/standardPortfolioStrategies";
import { runLifecycleSimulation } from "../../financial/simulation/lifecycleSimulation";
import { buildEstateViewModel } from "../../financial/views/estateViewModel";
import { buildLongevityPlanningPolicy } from "../../planning/longevityPlanningPolicy";
import {
	buildBioanalytixRetirementSimulationPolicy,
	getBioanalytixBaselineRetirementAge,
} from "../../planning/retirementSimulationPolicy";
import { emptySavedPlan, type SavedBioanalytixPlanV1 } from "../../planning/savedPlan";

const ESTATE_BASELINE_STRATEGY_ID = "balanced" as const;

export const getBioanalytixEstate = protectedProcedure
	.route({
		method: "GET",
		path: "/bioanalytix/estate",
		tags: ["Bioanalytix"],
		summary: "Get Bioanalytix estate planning view",
		description:
			"Return the authenticated household's current estate position, saved inheritance objective and baseline estate projection.",
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
				planningHorizon: null,
				projection: null,
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

		const longevityPolicy = buildLongevityPlanningPolicy(financialState);

		const retirementAge = getBioanalytixBaselineRetirementAge(financialState);

		const simulationPolicy = buildBioanalytixRetirementSimulationPolicy(financialState, {
			projectionYears: longevityPolicy.projectionYears,
		});

		const illustrativePortfolio = standardPortfolioStrategy(ESTATE_BASELINE_STRATEGY_ID);

		const desiredAnnualRetirementIncome =
			financialState.expenses.essentialAnnual + financialState.expenses.discretionaryAnnual;

		const lifecycleResults = simulationPolicy.marketPaths.map((marketPath) =>
			runLifecycleSimulation({
				household: financialState,
				assumptions: simulationPolicy.projectionAssumptions,
				plan: {
					retirementAge,
					annualRetirementSpending: desiredAnnualRetirementIncome,
				},
				strategy: illustrativePortfolio.strategy,
				marketPath,
			}),
		);

		const projection = buildEstateViewModel(
			financialState,
			lifecycleResults,
			longevityPolicy.range,
		);

		return {
			householdId: household.id,
			estatePosition,
			estateObjective,
			objectiveComparison,
			planningHorizon: {
				version: longevityPolicy.version,
				range: longevityPolicy.range,
				projectionYears: longevityPolicy.projectionYears,
				qualifications: longevityPolicy.qualifications,
			},
			projection,
		};
	});

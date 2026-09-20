import { getBioPlanForHousehold, getOrCreatePrimaryBioHousehold } from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";
import type { HouseholdFinancialState } from "../../financial/household/types";
import { compareInheritanceObjective } from "../../financial/retirement/compareInheritanceObjective";
import { standardPortfolioStrategy } from "../../financial/retirement/standardPortfolioStrategies";
import {
	BIOANALYTIX_MAXIMUM_INHERITANCE_SHORTFALL_PROBABILITY,
	buildBioanalytixRetirementSimulationPolicy,
	getBioanalytixBaselineRetirementAge,
} from "../../planning/retirementSimulationPolicy";
import { emptySavedPlan, type SavedBioanalytixPlanV1 } from "../../planning/savedPlan";

const ESTATE_ILLUSTRATIVE_STRATEGY_ID = "balanced" as const;

export const compareBioanalytixEstateLegacy = protectedProcedure
	.route({
		method: "POST",
		path: "/bioanalytix/estate/legacy-comparison",
		tags: ["Bioanalytix"],
		summary: "Compare an inheritance objective with retirement spending",
		description:
			"Compare modelled sustainable retirement spending with and without the household's saved inheritance objective.",
	})
	.handler(async ({ context }) => {
		const household = await getOrCreatePrimaryBioHousehold({
			userId: context.user.id,
		});

		if (!household.financialState) {
			return {
				status: "missing_financial_state" as const,
				comparison: null,
			};
		}

		const savedRecord = await getBioPlanForHousehold(household.id);

		const savedPlan =
			(savedRecord?.plan as unknown as SavedBioanalytixPlanV1 | null) ?? emptySavedPlan();

		const estateObjective = savedPlan.estateObjective ?? null;

		if (!estateObjective) {
			return {
				status: "missing_estate_objective" as const,
				comparison: null,
			};
		}

		const financialState = household.financialState as unknown as HouseholdFinancialState;

		const retirementAge = getBioanalytixBaselineRetirementAge(financialState);

		const policy = buildBioanalytixRetirementSimulationPolicy(financialState);

		const illustrativePortfolio = standardPortfolioStrategy(ESTATE_ILLUSTRATIVE_STRATEGY_ID);

		const result = compareInheritanceObjective({
			household: financialState,
			assumptions: policy.projectionAssumptions,
			retirementAge,
			strategy: illustrativePortfolio.strategy,
			marketPaths: policy.marketPaths,
			maximumShortfallProbability: policy.maximumShortfallProbability,
			inheritanceTargetAmount: estateObjective.targetAmount,
			maximumInheritanceShortfallProbability:
				BIOANALYTIX_MAXIMUM_INHERITANCE_SHORTFALL_PROBABILITY,
			maximumAnnualSpending: policy.maximumAnnualSpending,
			spendingPrecision: policy.spendingPrecision,
		});

		return {
			status: "complete" as const,

			comparison: {
				retirementAge,

				strategyId: illustrativePortfolio.id,
				strategyName: illustrativePortfolio.name,

				targetAmount: estateObjective.targetAmount,

				baselineAnnualRetirementSpending: result.baselineAnnualRetirementIncome,

				withInheritanceObjectiveAnnualRetirementSpending:
					result.withInheritanceObjectiveAnnualRetirementIncome,

				annualSpendingDifference: result.annualRetirementIncomeDifference,

				objectiveAchievableAtZeroSpending: result.objectiveAchievableAtZeroSpending,

				projectionYears: 40,

				maximumRetirementShortfallProbability: policy.maximumShortfallProbability,

				maximumInheritanceShortfallProbability:
					BIOANALYTIX_MAXIMUM_INHERITANCE_SHORTFALL_PROBABILITY,
			},
		};
	});

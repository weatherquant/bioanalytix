import { getOrCreatePrimaryBioHousehold } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";
import type { HouseholdFinancialState } from "../../financial/household/types";
import { compareRetirementSpendingProfiles } from "../../financial/retirement/compareRetirementSpendingProfiles";
import { standardPortfolioStrategy } from "../../financial/retirement/standardPortfolioStrategies";
import { findSustainableRetirementIncome } from "../../financial/retirement/sustainableRetirementIncome";
import { buildLongevityViewModel } from "../../financial/views/longevityViewModel";
import {
	buildBioanalytixRetirementSimulationPolicy,
	getBioanalytixBaselineRetirementAge,
} from "../../planning/retirementSimulationPolicy";

const LONGEVITY_ILLUSTRATIVE_STRATEGY_ID = "balanced" as const;

const inputSchema = z.object({
	laterLifeCare: z
		.object({
			startAge: z.number().int().min(0).max(120),
			annualCost: z.number().nonnegative(),
			durationYears: z.number().int().positive().optional(),
		})
		.optional(),
});

export const compareBioanalytixLongevitySpending = protectedProcedure
	.route({
		method: "POST",
		path: "/bioanalytix/longevity/spending-comparison",
		tags: ["Bioanalytix"],
		summary: "Compare retirement spending profiles",
		description:
			"Compare flat and age-adjusted retirement spending assumptions, with an optional user-selected later-life care scenario.",
	})
	.input(inputSchema)
	.handler(async ({ context, input }) => {
		const household = await getOrCreatePrimaryBioHousehold({
			userId: context.user.id,
		});

		if (!household.financialState) {
			return {
				status: "missing_financial_state" as const,
				result: null,
			};
		}

		const financialState = household.financialState as unknown as HouseholdFinancialState;

		const retirementAge = getBioanalytixBaselineRetirementAge(financialState);

		const policy = buildBioanalytixRetirementSimulationPolicy(financialState);

		const illustrativePortfolio = standardPortfolioStrategy(LONGEVITY_ILLUSTRATIVE_STRATEGY_ID);

		/*
		 * Establish the same baseline sustainable retirement spending
		 * used by the existing retirement modelling policy.
		 *
		 * The spending-profile comparison then holds this amount,
		 * household, retirement age, strategy and market paths constant.
		 * Only the shape of retirement spending changes.
		 */
		const sustainableIncome = findSustainableRetirementIncome({
			household: financialState,
			assumptions: policy.projectionAssumptions,
			retirementAge,
			strategy: illustrativePortfolio.strategy,
			marketPaths: policy.marketPaths,
			maximumShortfallProbability: policy.maximumShortfallProbability,
			maximumAnnualSpending: policy.maximumAnnualSpending,
			spendingPrecision: policy.spendingPrecision,
		});

		const comparison = compareRetirementSpendingProfiles({
			household: financialState,
			assumptions: policy.projectionAssumptions,
			retirementAge,
			annualRetirementSpending: sustainableIncome.sustainableAnnualRetirementIncome,
			strategy: illustrativePortfolio.strategy,
			marketPaths: policy.marketPaths,
			...(input.laterLifeCare
				? {
						laterLifeCare: input.laterLifeCare,
					}
				: {}),
		});

		const viewModel = buildLongevityViewModel(comparison);

		return {
			status: "complete" as const,
			result: viewModel,
		};
	});

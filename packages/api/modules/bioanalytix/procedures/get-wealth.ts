import { getOrCreatePrimaryBioHousehold } from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";
import type { HouseholdFinancialState } from "../../financial/household/types";
import { standardPortfolioStrategy } from "../../financial/retirement/standardPortfolioStrategies";
import { runLifecycleSimulation } from "../../financial/simulation/lifecycleSimulation";
import { buildWealthViewModel } from "../../financial/views/wealthViewModel";
import { buildLongevityPlanningPolicy } from "../../planning/longevityPlanningPolicy";
import {
	buildBioanalytixRetirementSimulationPolicy,
	getBioanalytixBaselineRetirementAge,
} from "../../planning/retirementSimulationPolicy";

export const getBioanalytixWealth = protectedProcedure
	.route({
		method: "GET",
		path: "/bioanalytix/wealth",
		tags: ["Bioanalytix"],
		summary: "Get Bioanalytix wealth planning view",
		description:
			"Return the authenticated household's baseline wealth projection across the governed longevity planning horizon.",
	})
	.handler(async ({ context }) => {
		const household = await getOrCreatePrimaryBioHousehold({
			userId: context.user.id,
		});

		if (!household.financialState) {
			return {
				householdId: household.id,
				planning: null,
				planningHorizon: null,
			};
		}

		const financialState = household.financialState as unknown as HouseholdFinancialState;

		const longevityPolicy = buildLongevityPlanningPolicy(financialState);

		const retirementAge = getBioanalytixBaselineRetirementAge(financialState);

		const simulationPolicy = buildBioanalytixRetirementSimulationPolicy(financialState, {
			projectionYears: longevityPolicy.projectionYears,
		});

		const desiredAnnualRetirementIncome =
			financialState.expenses.essentialAnnual + financialState.expenses.discretionaryAnnual;

		const balancedStrategy = standardPortfolioStrategy("balanced").strategy;

		const baselineResults = simulationPolicy.marketPaths.map((marketPath) =>
			runLifecycleSimulation({
				household: financialState,
				assumptions: simulationPolicy.projectionAssumptions,
				plan: {
					retirementAge,
					annualRetirementSpending: desiredAnnualRetirementIncome,
				},
				strategy: balancedStrategy,
				marketPath,
			}),
		);

		const baseline = buildWealthViewModel(baselineResults, longevityPolicy.range);

		return {
			householdId: household.id,
			planningHorizon: {
				version: longevityPolicy.version,
				range: longevityPolicy.range,
				projectionYears: longevityPolicy.projectionYears,
				qualifications: longevityPolicy.qualifications,
			},
			planning: {
				baselineStrategyId: "balanced" as const,
				retirementAge,
				desiredAnnualRetirementIncome,
				baseline,
				qualifications: [
					...baseline.qualifications,
					"The baseline Wealth projection uses the illustrative Balanced portfolio strategy.",
					"The desired retirement income initially reflects current recurring household spending and can be explored as a planning assumption.",
				],
			},
		};
	});

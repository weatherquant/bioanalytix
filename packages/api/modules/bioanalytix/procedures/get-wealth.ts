import { getOrCreatePrimaryBioHousehold } from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";
import type { HouseholdFinancialState } from "../../financial/household/types";
import { compareRetirementStrategies } from "../../financial/retirement/compareRetirementStrategies";
import { STANDARD_PORTFOLIO_STRATEGIES } from "../../financial/retirement/standardPortfolioStrategies";
import { compareStrategies } from "../../financial/simulation/compareStrategies";
import {
	buildWealthPlanningViewModel,
	WEALTH_BASELINE_STRATEGY_ID,
} from "../../financial/views/wealthPlanningViewModel";
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
			"Return the authenticated household's baseline wealth projection and retirement strategy planning comparison.",
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

		const retirementStrategyComparison = compareRetirementStrategies({
			household: financialState,
			assumptions: simulationPolicy.projectionAssumptions,
			retirementAge,
			marketPaths: simulationPolicy.marketPaths,
			maximumShortfallProbability: simulationPolicy.maximumShortfallProbability,
			maximumAnnualSpending: simulationPolicy.maximumAnnualSpending,
			spendingPrecision: simulationPolicy.spendingPrecision,
		});

		const targetIncomeComparison = compareStrategies({
			household: financialState,
			assumptions: simulationPolicy.projectionAssumptions,
			plan: {
				retirementAge,
				annualRetirementSpending: desiredAnnualRetirementIncome,
			},
			strategies: STANDARD_PORTFOLIO_STRATEGIES.map((portfolio) => portfolio.strategy),
			marketPaths: simulationPolicy.marketPaths,
		});

		const baselineResults =
			targetIncomeComparison.lifecycleResults[WEALTH_BASELINE_STRATEGY_ID];

		if (!baselineResults) {
			throw new Error(
				`Wealth analysis did not produce lifecycle results for baseline strategy ${WEALTH_BASELINE_STRATEGY_ID}.`,
			);
		}

		const baseline = buildWealthViewModel(baselineResults, longevityPolicy.range);

		const planning = buildWealthPlanningViewModel({
			baseline,
			desiredAnnualRetirementIncome,
			retirementStrategyComparison,
			targetIncomeComparison,
		});

		return {
			householdId: household.id,
			planningHorizon: {
				version: longevityPolicy.version,
				range: longevityPolicy.range,
				projectionYears: longevityPolicy.projectionYears,
				qualifications: longevityPolicy.qualifications,
			},
			planning,
		};
	});

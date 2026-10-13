import { getBioPlanForHousehold, getOrCreatePrimaryBioHousehold } from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";
import type { HouseholdFinancialState } from "../../financial/household/types";
import { standardPortfolioStrategy } from "../../financial/retirement/standardPortfolioStrategies";
import { findSustainableRetirementIncome } from "../../financial/retirement/sustainableRetirementIncome";
import {
	buildBioanalytixRetirementSimulationPolicy,
	getBioanalytixBaselineRetirementAge,
} from "../../planning/retirementSimulationPolicy";
import type { SavedBioanalytixPlanV1 } from "../../planning/savedPlan";

export const runBioanalytixPortfolioScenario = protectedProcedure
	.route({
		method: "POST",
		path: "/bioanalytix/plan/portfolio-scenario",
		tags: ["Bioanalytix"],
		summary: "Compare the saved portfolio strategy with the Balanced baseline",
		description:
			"Compare sustainable retirement income under the saved portfolio strategy and the Balanced planning baseline.",
	})
	.handler(async ({ context }) => {
		const household = await getOrCreatePrimaryBioHousehold({
			userId: context.user.id,
			name: context.user.name ? `${context.user.name}'s household` : "My household",
		});

		if (!household.financialState) {
			throw new Error("Household financial state is not available.");
		}

		const householdState = household.financialState as unknown as HouseholdFinancialState;

		const savedPlanRecord = await getBioPlanForHousehold(household.id);

		if (!savedPlanRecord) {
			throw new Error("Save your Bioanalytix Plan before comparing investment strategies.");
		}

		const plan = savedPlanRecord.plan as unknown as SavedBioanalytixPlanV1;

		const balancedStrategy = standardPortfolioStrategy("balanced");

		const selectedStrategy = standardPortfolioStrategy(plan.portfolioStrategyId ?? "balanced");

		const retirementAge = getBioanalytixBaselineRetirementAge(householdState);

		const simulationPolicy = buildBioanalytixRetirementSimulationPolicy(householdState);

		const sharedInput = {
			household: householdState,
			assumptions: simulationPolicy.projectionAssumptions,
			marketPaths: simulationPolicy.marketPaths,
			maximumShortfallProbability: simulationPolicy.maximumShortfallProbability,
			maximumAnnualSpending: simulationPolicy.maximumAnnualSpending,
			spendingPrecision: simulationPolicy.spendingPrecision,
			retirementAge,
		};

		const balancedResult = findSustainableRetirementIncome({
			...sharedInput,
			strategy: balancedStrategy.strategy,
		});

		const selectedResult = findSustainableRetirementIncome({
			...sharedInput,
			strategy: selectedStrategy.strategy,
		});

		const balancedAnnualIncome = balancedResult.sustainableAnnualRetirementIncome;

		const selectedAnnualIncome = selectedResult.sustainableAnnualRetirementIncome;

		const annualIncomeDifference = selectedAnnualIncome - balancedAnnualIncome;

		return {
			status: "completed" as const,
			retirementAge,

			baseline: {
				id: balancedStrategy.id,
				name: balancedStrategy.name,
				annualIncome: balancedAnnualIncome,
			},

			selected: {
				id: selectedStrategy.id,
				name: selectedStrategy.name,
				annualIncome: selectedAnnualIncome,
			},

			difference: {
				annualAmount: annualIncomeDifference,
				direction:
					annualIncomeDifference > 0
						? ("higher" as const)
						: annualIncomeDifference < 0
							? ("lower" as const)
							: ("same" as const),
			},
		};
	});

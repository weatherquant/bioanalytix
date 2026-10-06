import type { HouseholdFinancialState } from "../household/types";
import type { ProjectionAssumptions } from "../projection/types";
import { runLifecycleSimulation } from "../simulation/lifecycleSimulation";
import {
	summarizeLifecycleSimulations,
	type LifecycleDistributionSummary,
} from "../simulation/summarizeLifecycle";
import type { MarketPath, PortfolioStrategy } from "../simulation/types";
import type { LifecycleRetirementSafetyNet } from "./lifecycleSafetyNet";
import type { LaterLifeCareScenario } from "./retirementSpendingProfile";

export interface RetirementSpendingProfileComparisonInput {
	household: HouseholdFinancialState;

	assumptions: ProjectionAssumptions;

	retirementAge: number;

	annualRetirementSpending: number;

	strategy: PortfolioStrategy;

	marketPaths: MarketPath[];

	laterLifeCare?: LaterLifeCareScenario;

	retirementSafetyNet?: LifecycleRetirementSafetyNet;
}

export interface RetirementSpendingProfileScenarioResult {
	id: "flat" | "age_adjusted" | "age_adjusted_with_care";

	label: string;

	summary: LifecycleDistributionSummary;
}

export interface RetirementSpendingProfileComparisonResult {
	retirementAge: number;

	annualRetirementSpending: number;

	strategyId: string;

	strategyName: string;

	simulationCount: number;

	flat: RetirementSpendingProfileScenarioResult;

	ageAdjusted: RetirementSpendingProfileScenarioResult;

	ageAdjustedWithCare?: RetirementSpendingProfileScenarioResult;

	laterLifeCare?: LaterLifeCareScenario;
}

/**
 * Compare alternative retirement spending profiles while holding
 * the household, retirement age, base spending, strategy,
 * projection assumptions and market paths constant.
 *
 * These scenarios are planning illustrations. They do not predict
 * how a particular household will spend or whether later-life care
 * will be required.
 *
 * Genetic information must never populate or alter these financial
 * assumptions automatically.
 */
export function compareRetirementSpendingProfiles(
	input: RetirementSpendingProfileComparisonInput,
): RetirementSpendingProfileComparisonResult {
	if (!Number.isFinite(input.annualRetirementSpending) || input.annualRetirementSpending < 0) {
		throw new Error("Annual retirement spending must be a non-negative finite number.");
	}

	if (input.marketPaths.length === 0) {
		throw new Error("At least one market path is required.");
	}

	const runScenario = (
		profile:
			| undefined
			| {
					type: "age_adjusted";
					laterLifeCare?: LaterLifeCareScenario;
			  },
	): LifecycleDistributionSummary => {
		const results = input.marketPaths.map((marketPath) =>
			runLifecycleSimulation({
				household: input.household,

				assumptions: input.assumptions,

				plan: {
					retirementAge: input.retirementAge,

					annualRetirementSpending: input.annualRetirementSpending,

					...(profile
						? {
								retirementSpendingProfile: profile,
							}
						: {}),
				},

				strategy: input.strategy,

				marketPath,

				retirementSafetyNet: input.retirementSafetyNet,
			}),
		);

		return summarizeLifecycleSimulations(results);
	};

	const flatSummary = runScenario(undefined);

	const ageAdjustedSummary = runScenario({
		type: "age_adjusted",
	});

	const flat: RetirementSpendingProfileScenarioResult = {
		id: "flat",

		label: "Flat real spending",

		summary: flatSummary,
	};

	const ageAdjusted: RetirementSpendingProfileScenarioResult = {
		id: "age_adjusted",

		label: "Age-adjusted spending",

		summary: ageAdjustedSummary,
	};

	const ageAdjustedWithCare = input.laterLifeCare
		? {
				id: "age_adjusted_with_care" as const,

				label: "Age-adjusted spending with later-life care",

				summary: runScenario({
					type: "age_adjusted",

					laterLifeCare: input.laterLifeCare,
				}),
			}
		: undefined;

	return {
		retirementAge: input.retirementAge,

		annualRetirementSpending: input.annualRetirementSpending,

		strategyId: input.strategy.id,

		strategyName: input.strategy.name,

		simulationCount: input.marketPaths.length,

		...(input.laterLifeCare
			? {
					laterLifeCare: input.laterLifeCare,
				}
			: {}),

		flat,

		ageAdjusted,

		ageAdjustedWithCare,
	};
}

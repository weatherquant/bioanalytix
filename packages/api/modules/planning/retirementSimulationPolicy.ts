import type { HouseholdFinancialState } from "../financial/household/types";
import type { ProjectionAssumptions } from "../financial/projection/types";
import { generateMarketPaths } from "../financial/simulation/marketModel";
import type {
	MarketModelAssumptions,
	MarketPath,
	SimulationConfig,
} from "../financial/simulation/types";
import { buildBioanalytixProjectionAssumptions } from "./projectionPolicy";

export const BIOANALYTIX_RETIREMENT_SIMULATION_POLICY_VERSION = "1.1.0";

/**
 * MVP retirement simulation policy.
 *
 * These assumptions are explicit financial modelling assumptions.
 * They are not inferred from genetics.
 *
 * They should be methodology-reviewed and made configurable
 * before production financial-planning use.
 */
export const BIOANALYTIX_MARKET_MODEL_ASSUMPTIONS: MarketModelAssumptions = {
	growth: {
		expectedReturn: 0.07,
		volatility: 0.16,
	},

	defensive: {
		expectedReturn: 0.04,
		volatility: 0.06,
	},

	cash: {
		expectedReturn: 0.03,
		volatility: 0.01,
	},

	growthDefensiveCorrelation: 0.2,

	expectedInflation: 0.025,

	inflationVolatility: 0.01,
};

export const BIOANALYTIX_RETIREMENT_SIMULATION_CONFIG = {
	numberOfSimulations: 500,

	/**
	 * Keep the market horizon aligned with the current
	 * Bioanalytix 40-year MVP projection horizon.
	 */
	numberOfYears: 40,

	/**
	 * Fixed seed makes comparisons reproducible.
	 */
	seed: 20260915,
} satisfies SimulationConfig;

/**
 * Product-policy resilience threshold:
 *
 * Sustainable spending is the highest tested annual spending
 * for which no more than 10% of simulated paths experience
 * an unfunded cash-flow event.
 *
 * This is a modelling criterion, not a guarantee of success.
 */
export const BIOANALYTIX_MAXIMUM_SHORTFALL_PROBABILITY = 0.1;

/**
 * Search ceiling rather than a recommendation.
 *
 * It merely bounds the sustainable-income solver.
 */
export const BIOANALYTIX_MAXIMUM_ANNUAL_RETIREMENT_SPENDING = 500_000;

export const BIOANALYTIX_RETIREMENT_SPENDING_PRECISION = 1_000;

/**
 * MVP inheritance-objective reliability threshold.
 *
 * No more than 10% of simulated paths may finish below the
 * modelled inheritance objective.
 *
 * This is deliberately a separate criterion from retirement
 * cash-flow resilience even though both currently use the
 * same 10% threshold.
 */
export const BIOANALYTIX_MAXIMUM_INHERITANCE_SHORTFALL_PROBABILITY = 0.1;

export interface BioanalytixRetirementSimulationPolicyOptions {
	projectionYears?: number;
}

export interface BioanalytixRetirementSimulationPolicy {
	projectionAssumptions: ProjectionAssumptions;

	marketPaths: MarketPath[];

	maximumShortfallProbability: number;

	maximumAnnualSpending: number;

	spendingPrecision: number;
}

export function buildBioanalytixRetirementSimulationPolicy(
	household: HouseholdFinancialState,
	options: BioanalytixRetirementSimulationPolicyOptions = {},
): BioanalytixRetirementSimulationPolicy {
	const projectionYears =
		options.projectionYears ?? BIOANALYTIX_RETIREMENT_SIMULATION_CONFIG.numberOfYears;

	if (!Number.isInteger(projectionYears) || projectionYears <= 0) {
		throw new Error("Projection years must be a positive integer.");
	}

	return {
		projectionAssumptions: buildBioanalytixProjectionAssumptions(
			household,
			{},
			projectionYears,
		),

		marketPaths: generateMarketPaths(
			{
				...BIOANALYTIX_RETIREMENT_SIMULATION_CONFIG,
				numberOfYears: projectionYears,
			},
			BIOANALYTIX_MARKET_MODEL_ASSUMPTIONS,
		),

		maximumShortfallProbability: BIOANALYTIX_MAXIMUM_SHORTFALL_PROBABILITY,

		maximumAnnualSpending: BIOANALYTIX_MAXIMUM_ANNUAL_RETIREMENT_SPENDING,

		spendingPrecision: BIOANALYTIX_RETIREMENT_SPENDING_PRECISION,
	};
}

export function getBioanalytixBaselineRetirementAge(household: HouseholdFinancialState): number {
	const primaryPerson =
		household.people.find((person) => person.role === "primary") ?? household.people[0];

	if (!primaryPerson) {
		throw new Error("A household person is required for retirement analysis.");
	}

	const retirementGoal = household.goals.find(
		(goal) =>
			goal.type === "retirement" &&
			(goal.personId === undefined || goal.personId === primaryPerson.id),
	);

	if (
		retirementGoal?.targetAge === undefined ||
		!Number.isFinite(retirementGoal.targetAge) ||
		retirementGoal.targetAge <= 0
	) {
		throw new Error(
			"A baseline retirement age is required before running retirement analysis.",
		);
	}

	return retirementGoal.targetAge;
}

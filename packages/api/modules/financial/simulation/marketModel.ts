import { createSeededRandom } from "./random";
import {
	SimulationConfigurationError,
	type MarketModelAssumptions,
	type MarketPath,
	type MarketYear,
	type SimulationConfig,
} from "./types";

function validateConfig(config: SimulationConfig): void {
	const reasons: string[] = [];

	if (!Number.isInteger(config.numberOfSimulations) || config.numberOfSimulations <= 0) {
		reasons.push("Number of simulations must be a positive integer.");
	}

	if (!Number.isInteger(config.numberOfYears) || config.numberOfYears <= 0) {
		reasons.push("Number of simulation years must be a positive integer.");
	}

	if (!Number.isInteger(config.seed)) {
		reasons.push("Simulation seed must be an integer.");
	}

	if (reasons.length > 0) {
		throw new SimulationConfigurationError("Simulation configuration is invalid.", reasons);
	}
}

function validateReturnAssumption(
	expectedReturn: number,
	volatility: number,
	name: string,
	reasons: string[],
): void {
	if (!Number.isFinite(expectedReturn)) {
		reasons.push(`${name} expected return must be finite.`);
	}

	if (!Number.isFinite(volatility) || volatility < 0) {
		reasons.push(`${name} volatility must be a non-negative finite number.`);
	}
}

function validateAssumptions(assumptions: MarketModelAssumptions): void {
	const reasons: string[] = [];

	validateReturnAssumption(
		assumptions.growth.expectedReturn,
		assumptions.growth.volatility,
		"Growth asset",
		reasons,
	);

	validateReturnAssumption(
		assumptions.defensive.expectedReturn,
		assumptions.defensive.volatility,
		"Defensive asset",
		reasons,
	);

	validateReturnAssumption(
		assumptions.cash.expectedReturn,
		assumptions.cash.volatility,
		"Cash",
		reasons,
	);

	if (
		!Number.isFinite(assumptions.growthDefensiveCorrelation) ||
		assumptions.growthDefensiveCorrelation < -1 ||
		assumptions.growthDefensiveCorrelation > 1
	) {
		reasons.push("Growth-defensive correlation must be between -1 and 1.");
	}

	if (!Number.isFinite(assumptions.expectedInflation)) {
		reasons.push("Expected inflation must be finite.");
	}

	if (!Number.isFinite(assumptions.inflationVolatility) || assumptions.inflationVolatility < 0) {
		reasons.push("Inflation volatility must be a non-negative finite number.");
	}

	if (reasons.length > 0) {
		throw new SimulationConfigurationError("Market model assumptions are invalid.", reasons);
	}
}

function generateYear(
	yearIndex: number,
	assumptions: MarketModelAssumptions,
	random: ReturnType<typeof createSeededRandom>,
): MarketYear {
	const growthShock = random.normal();

	const independentDefensiveShock = random.normal();

	const correlation = assumptions.growthDefensiveCorrelation;

	/**
	 * Construct a defensive shock with the requested
	 * linear correlation to the growth shock.
	 */
	const defensiveShock =
		correlation * growthShock +
		Math.sqrt(Math.max(0, 1 - correlation * correlation)) * independentDefensiveShock;

	const cashShock = random.normal();

	const inflationShock = random.normal();

	return {
		yearIndex,

		growthReturn:
			assumptions.growth.expectedReturn + assumptions.growth.volatility * growthShock,

		defensiveReturn:
			assumptions.defensive.expectedReturn +
			assumptions.defensive.volatility * defensiveShock,

		cashReturn: assumptions.cash.expectedReturn + assumptions.cash.volatility * cashShock,

		inflationRate:
			assumptions.expectedInflation + assumptions.inflationVolatility * inflationShock,
	};
}

/**
 * Generate reproducible annual market paths.
 *
 * The market model contains no household, genetics,
 * insurance or health assumptions.
 */
export function generateMarketPaths(
	config: SimulationConfig,
	assumptions: MarketModelAssumptions,
): MarketPath[] {
	validateConfig(config);

	validateAssumptions(assumptions);

	const random = createSeededRandom(config.seed);

	const paths: MarketPath[] = [];

	for (
		let simulationIndex = 0;
		simulationIndex < config.numberOfSimulations;
		simulationIndex += 1
	) {
		const years: MarketYear[] = [];

		for (let yearIndex = 0; yearIndex < config.numberOfYears; yearIndex += 1) {
			years.push(generateYear(yearIndex, assumptions, random));
		}

		paths.push({
			simulationIndex,

			years,
		});
	}

	return paths;
}

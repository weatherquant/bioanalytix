export const MARKET_ASSET_CLASSES = ["growth", "defensive", "cash"] as const;

export type MarketAssetClass = (typeof MARKET_ASSET_CLASSES)[number];

export interface AssetClassAllocation {
	growth: number;

	defensive: number;

	cash: number;
}

export interface PortfolioStrategy {
	id: string;

	name: string;

	/**
	 * Allocation used before the retirement transition.
	 */
	workingAllocation: AssetClassAllocation;

	/**
	 * Allocation used during the retirement transition.
	 */
	transitionAllocation: AssetClassAllocation;

	/**
	 * Allocation used once retirement is established.
	 */
	retirementAllocation: AssetClassAllocation;

	/**
	 * Number of years before retirement that the
	 * transition allocation begins.
	 */
	transitionYearsBeforeRetirement: number;
}

export interface AssetClassReturnAssumption {
	/**
	 * Expected annual nominal return.
	 *
	 * Example:
	 * 0.07 = 7%.
	 */
	expectedReturn: number;

	/**
	 * Annual standard deviation of nominal return.
	 *
	 * Example:
	 * 0.15 = 15%.
	 */
	volatility: number;
}

export interface MarketModelAssumptions {
	growth: AssetClassReturnAssumption;

	defensive: AssetClassReturnAssumption;

	cash: AssetClassReturnAssumption;

	/**
	 * Correlation between growth and defensive assets.
	 */
	growthDefensiveCorrelation: number;

	/**
	 * Expected annual inflation.
	 */
	expectedInflation: number;

	/**
	 * Standard deviation of annual inflation.
	 */
	inflationVolatility: number;
}

export interface SimulationConfig {
	numberOfSimulations: number;

	numberOfYears: number;

	/**
	 * Seed makes Monte Carlo runs reproducible.
	 */
	seed: number;
}

export interface MarketYear {
	yearIndex: number;

	growthReturn: number;

	defensiveReturn: number;

	cashReturn: number;

	inflationRate: number;
}

export interface MarketPath {
	simulationIndex: number;

	years: MarketYear[];
}

export interface PercentileSummary {
	p10: number;

	p25: number;

	p50: number;

	p75: number;

	p90: number;
}

export interface SimulationDistribution {
	count: number;

	percentiles: PercentileSummary;

	minimum: number;

	maximum: number;

	mean: number;
}

export class SimulationConfigurationError extends Error {
	readonly reasons: string[];

	constructor(message: string, reasons: string[]) {
		super(message);

		this.name = "SimulationConfigurationError";

		this.reasons = reasons;
	}
}

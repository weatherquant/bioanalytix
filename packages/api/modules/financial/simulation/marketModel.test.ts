import { describe, expect, it } from "vitest";

import { generateMarketPaths } from "./marketModel";
import { SimulationConfigurationError, type MarketModelAssumptions } from "./types";

function assumptions(): MarketModelAssumptions {
	return {
		growth: {
			expectedReturn: 0.07,

			volatility: 0.15,
		},

		defensive: {
			expectedReturn: 0.04,

			volatility: 0.07,
		},

		cash: {
			expectedReturn: 0.03,

			volatility: 0.01,
		},

		growthDefensiveCorrelation: 0.2,

		expectedInflation: 0.025,

		inflationVolatility: 0.01,
	};
}

describe("generateMarketPaths", () => {
	it("generates the requested number of simulations and years", () => {
		const paths = generateMarketPaths(
			{
				numberOfSimulations: 500,

				numberOfYears: 40,

				seed: 12345,
			},

			assumptions(),
		);

		expect(paths).toHaveLength(500);

		expect(paths[0]?.years).toHaveLength(40);

		expect(paths[499]?.years).toHaveLength(40);
	});

	it("produces identical paths from the same seed", () => {
		const config = {
			numberOfSimulations: 5,

			numberOfYears: 10,

			seed: 20260902,
		};

		const first = generateMarketPaths(config, assumptions());

		const second = generateMarketPaths(config, assumptions());

		expect(second).toEqual(first);
	});

	it("produces different paths from different seeds", () => {
		const first = generateMarketPaths(
			{
				numberOfSimulations: 2,

				numberOfYears: 5,

				seed: 1,
			},

			assumptions(),
		);

		const second = generateMarketPaths(
			{
				numberOfSimulations: 2,

				numberOfYears: 5,

				seed: 2,
			},

			assumptions(),
		);

		expect(second).not.toEqual(first);
	});

	it("returns deterministic expected values when volatility is zero", () => {
		const fixed = assumptions();

		fixed.growth.volatility = 0;

		fixed.defensive.volatility = 0;

		fixed.cash.volatility = 0;

		fixed.inflationVolatility = 0;

		const paths = generateMarketPaths(
			{
				numberOfSimulations: 1,

				numberOfYears: 2,

				seed: 100,
			},

			fixed,
		);

		expect(paths[0]?.years[0]).toEqual({
			yearIndex: 0,

			growthReturn: 0.07,

			defensiveReturn: 0.04,

			cashReturn: 0.03,

			inflationRate: 0.025,
		});
	});

	it("does not contain household or biological information", () => {
		const paths = generateMarketPaths(
			{
				numberOfSimulations: 1,

				numberOfYears: 1,

				seed: 10,
			},

			assumptions(),
		);

		const serialized = JSON.stringify(paths);

		expect(serialized).not.toContain("genotype");

		expect(serialized).not.toContain("rsid");

		expect(serialized).not.toContain("household");

		expect(serialized).not.toContain("insurance");
	});

	it("fails closed for invalid simulation configuration", () => {
		expect(() =>
			generateMarketPaths(
				{
					numberOfSimulations: 0,

					numberOfYears: 30,

					seed: 1,
				},

				assumptions(),
			),
		).toThrow(SimulationConfigurationError);
	});

	it("fails closed for invalid market assumptions", () => {
		const invalid = assumptions();

		invalid.growthDefensiveCorrelation = 1.5;

		expect(() =>
			generateMarketPaths(
				{
					numberOfSimulations: 10,

					numberOfYears: 30,

					seed: 1,
				},

				invalid,
			),
		).toThrow(SimulationConfigurationError);
	});
});

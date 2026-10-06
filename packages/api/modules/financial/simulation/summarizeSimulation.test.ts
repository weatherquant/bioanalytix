import { describe, expect, it } from "vitest";

import { summarizeDistribution } from "./summarizeSimulation";
import { SimulationConfigurationError } from "./types";

describe("summarizeDistribution", () => {
	it("summarises the full simulation distribution", () => {
		const result = summarizeDistribution([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);

		expect(result.count).toBe(11);

		expect(result.minimum).toBe(0);

		expect(result.maximum).toBe(100);

		expect(result.mean).toBe(50);

		expect(result.percentiles.p10).toBe(10);

		expect(result.percentiles.p25).toBe(25);

		expect(result.percentiles.p50).toBe(50);

		expect(result.percentiles.p75).toBe(75);

		expect(result.percentiles.p90).toBe(90);
	});

	it("does not discard values outside the central fifty percent", () => {
		const result = summarizeDistribution([-1000, 0, 10, 20, 30, 40, 50, 1000]);

		expect(result.count).toBe(8);

		expect(result.minimum).toBe(-1000);

		expect(result.maximum).toBe(1000);
	});

	it("supports a single simulated outcome", () => {
		const result = summarizeDistribution([123]);

		expect(result.percentiles).toEqual({
			p10: 123,

			p25: 123,

			p50: 123,

			p75: 123,

			p90: 123,
		});
	});

	it("fails closed for an empty distribution", () => {
		expect(() => summarizeDistribution([])).toThrow(SimulationConfigurationError);
	});

	it("fails closed for non-finite values", () => {
		expect(() => summarizeDistribution([1, 2, Number.NaN])).toThrow(
			SimulationConfigurationError,
		);
	});
});

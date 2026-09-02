import { SimulationConfigurationError, type SimulationDistribution } from "./types";

function percentile(sortedValues: number[], probability: number): number {
	if (sortedValues.length === 1) {
		return sortedValues[0]!;
	}

	const position = probability * (sortedValues.length - 1);

	const lowerIndex = Math.floor(position);

	const upperIndex = Math.ceil(position);

	const lower = sortedValues[lowerIndex]!;

	const upper = sortedValues[upperIndex]!;

	if (lowerIndex === upperIndex) {
		return lower;
	}

	const weight = position - lowerIndex;

	return lower + (upper - lower) * weight;
}

/**
 * Summarise a complete simulation distribution.
 *
 * No observations are discarded when calculating
 * the percentile presentation.
 */
export function summarizeDistribution(values: number[]): SimulationDistribution {
	if (values.length === 0) {
		throw new SimulationConfigurationError("Simulation distribution cannot be summarised.", [
			"At least one simulation value is required.",
		]);
	}

	if (values.some((value) => !Number.isFinite(value))) {
		throw new SimulationConfigurationError("Simulation distribution cannot be summarised.", [
			"All simulation values must be finite.",
		]);
	}

	const sortedValues = [...values].sort((first, second) => first - second);

	const total = sortedValues.reduce((sum, value) => sum + value, 0);

	return {
		count: sortedValues.length,

		percentiles: {
			p10: percentile(sortedValues, 0.1),

			p25: percentile(sortedValues, 0.25),

			p50: percentile(sortedValues, 0.5),

			p75: percentile(sortedValues, 0.75),

			p90: percentile(sortedValues, 0.9),
		},

		minimum: sortedValues[0]!,

		maximum: sortedValues[sortedValues.length - 1]!,

		mean: total / sortedValues.length,
	};
}

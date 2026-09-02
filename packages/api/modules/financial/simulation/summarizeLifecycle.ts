import { LifecycleSimulationError, type LifecycleSimulationResult } from "./lifecycleTypes";
import { summarizeDistribution } from "./summarizeSimulation";
import type { SimulationDistribution } from "./types";

export interface LifecycleYearDistribution {
	yearIndex: number;

	projectionDate: string;

	primaryAge: number;

	netWorth: SimulationDistribution;

	liquidWealth: SimulationDistribution;

	superannuation: SimulationDistribution;

	unfundedCashFlow: SimulationDistribution;
}

export interface LifecycleDistributionSummary {
	simulationCount: number;

	strategyId: string;

	years: LifecycleYearDistribution[];

	endingNetWorth: SimulationDistribution;

	totalUnfundedCashFlow: SimulationDistribution;

	probabilityOfAnyUnfundedCashFlow: number;
}

export function summarizeLifecycleSimulations(
	results: LifecycleSimulationResult[],
): LifecycleDistributionSummary {
	if (results.length === 0) {
		throw new LifecycleSimulationError("Lifecycle simulations cannot be summarised.", [
			"At least one lifecycle simulation result is required.",
		]);
	}

	const strategyId = results[0]!.strategyId;

	const yearCount = results[0]!.years.length;

	const reasons: string[] = [];

	for (const result of results) {
		if (result.strategyId !== strategyId) {
			reasons.push("All lifecycle results must use the same portfolio strategy.");
		}

		if (result.years.length !== yearCount) {
			reasons.push("All lifecycle results must contain the same number of projection years.");
		}

		for (let index = 0; index < Math.min(yearCount, result.years.length); index += 1) {
			if (result.years[index]?.projectionDate !== results[0]!.years[index]?.projectionDate) {
				reasons.push("All lifecycle results must use aligned projection dates.");

				break;
			}
		}
	}

	if (reasons.length > 0) {
		throw new LifecycleSimulationError("Lifecycle simulation results are not comparable.", [
			...new Set(reasons),
		]);
	}

	const years: LifecycleYearDistribution[] = [];

	for (let yearIndex = 0; yearIndex < yearCount; yearIndex += 1) {
		const reference = results[0]!.years[yearIndex]!;

		years.push({
			yearIndex: reference.yearIndex,

			projectionDate: reference.projectionDate,

			primaryAge: reference.primaryAge,

			netWorth: summarizeDistribution(
				results.map((result) => result.years[yearIndex]!.netWorth),
			),

			liquidWealth: summarizeDistribution(
				results.map((result) => {
					const year = result.years[yearIndex]!;

					return year.cashAssets + year.nonSuperInvestableWealth;
				}),
			),

			superannuation: summarizeDistribution(
				results.map((result) => result.years[yearIndex]!.superannuation),
			),

			unfundedCashFlow: summarizeDistribution(
				results.map((result) => result.years[yearIndex]!.unfundedCashFlow),
			),
		});
	}

	const simulationsWithUnfundedCashFlow = results.filter(
		(result) => result.summary.totalUnfundedCashFlow > 0,
	).length;

	return {
		simulationCount: results.length,

		strategyId,

		years,

		endingNetWorth: summarizeDistribution(
			results.map((result) => result.summary.endingNetWorth),
		),

		totalUnfundedCashFlow: summarizeDistribution(
			results.map((result) => result.summary.totalUnfundedCashFlow),
		),

		probabilityOfAnyUnfundedCashFlow: simulationsWithUnfundedCashFlow / results.length,
	};
}

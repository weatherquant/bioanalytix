import { describe, expect, it } from "vitest";

import type { RetirementSpendingProfileComparisonResult } from "../retirement/compareRetirementSpendingProfiles";
import type {
	LifecycleDistributionSummary,
	LifecycleYearDistribution,
} from "../simulation/summarizeLifecycle";
import type { SimulationDistribution } from "../simulation/types";
import { buildLongevityViewModel, LongevityViewModelError } from "./longevityViewModel";

function distribution(value: number): SimulationDistribution {
	return {
		count: 2,
		percentiles: {
			p10: value,
			p25: value,
			p50: value,
			p75: value,
			p90: value,
		},
		minimum: value,
		maximum: value,
		mean: value,
	};
}

function year(
	age: number,
	retirementSpending: number,
	netWorth: number,
): LifecycleYearDistribution {
	return {
		yearIndex: age - 84,
		projectionDate: `${2040 + age - 84}-09-01`,
		primaryAge: age,
		retirementSpending: distribution(retirementSpending),
		netWorth: distribution(netWorth),
		liquidWealth: distribution(netWorth),
		superannuation: distribution(0),
		unfundedCashFlow: distribution(0),
	};
}

function summary(years: LifecycleYearDistribution[]): LifecycleDistributionSummary {
	return {
		simulationCount: 2,
		strategyId: "balanced",
		years,
		endingNetWorth: distribution(years[years.length - 1]?.netWorth.percentiles.p50 ?? 0),
		totalUnfundedCashFlow: distribution(0),
		probabilityOfAnyUnfundedCashFlow: 0,
	};
}

function comparison(
	options: {
		includeCare?: boolean;
		misalignAgeAdjusted?: boolean;
	} = {},
): RetirementSpendingProfileComparisonResult {
	const flatYears = [
		year(84, 80_000, 2_000_000),
		year(85, 80_000, 1_920_000),
		year(86, 80_000, 1_840_000),
	];

	const ageAdjustedYears = [
		year(84, 72_000, 2_008_000),
		year(options.misalignAgeAdjusted ? 87 : 85, 64_000, 1_944_000),
		year(86, 64_000, 1_880_000),
	];

	const careYears = [
		year(84, 72_000, 2_008_000),
		year(85, 114_000, 1_894_000),
		year(86, 114_000, 1_780_000),
	];

	return {
		retirementAge: 60,
		annualRetirementSpending: 80_000,
		strategyId: "balanced",
		strategyName: "Balanced",
		simulationCount: 2,

		flat: {
			id: "flat",
			label: "Flat real spending",
			summary: summary(flatYears),
		},

		ageAdjusted: {
			id: "age_adjusted",
			label: "Age-adjusted spending",
			summary: summary(ageAdjustedYears),
		},

		...(options.includeCare
			? {
					laterLifeCare: {
						startAge: 85,
						annualCost: 50_000,
						durationYears: 3,
					},

					ageAdjustedWithCare: {
						id: "age_adjusted_with_care" as const,
						label: "Age-adjusted spending with later-life care",
						summary: summary(careYears),
					},
				}
			: {}),
	};
}

describe("buildLongevityViewModel", () => {
	it("maps the retirement spending scenarios into the consumer journey", () => {
		const result = buildLongevityViewModel(comparison());

		const age85 = result.journey.find((point) => point.age === 85);

		expect(result.retirement).toEqual({
			age: 60,
			baseAnnualSpending: 80_000,
		});

		expect(age85?.flatSpending).toBe(80_000);
		expect(age85?.ageAdjustedSpending).toBe(64_000);
		expect(age85?.ageAdjustedWithCareSpending).toBeUndefined();
	});

	it("maps median net worth without performing new financial calculations", () => {
		const result = buildLongevityViewModel(comparison());

		const age85 = result.journey.find((point) => point.age === 85);

		expect(age85?.flatNetWorth).toBe(1_920_000);
		expect(age85?.ageAdjustedNetWorth).toBe(1_944_000);
	});

	it("preserves an explicit later-life care scenario", () => {
		const result = buildLongevityViewModel(
			comparison({
				includeCare: true,
			}),
		);

		expect(result.laterLifeCare).toEqual({
			startAge: 85,
			annualCost: 50_000,
			durationYears: 3,
		});

		const age85 = result.journey.find((point) => point.age === 85);

		expect(age85?.ageAdjustedWithCareSpending).toBe(114_000);
		expect(age85?.ageAdjustedWithCareNetWorth).toBe(1_894_000);
	});

	it("rejects projection scenarios whose years are not aligned", () => {
		expect(() =>
			buildLongevityViewModel(
				comparison({
					misalignAgeAdjusted: true,
				}),
			),
		).toThrow(LongevityViewModelError);
	});
});

import { describe, expect, it } from "vitest";

import type { RetirementAgeComparisonResult } from "../retirement/compareRetirementAges";
import { buildRetirementWhatIfViewModel } from "./retirementWhatIfViewModel";

function comparisonResult(): RetirementAgeComparisonResult {
	return {
		baselineRetirementAge: 60,

		alternativeRetirementAge: 54,

		baseline: {
			retirementAge: 60,
			maximumShortfallProbability: 0.1,
			simulationCount: 500,

			highestSustainableIncome: 90000,
			lowestSustainableIncome: 76000,
			incomeRange: 14000,

			outcomes: [
				{
					strategyId: "capital_stable",
					strategyName: "Capital Stable",
					riskLevel: "lower",
					growthAllocation: 0.2,
					defensiveAllocation: 0.65,
					cashAllocation: 0.15,
					summary: "",
					growthDescription: "",
					defensiveDescription: "",
					cashDescription: "",
					sustainableAnnualRetirementIncome: 76000,
					shortfallProbability: 0.1,
					simulationCount: 500,
					result: {} as never,
				},
				{
					strategyId: "conservative",
					strategyName: "Conservative",
					riskLevel: "low_moderate",
					growthAllocation: 0.4,
					defensiveAllocation: 0.5,
					cashAllocation: 0.1,
					summary: "",
					growthDescription: "",
					defensiveDescription: "",
					cashDescription: "",
					sustainableAnnualRetirementIncome: 80000,
					shortfallProbability: 0.1,
					simulationCount: 500,
					result: {} as never,
				},
				{
					strategyId: "balanced",
					strategyName: "Balanced",
					riskLevel: "moderate",
					growthAllocation: 0.6,
					defensiveAllocation: 0.35,
					cashAllocation: 0.05,
					summary: "",
					growthDescription: "",
					defensiveDescription: "",
					cashDescription: "",
					sustainableAnnualRetirementIncome: 86000,
					shortfallProbability: 0.1,
					simulationCount: 500,
					result: {} as never,
				},
				{
					strategyId: "growth",
					strategyName: "Growth",
					riskLevel: "higher",
					growthAllocation: 0.7,
					defensiveAllocation: 0.25,
					cashAllocation: 0.05,
					summary: "",
					growthDescription: "",
					defensiveDescription: "",
					cashDescription: "",
					sustainableAnnualRetirementIncome: 90000,
					shortfallProbability: 0.1,
					simulationCount: 500,
					result: {} as never,
				},
				{
					strategyId: "high_growth",
					strategyName: "High Growth",
					riskLevel: "highest",
					growthAllocation: 0.85,
					defensiveAllocation: 0.1,
					cashAllocation: 0.05,
					summary: "",
					growthDescription: "",
					defensiveDescription: "",
					cashDescription: "",
					sustainableAnnualRetirementIncome: 88000,
					shortfallProbability: 0.1,
					simulationCount: 500,
					result: {} as never,
				},
			],
		},

		alternative: {
			retirementAge: 54,
			maximumShortfallProbability: 0.1,
			simulationCount: 500,

			highestSustainableIncome: 75000,
			lowestSustainableIncome: 65000,
			incomeRange: 10000,

			outcomes: [
				{
					strategyId: "capital_stable",
					strategyName: "Capital Stable",
					riskLevel: "lower",
					growthAllocation: 0.2,
					defensiveAllocation: 0.65,
					cashAllocation: 0.15,
					summary: "",
					growthDescription: "",
					defensiveDescription: "",
					cashDescription: "",
					sustainableAnnualRetirementIncome: 65000,
					shortfallProbability: 0.1,
					simulationCount: 500,
					result: {} as never,
				},
				{
					strategyId: "conservative",
					strategyName: "Conservative",
					riskLevel: "low_moderate",
					growthAllocation: 0.4,
					defensiveAllocation: 0.5,
					cashAllocation: 0.1,
					summary: "",
					growthDescription: "",
					defensiveDescription: "",
					cashDescription: "",
					sustainableAnnualRetirementIncome: 68000,
					shortfallProbability: 0.1,
					simulationCount: 500,
					result: {} as never,
				},
				{
					strategyId: "balanced",
					strategyName: "Balanced",
					riskLevel: "moderate",
					growthAllocation: 0.6,
					defensiveAllocation: 0.35,
					cashAllocation: 0.05,
					summary: "",
					growthDescription: "",
					defensiveDescription: "",
					cashDescription: "",
					sustainableAnnualRetirementIncome: 72000,
					shortfallProbability: 0.1,
					simulationCount: 500,
					result: {} as never,
				},
				{
					strategyId: "growth",
					strategyName: "Growth",
					riskLevel: "higher",
					growthAllocation: 0.7,
					defensiveAllocation: 0.25,
					cashAllocation: 0.05,
					summary: "",
					growthDescription: "",
					defensiveDescription: "",
					cashDescription: "",
					sustainableAnnualRetirementIncome: 75000,
					shortfallProbability: 0.1,
					simulationCount: 500,
					result: {} as never,
				},
				{
					strategyId: "high_growth",
					strategyName: "High Growth",
					riskLevel: "highest",
					growthAllocation: 0.85,
					defensiveAllocation: 0.1,
					cashAllocation: 0.05,
					summary: "",
					growthDescription: "",
					defensiveDescription: "",
					cashDescription: "",
					sustainableAnnualRetirementIncome: 73000,
					shortfallProbability: 0.1,
					simulationCount: 500,
					result: {} as never,
				},
			],
		},

		differences: [
			{
				strategyId: "capital_stable",
				strategyName: "Capital Stable",
				baselineAnnualRetirementIncome: 76000,
				alternativeAnnualRetirementIncome: 65000,
				annualIncomeDifference: -11000,
				percentageDifference: -11000 / 76000,
			},
			{
				strategyId: "conservative",
				strategyName: "Conservative",
				baselineAnnualRetirementIncome: 80000,
				alternativeAnnualRetirementIncome: 68000,
				annualIncomeDifference: -12000,
				percentageDifference: -12000 / 80000,
			},
			{
				strategyId: "balanced",
				strategyName: "Balanced",
				baselineAnnualRetirementIncome: 86000,
				alternativeAnnualRetirementIncome: 72000,
				annualIncomeDifference: -14000,
				percentageDifference: -14000 / 86000,
			},
			{
				strategyId: "growth",
				strategyName: "Growth",
				baselineAnnualRetirementIncome: 90000,
				alternativeAnnualRetirementIncome: 75000,
				annualIncomeDifference: -15000,
				percentageDifference: -15000 / 90000,
			},
			{
				strategyId: "high_growth",
				strategyName: "High Growth",
				baselineAnnualRetirementIncome: 88000,
				alternativeAnnualRetirementIncome: 73000,
				annualIncomeDifference: -15000,
				percentageDifference: -15000 / 88000,
			},
		],
	};
}

describe("buildRetirementWhatIfViewModel", () => {
	it("builds a simple consumer view from the balanced comparison", () => {
		const view = buildRetirementWhatIfViewModel(comparisonResult());

		expect(view.question).toBe("What if I stopped working at 54?");

		expect(view.baseline).toEqual({
			retirementAge: 60,
			annualIncome: 86000,
		});

		expect(view.alternative).toEqual({
			retirementAge: 54,
			annualIncome: 72000,
		});

		expect(view.difference).toEqual({
			annualAmount: -14000,
			direction: "lower",
		});

		expect(view.strategies).toHaveLength(5);

		expect(view.strategies[2]).toEqual({
			id: "balanced",
			name: "Balanced",
			annualIncome: 72000,
			riskLabel: "Moderate volatility",
			allocationLabel: "60% growth · 35% defensive · 5% cash",
		});
	});

	it("uses retirement wording when the alternative age is later", () => {
		const result = comparisonResult();

		result.alternativeRetirementAge = 65;

		const view = buildRetirementWhatIfViewModel(result);

		expect(view.question).toBe("What if I retired at 65?");
	});
});

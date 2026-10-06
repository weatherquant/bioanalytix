import type {
	RetirementAgeComparisonResult,
	RetirementAgeStrategyDifference,
} from "../retirement/compareRetirementAges";

export type RetirementWhatIfDirection = "higher" | "lower" | "same";

export interface RetirementWhatIfViewModel {
	question: string;

	baseline: {
		retirementAge: number;
		annualIncome: number;
	};

	alternative: {
		retirementAge: number;
		annualIncome: number;
	};

	difference: {
		annualAmount: number;
		direction: RetirementWhatIfDirection;
	};

	strategies: Array<{
		id: string;
		name: string;
		annualIncome: number;
		riskLabel: string;
		allocationLabel: string;
	}>;

	interpretation: string;
}

function riskLabel(value: string): string {
	switch (value) {
		case "lower":
			return "Lower volatility";

		case "low_moderate":
			return "Low–moderate volatility";

		case "moderate":
			return "Moderate volatility";

		case "higher":
			return "Higher volatility";

		case "highest":
			return "Highest volatility";

		default:
			return "Market-linked";
	}
}

function allocationLabel(growth: number, defensive: number, cash: number): string {
	return [
		`${Math.round(growth * 100)}% growth`,
		`${Math.round(defensive * 100)}% defensive`,
		`${Math.round(cash * 100)}% cash`,
	].join(" · ");
}

function directionForDifference(annualAmount: number): RetirementWhatIfDirection {
	if (annualAmount > 0) {
		return "higher";
	}

	if (annualAmount < 0) {
		return "lower";
	}

	return "same";
}

function balancedDifference(
	result: RetirementAgeComparisonResult,
): RetirementAgeStrategyDifference {
	const difference = result.differences.find((candidate) => candidate.strategyId === "balanced");

	if (!difference) {
		throw new Error("Retirement what-if view requires the balanced strategy.");
	}

	return difference;
}

export function buildRetirementWhatIfViewModel(
	result: RetirementAgeComparisonResult,
): RetirementWhatIfViewModel {
	const balanced = balancedDifference(result);

	const strategies = result.alternative.outcomes.map((outcome) => ({
		id: outcome.strategyId,

		name: outcome.strategyName,

		annualIncome: outcome.sustainableAnnualRetirementIncome,

		riskLabel: riskLabel(outcome.riskLevel),

		allocationLabel: allocationLabel(
			outcome.growthAllocation,
			outcome.defensiveAllocation,
			outcome.cashAllocation,
		),
	}));

	const annualDifference =
		balanced.alternativeAnnualRetirementIncome - balanced.baselineAnnualRetirementIncome;

	return {
		question:
			result.alternativeRetirementAge < result.baselineRetirementAge
				? `What if I stopped working at ${result.alternativeRetirementAge}?`
				: `What if I retired at ${result.alternativeRetirementAge}?`,

		baseline: {
			retirementAge: result.baselineRetirementAge,

			annualIncome: balanced.baselineAnnualRetirementIncome,
		},

		alternative: {
			retirementAge: result.alternativeRetirementAge,

			annualIncome: balanced.alternativeAnnualRetirementIncome,
		},

		difference: {
			annualAmount: annualDifference,

			direction: directionForDifference(annualDifference),
		},

		strategies,

		interpretation:
			"Greater growth exposure may support more retirement income over a long horizon, but it also produces larger market fluctuations and greater exposure to poor market sequences.",
	};
}

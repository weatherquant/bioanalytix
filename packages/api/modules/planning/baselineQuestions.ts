import type { HouseholdFinancialState } from "../financial/household/types";
import type { SavedPlanningQuestion } from "./savedPlan";

export function buildBaselinePlanningQuestions(
	household: HouseholdFinancialState,
): SavedPlanningQuestion[] {
	const questions: SavedPlanningQuestion[] = [];

	questions.push({
		id: "baseline-income-interruption",
		source: "household",
		domain: "income_interruption",
		title: "Income interruption",
		question: "What would happen if household employment income stopped for 12 months?",
		rationale:
			"Testing temporary income loss can show how much reliance the household places on current earnings and liquid reserves.",
		significance: "moderate",
		selected: false,
	});

	questions.push({
		id: "baseline-longer-life",
		source: "longevity",
		domain: "longevity",
		title: "Longer retirement",
		question: "What if retirement and later-life costs had to be funded for another 10 years?",
		rationale:
			"A longer funding horizon can expose dependencies that are not obvious from a single retirement-age assumption.",
		significance: "moderate",
		selected: false,
	});

	questions.push({
		id: "baseline-health-costs",
		source: "household",
		domain: "health_costs",
		title: "Higher health costs",
		question: "What if health and recovery costs increased materially for several years?",
		rationale:
			"Health-related expenditure can affect liquidity and retirement resilience even without predicting a particular medical event.",
		significance: "moderate",
		selected: false,
	});

	if (household.insurance.length === 0) {
		questions.push({
			id: "baseline-insurance-gap",
			source: "insurance",
			domain: "premature_mortality",
			title: "Insurance resilience",
			question:
				"What would happen to the household if death or disability occurred without insurance support?",
			rationale: "No insurance arrangements are currently recorded in the household profile.",
			significance: "high",
			selected: false,
		});
	} else {
		questions.push({
			id: "baseline-insurance-cover",
			source: "insurance",
			domain: "premature_mortality",
			title: "Insurance adequacy",
			question:
				"Would your existing insurance cover be sufficient under an earlier-death or extended work-interruption scenario?",
			rationale:
				"Testing current cover against scenarios is different from recommending a particular insurance product.",
			significance: "moderate",
			selected: false,
		});
	}

	if (
		!household.estate.hasWill ||
		!household.estate.hasEnduringPowerOfAttorney ||
		!household.estate.hasSuperBeneficiaryNomination
	) {
		questions.push({
			id: "baseline-estate-readiness",
			source: "estate",
			domain: "estate",
			title: "Estate readiness",
			question:
				"What would happen if death or loss of capacity occurred before your estate arrangements were completed?",
			rationale:
				"One or more core estate-readiness items are not currently recorded as complete.",
			significance: "high",
			selected: false,
		});
	}

	return questions;
}

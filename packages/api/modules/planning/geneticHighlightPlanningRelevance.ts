import type { BiologicalInsight } from "../genetics/evidence/insight";
import type { GeneticPlanningRelevance } from "./geneticHighlight";

export function informationalRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	return {
		level: "informational",

		label: "For your awareness",

		meaning:
			"This genetic result is useful information about your profile, but Bioanalytix has not identified a reason from this result alone to change or stress-test your financial assumptions.",

		whyItMatters:
			"No specific financial-plan change is suggested from this result. The finding remains part of your genetic profile and can be reassessed as the evidence library develops.",

		planningDomains: [],

		scenarioEligible: false,
	};
}

export function factorVPlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	if (insight.result.direction !== "higher") {
		return informationalRelevance(insight);
	}

	return {
		level: "potential",

		label: "Worth considering",

		meaning:
			"This established genetic finding may make health-event and recovery resilience more relevant to your financial planning, but it does not predict that a thrombosis event will occur.",

		whyItMatters:
			"A significant thrombotic event could involve treatment costs, recovery time or temporary interruption to work. The useful planning question is whether your household has enough liquidity and income resilience if such a period occurred.",

		planningDomains: [
			"health_costs",
			"healthy_working_life",
			"income_interruption",
			"insurance",
		],

		suggestedQuestion:
			"Would your household remain financially resilient if a serious health event created additional treatment costs and temporarily interrupted employment income?",

		scenarioEligible: true,
	};
}

export function apoePlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	if (insight.result.direction !== "higher") {
		return informationalRelevance(insight);
	}

	return {
		level: "potential",

		label: "Worth considering",

		meaning:
			"This established susceptibility finding may increase the relevance of later-life care, financial resilience and estate-readiness planning. It is not a prediction that cognitive disease will occur.",

		whyItMatters:
			"Extended cognitive impairment can create prolonged care costs, reduce financial decision-making capacity and increase reliance on a partner or family. Those consequences may matter even when a conventional retirement projection otherwise appears well funded.",

		planningDomains: ["care_dependency", "health_costs", "estate", "family"],

		suggestedQuestion:
			"Would your retirement and estate arrangements remain resilient if you required several years of additional care or support later in life?",

		scenarioEligible: true,
	};
}

export function genericHigherRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	return {
		level: "potential",

		label: "Worth considering",

		meaning:
			"This genetic finding may be relevant to an aspect of your longer-term planning, but Bioanalytix does not currently have enough model-specific information to classify the financial consequence more strongly.",

		whyItMatters:
			"The finding may be worth keeping in mind when considering future health costs, work capacity, care requirements or family resilience. No financial assumption should be changed from this result alone.",

		planningDomains: ["health_costs"],

		suggestedQuestion:
			"Would your financial plan remain resilient if this health-related risk created additional costs or disruption?",

		scenarioEligible: false,
	};
}

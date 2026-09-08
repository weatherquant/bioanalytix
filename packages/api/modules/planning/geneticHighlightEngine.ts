import type { BiologicalInsight } from "../genetics/evidence/insight";
import type {
	GeneticHighlight,
	GeneticHighlightCategory,
	GeneticHighlightDirection,
	GeneticPlanningRelevance,
} from "./geneticHighlight";

export const GENETIC_HIGHLIGHT_ENGINE_VERSION = "1.1.0";

function normalizeDirection(insight: BiologicalInsight): GeneticHighlightDirection {
	switch (insight.result.direction) {
		case "higher":
			return "higher";

		case "reference":
			return "reference";

		case "lower":
			return "lower";

		case "indeterminate":
		default:
			return "indeterminate";
	}
}

function summaryForInsight(insight: BiologicalInsight): string {
	if (insight.model.id === "hfe-common-genotype-v1") {
		const state = hfeStateForInsight(insight);

		switch (state) {
			case "c282y_homozygous":
				return "Two copies of the HFE C282Y variant were identified, a genotype associated with increased susceptibility to HFE-related iron overload.";

			case "c282y_h63d_double_heterozygous":
				return "One HFE C282Y variant and one H63D variant were identified. This double-heterozygous pattern is associated with lower-penetrance iron-overload susceptibility.";

			case "c282y_heterozygous":
				return "One copy of the HFE C282Y variant was identified. This is a carrier finding rather than an elevated haemochromatosis susceptibility result.";

			case "h63d_homozygous":
				return "Two copies of the HFE H63D variant were identified. This genotype generally has much lower clinical significance than C282Y homozygosity.";

			case "h63d_heterozygous":
				return "One copy of the HFE H63D variant was identified. This is generally a low-significance carrier finding.";

			case "reference":
				return "Neither of the common HFE C282Y or H63D susceptibility patterns assessed by this model was identified.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve this HFE model reliably.";
		}
	}

	switch (insight.result.direction) {
		case "higher":
			return `This model identified a higher biological susceptibility signal relevant to ${insight.title}.`;

		case "reference":
			return `This model did not identify an elevated susceptibility signal for ${insight.title}.`;

		case "lower":
			return `This model identified a lower biological susceptibility signal relevant to ${insight.title}.`;

		case "indeterminate":
		default:
			return `This model could not determine a clear susceptibility signal for ${insight.title} from the available genotype data.`;
	}
}

function explanationForInsight(insight: BiologicalInsight): string {
	switch (insight.result.direction) {
		case "higher":
			return [
				"The result indicates a genetic association identified by the Bioanalytix evidence model.",
				"It does not mean that the associated condition will occur.",
				"Health outcomes also depend on age, environment, lifestyle, other genetic factors and clinical history.",
			].join(" ");

		case "reference":
			return [
				"The genotype assessed by this model is consistent with the model's reference category.",
				"This does not mean that the associated condition cannot occur.",
				"Genetic risk is only one component of overall health risk.",
			].join(" ");

		case "lower":
			return [
				"The model identifies a lower genetic susceptibility signal relative to its reference framework.",
				"This should not be interpreted as protection from the associated condition.",
			].join(" ");

		case "indeterminate":
		default:
			return [
				"The available genotype data was not sufficient for this model to provide a reliable directional interpretation.",
				"No risk conclusion should be drawn from this result.",
			].join(" ");
	}
}

function categoryForInsight(insight: BiologicalInsight): GeneticHighlightCategory {
	if (insight.model.id === "hfe-common-genotype-v1") {
		const state = hfeStateForInsight(insight);

		if (state === "c282y_heterozygous" || state === "h63d_heterozygous") {
			return "carrier";
		}

		return "health_risk";
	}

	switch (insight.model.id) {
		case "f5-factor-v-leiden-vte":
			return "health_risk";

		case "apoe-common-diplotype-v1":
			return "ageing_longevity";

		default:
			return "health_risk";
	}
}

function informationalRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
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

function factorVPlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
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

function apoePlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
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

function genericHigherRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
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

type HfeHighlightState =
	| "c282y_homozygous"
	| "c282y_h63d_double_heterozygous"
	| "c282y_heterozygous"
	| "h63d_homozygous"
	| "h63d_heterozygous"
	| "reference"
	| "unresolved";

function hfeStateForInsight(insight: BiologicalInsight): HfeHighlightState | undefined {
	if (insight.model.id !== "hfe-common-genotype-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "c282y_homozygous":
		case "c282y_h63d_double_heterozygous":
		case "c282y_heterozygous":
		case "h63d_homozygous":
		case "h63d_heterozygous":
		case "reference":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

function hfePlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = hfeStateForInsight(insight);

	switch (state) {
		case "c282y_homozygous":
			return {
				level: "potential",

				label: "Worth considering",

				meaning:
					"Two copies of the HFE C282Y variant were identified. This genotype is associated with increased susceptibility to HFE-related iron overload, although many people with this genotype never develop clinical haemochromatosis.",

				whyItMatters:
					"If clinically significant iron overload were to develop, it could create treatment, monitoring or health-related disruption over time. Bioanalytix therefore considers health-cost and healthy-working-life resilience worth testing rather than assuming that disease will occur.",

				planningDomains: ["health_costs", "healthy_working_life"],

				suggestedQuestion:
					"Would your financial plan remain resilient if a long-term health condition required recurring monitoring, treatment or periods of reduced work capacity?",

				scenarioEligible: true,
			};

		case "c282y_h63d_double_heterozygous":
			return {
				level: "potential",

				label: "Worth considering",

				meaning:
					"One C282Y and one H63D variant were identified. This double-heterozygous pattern is associated with HFE-related iron-overload susceptibility, but its clinical penetrance is substantially lower than C282Y homozygosity. Consumer genotype data does not establish whether the variants are in trans.",

				whyItMatters:
					"This result may justify keeping health-cost resilience in view, but it does not provide a basis for assuming future illness or changing financial assumptions automatically.",

				planningDomains: ["health_costs"],

				suggestedQuestion:
					"Would your plan comfortably absorb recurring health monitoring or treatment costs if they became necessary later?",

				scenarioEligible: true,
			};

		case "h63d_homozygous":
			return {
				level: "informational",

				label: "For your awareness",

				meaning:
					"Two copies of the HFE H63D variant were identified. This genotype can be associated with altered iron measures, but its clinical significance is generally much lower than C282Y homozygosity.",

				whyItMatters:
					"Bioanalytix does not currently consider this finding alone sufficient reason to change or stress-test your financial assumptions. It remains useful genetic information that can be reassessed as evidence evolves.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "c282y_heterozygous":
			return {
				level: "informational",

				label: "Carrier finding",

				meaning:
					"One copy of the HFE C282Y variant was identified. A single copy generally does not predict development of HFE-related haemochromatosis, but it may have relevance for biological relatives.",

				whyItMatters:
					"No financial-plan change is suggested from this carrier result. Its principal relevance is genetic and potentially familial rather than financial.",

				planningDomains: ["family"],

				scenarioEligible: false,
			};

		case "h63d_heterozygous":
			return {
				level: "informational",

				label: "Carrier finding",

				meaning:
					"One copy of the HFE H63D variant was identified. This is generally a low-significance finding for the individual but remains part of your genetic profile.",

				whyItMatters:
					"No financial-plan change is suggested from this result. Bioanalytix will retain it so its interpretation can be revisited as genetic evidence develops.",

				planningDomains: ["family"],

				scenarioEligible: false,
			};

		case "reference":
			return {
				level: "informational",

				label: "For your awareness",

				meaning:
					"This model did not identify either of the common HFE C282Y or H63D susceptibility patterns assessed by Bioanalytix.",

				whyItMatters:
					"No change to your financial assumptions is suggested from this HFE result. The model does not assess every possible genetic cause of iron overload.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",

				label: "Result not resolved",

				meaning:
					"The available consumer genotype data was not sufficient for Bioanalytix to resolve this HFE model reliably.",

				whyItMatters:
					"No financial-planning conclusion should be drawn from an unresolved genetic result.",

				planningDomains: [],

				scenarioEligible: false,
			};
	}
}

function planningRelevanceForInsight(insight: BiologicalInsight): GeneticPlanningRelevance {
	/*
	 * Some models contain useful result-specific states
	 * even when their disease-susceptibility direction is
	 * reference. Handle those before generic direction
	 * logic.
	 */
	if (insight.model.id === "hfe-common-genotype-v1") {
		return hfePlanningRelevance(insight);
	}

	if (insight.result.direction !== "higher") {
		return informationalRelevance(insight);
	}

	switch (insight.model.id) {
		case "f5-factor-v-leiden-vte":
			return factorVPlanningRelevance(insight);

		case "apoe-common-diplotype-v1":
			return apoePlanningRelevance(insight);

		default:
			return genericHigherRelevance(insight);
	}
}

function deduplicateLimitations(limitations: string[]): string[] {
	return [...new Set(limitations)];
}

export function buildGeneticHighlights(insights: BiologicalInsight[]): GeneticHighlight[] {
	return insights.map((insight) => ({
		id: `genetic-highlight-${insight.id}`,

		title: insight.title,

		domain: insight.domain,

		direction: normalizeDirection(insight),

		evidenceStrength: insight.confidence.evidenceStrength,

		category: categoryForInsight(insight),

		summary: summaryForInsight(insight),

		explanation: explanationForInsight(insight),

		planningRelevance: planningRelevanceForInsight(insight),

		model: {
			id: insight.model.id,

			version: insight.model.version,
		},

		limitations: deduplicateLimitations(insight.limitations),

		provenance: {
			evidenceIds: [...insight.provenance.evidenceIds],

			engineVersion: GENETIC_HIGHLIGHT_ENGINE_VERSION,

			generatedAt: new Date().toISOString(),
		},
	}));
}

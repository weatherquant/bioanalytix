import type { BiologicalInsight } from "../genetics/evidence/insight";
import type { GeneticHighlight, GeneticHighlightDirection } from "./geneticHighlight";

export const GENETIC_HIGHLIGHT_ENGINE_VERSION = "1.0.0";

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

export function buildGeneticHighlights(insights: BiologicalInsight[]): GeneticHighlight[] {
	return insights.map((insight) => ({
		id: `genetic-highlight-${insight.id}`,

		title: insight.title,

		domain: insight.domain,

		direction: normalizeDirection(insight),

		evidenceStrength: insight.confidence.evidenceStrength,

		summary: summaryForInsight(insight),

		explanation: explanationForInsight(insight),

		model: {
			id: insight.model.id,
			version: insight.model.version,
		},

		limitations: [...insight.limitations],

		provenance: {
			evidenceIds: [...insight.provenance.evidenceIds],

			engineVersion: GENETIC_HIGHLIGHT_ENGINE_VERSION,

			generatedAt: new Date().toISOString(),
		},
	}));
}

import type { BiologicalInsight } from "../genetics/evidence/insight";
import type { GeneticHighlightDirection } from "./geneticHighlight";

export function normalizeGeneticHighlightDirection(
	insight: BiologicalInsight,
): GeneticHighlightDirection {
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

export function explanationForGeneticInsight(insight: BiologicalInsight): string {
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

export function deduplicateGeneticLimitations(limitations: string[]): string[] {
	return [...new Set(limitations)];
}

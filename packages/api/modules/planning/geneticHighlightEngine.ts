import type { BiologicalInsight } from "../genetics/evidence/insight";
import type { GeneticHighlight } from "./geneticHighlight";
import { categoryForGeneticInsight } from "./geneticHighlightCategory";
import { planningRelevanceForInsight } from "./geneticHighlightPlanningRelevance";
import {
	deduplicateGeneticLimitations,
	explanationForGeneticInsight,
	normalizeGeneticHighlightDirection,
} from "./geneticHighlightPresentation";
import { summaryForGeneticInsight } from "./geneticHighlightSummary";

export const GENETIC_HIGHLIGHT_ENGINE_VERSION = "1.14.0";

export function buildGeneticHighlights(insights: BiologicalInsight[]): GeneticHighlight[] {
	return insights.map((insight) => ({
		id: `genetic-highlight-${insight.id}`,

		title: insight.title,

		domain: insight.domain,

		direction: normalizeGeneticHighlightDirection(insight),

		evidenceStrength: insight.confidence.evidenceStrength,

		category: categoryForGeneticInsight(insight),

		summary: summaryForGeneticInsight(insight),

		explanation: explanationForGeneticInsight(insight),

		planningRelevance: planningRelevanceForInsight(insight),

		model: {
			id: insight.model.id,

			version: insight.model.version,
		},

		limitations: deduplicateGeneticLimitations(insight.limitations),

		provenance: {
			evidenceIds: [...insight.provenance.evidenceIds],

			engineVersion: GENETIC_HIGHLIGHT_ENGINE_VERSION,

			generatedAt: new Date().toISOString(),
		},
	}));
}

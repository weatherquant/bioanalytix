import type { BiologicalInsight } from "../genetics/evidence/insight";
import type { GeneticHighlightCategory } from "./geneticHighlight";
import {
	hfeStateForInsight,
	mutyhStateForInsight,
	serpina1StateForInsight,
} from "./geneticHighlightStates";

export function categoryForGeneticInsight(insight: BiologicalInsight): GeneticHighlightCategory {
	if (insight.model.id === "hfe-common-genotype-v1") {
		const state = hfeStateForInsight(insight);

		if (state === "c282y_heterozygous" || state === "h63d_heterozygous") {
			return "carrier";
		}

		return "health_risk";
	}

	if (insight.model.id === "serpina1-common-genotype-v1") {
		const state = serpina1StateForInsight(insight);

		if (state === "mz" || state === "ms") {
			return "carrier";
		}

		return "health_risk";
	}

	if (insight.model.id === "mcm6-lactase-persistence-v1") {
		return "nutrition_metabolism";
	}

	if (insight.model.id === "cyp1a2-caffeine-metabolism-v1") {
		return "nutrition_metabolism";
	}

	if (insight.model.id === "actn3-muscle-performance-v1") {
		return "trait";
	}

	if (insight.model.id === "tas2r38-bitter-taste-v1") {
		return "trait";
	}

	if (
		insight.model.id === "adh1b-alcohol-metabolism-v1" ||
		insight.model.id === "aldh2-alcohol-response-v1"
	) {
		return "nutrition_metabolism";
	}

	if (insight.model.id === "lpa-cardiovascular-risk-v1") {
		return "health_risk";
	}

	if (insight.model.id === "amd-common-susceptibility-v1") {
		return "health_risk";
	}

	if (insight.model.id === "tcf7l2-type-2-diabetes-v1") {
		return "health_risk";
	}

	if (insight.model.id === "lrrk2-g2019s-parkinson-v1") {
		return "health_risk";
	}

	if (
		insight.model.id === "ttr-v142i-amyloidosis-v1" ||
		insight.model.id === "apob-r3527q-fh-v1" ||
		insight.model.id === "f2-g20210a-thrombophilia-v1"
	) {
		return "health_risk";
	}

	if (insight.model.id === "mutyh-selected-variants-v1") {
		const state = mutyhStateForInsight(insight);

		if (state === "single_pathogenic_variant") {
			return "carrier";
		}

		return "health_risk";
	}

	if (insight.model.id === "brca-selected-substitution-variants-v1") {
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

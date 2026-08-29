// packages/api/modules/genetics/trait-models.ts

import type { SNPRecord } from "./snp-reference";
import { SNP_REFERENCE } from "./snp-reference";

export type TraitCategory =
	| "sleep"
	| "fitness"
	| "metabolism"
	| "longevity"
	| "stressResponse"
	| "hormonalAging"
	| "mitochondrialFunction"
	| "dnaRepair"
	| "epigeneticAging";

export type TraitInsight = {
	trait: TraitCategory;
	summary: string;
	markers: {
		snp: SNPRecord;
		userGenotype: string;
		interpretation: string;
	}[];
};

const TRAIT_SUMMARIES: Record<TraitCategory, string> = {
	sleep: "Variants may influence caffeine sensitivity, circadian rhythm, and sleep timing.",
	fitness: "Markers suggest tendencies in power vs endurance performance and exercise response.",
	metabolism:
		"Variants may influence appetite regulation, lipid handling, and metabolic efficiency.",
	longevity:
		"Signals in FOXO3, mTOR, and related pathways may shape cellular resilience and aging speed.",
	stressResponse:
		"Antioxidant and cellular stress pathways influence resilience to environmental and metabolic stress.",
	hormonalAging:
		"Variants affecting IGF‑1, estrogen/testosterone metabolism, and thyroid signaling shape hormonal aging.",
	mitochondrialFunction:
		"Signals affecting mitochondrial efficiency, ROS handling, and ATP production influence energy resilience.",
	dnaRepair:
		"Variants in DNA repair pathways may influence genomic stability and long-term cancer risk.",
	epigeneticAging:
		"Signals affecting methylation and epigenetic plasticity may shape biological aging trajectories.",
};

export function computeTraitInsights(userSnps: Record<string, string>): TraitInsight[] {
	const categories: TraitCategory[] = [
		"sleep",
		"fitness",
		"metabolism",
		"longevity",
		"stressResponse",
		"hormonalAging",
		"mitochondrialFunction",
		"dnaRepair",
		"epigeneticAging",
	];

	return categories.map((cat) => {
		const markers = SNP_REFERENCE.filter(
			(s) => s.category === "trait" && s.subcategory === cat,
		);

		const markerInsights: TraitInsight["markers"] = [];

		for (const snp of markers) {
			const userGenotype = userSnps[snp.rsid];
			if (!userGenotype) continue;

			const hasRiskAllele = snp.riskAlleles.some((a) => userGenotype.includes(a));

			let interpretation: string;

			if (!hasRiskAllele) {
				interpretation = `No strong signal detected at ${snp.gene} (${snp.rsid}) for this trait.`;
			} else {
				interpretation = `${snp.description} Your genotype (${userGenotype}) suggests a measurable effect on this trait.`;
			}

			markerInsights.push({
				snp,
				userGenotype,
				interpretation,
			});
		}

		return {
			trait: cat,
			summary: TRAIT_SUMMARIES[cat],
			markers: markerInsights,
		};
	});
}

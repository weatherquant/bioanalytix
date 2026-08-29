// packages/api/modules/genetics/disease-models.ts

import type { SNPRecord } from "./snp-reference";
import { SNP_REFERENCE } from "./snp-reference";

export type DiseaseCategory =
	| "alzheimer"
	| "heart"
	| "diabetes"
	| "cancer"
	| "inflammation"
	| "thrombosis"
	| "adiposity"
	| "mitochondria"
	| "dnaRepair"
	| "epigenetics"
	| "stress"
	| "hormones";

export type DiseaseRiskScore = {
	disease: DiseaseCategory;
	score: number; // 0–1 normalized
	label: "low" | "average" | "elevated";
	explanation: string;
	contributingMarkers: SNPRecord[];
};

function normalizeScore(raw: number): number {
	const clamped = Math.max(-0.5, Math.min(0.5, raw));
	return (clamped + 0.5) / 1.0;
}

function labelFromScore(score: number): DiseaseRiskScore["label"] {
	if (score < 0.35) return "low";
	if (score > 0.65) return "elevated";
	return "average";
}

const EXPLANATIONS: Record<DiseaseCategory, string> = {
	alzheimer:
		"Variants in APOE and related pathways influence amyloid handling, inflammation, and cognitive aging.",
	heart: "Variants affecting lipids, homocysteine, vascular tone, and oxidative stress shape cardiovascular risk.",
	diabetes:
		"Signals in insulin sensitivity, beta-cell function, and glucose regulation influence lifetime metabolic risk.",
	cancer: "DNA repair efficiency, tumor suppression signaling, and inflammatory drivers shape lifetime cancer susceptibility.",
	inflammation:
		"Cytokine regulation, CRP pathways, and immune signaling influence chronic inflammatory load.",
	thrombosis:
		"Coagulation factor variants and fibrinolysis efficiency shape clotting tendency and vascular event risk.",
	adiposity:
		"Variants in appetite regulation, fat distribution, and metabolic efficiency influence long-term adiposity.",
	mitochondria:
		"Signals affecting mitochondrial efficiency, ROS handling, and ATP production shape cellular energy resilience.",
	dnaRepair:
		"Variants in base excision, nucleotide excision, and double-strand break repair influence genomic stability.",
	epigenetics:
		"Signals affecting methylation, histone modification, and epigenetic plasticity shape biological aging.",
	stress: "Oxidative stress handling, antioxidant pathways, and cellular stress resilience influence aging speed.",
	hormones:
		"Variants in IGF-1, estrogen/testosterone metabolism, and thyroid signaling shape hormonal aging trajectories.",
};

export function computeDiseaseRisks(userSnps: Record<string, string>): DiseaseRiskScore[] {
	const categories: DiseaseCategory[] = [
		"alzheimer",
		"heart",
		"diabetes",
		"cancer",
		"inflammation",
		"thrombosis",
		"adiposity",
		"mitochondria",
		"dnaRepair",
		"epigenetics",
		"stress",
		"hormones",
	];

	return categories.map((cat) => {
		const markers = SNP_REFERENCE.filter(
			(s) => s.category === "disease" && s.subcategory === cat,
		);

		let rawScore = 0;
		const contributing: SNPRecord[] = [];

		for (const snp of markers) {
			const userGenotype = userSnps[snp.rsid];
			if (!userGenotype) continue;

			const hasRiskAllele = snp.riskAlleles.some((a) => userGenotype.includes(a));
			if (!hasRiskAllele) continue;

			rawScore += snp.effectSize;
			contributing.push(snp);
		}

		const score = normalizeScore(rawScore);
		const label = labelFromScore(score);

		return {
			disease: cat,
			score,
			label,
			explanation: EXPLANATIONS[cat],
			contributingMarkers: contributing,
		};
	});
}

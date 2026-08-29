import { scoreToRiskTier } from "./scoreToRiskTier";

export function mapGeneticRisks(profile) {
	const diseaseMap = {};
	for (const d of profile.disease_risks || []) {
		diseaseMap[d.disease] = scoreToRiskTier(d.score);
	}

	const traitMap = {};
	for (const t of profile.trait_insights || []) {
		traitMap[t.trait] = t.summary;
	}

	return {
		cardiometabolic: {
			lipids: diseaseMap["heart"] || "moderate",
			bloodPressure: diseaseMap["heart"] || "moderate",
			glucose: diseaseMap["diabetes"] || "moderate",
			weight: traitMap["metabolism"] ? "moderate" : "low",
		},

		neuro: {
			alzheimer: diseaseMap["alzheimer"] || "moderate",
			resilience: scoreToRiskTier(profile.longevity_score ?? 0.5),
			inflammation: diseaseMap["heart"] || "moderate", // placeholder until you add neuro markers
		},

		longevity: {
			overall: scoreToRiskTier(profile.longevity_score ?? 0.5),

			// placeholders until you add real markers
			mTOR: scoreToRiskTier(profile.longevity_score ?? 0.5),
			igf1: scoreToRiskTier(profile.longevity_score ?? 0.5),
			foxo: scoreToRiskTier(profile.longevity_score ?? 0.5),
			sirtuins: scoreToRiskTier(profile.longevity_score ?? 0.5),
		},

		cancer: {
			dnaRepair: "moderate", // placeholder until BRCA / repair markers added
			hormonal: "moderate", // placeholder until hormone-linked markers added
			immune: "moderate", // placeholder until immune surveillance markers added
		},

		inflammation: {
			baseline: "moderate", // placeholder until cytokine markers added
			immuneAging: "moderate", // placeholder until T-cell / thymic markers added
			autoimmune: "moderate", // placeholder until autoimmune markers added
		},

		thrombosis: {
			clotting: "moderate", // placeholder until Factor V / Prothrombin markers added
			vte: "moderate", // placeholder until VTE markers added
			platelets: "moderate", // placeholder until platelet activation markers added
		},

		adiposity: {
			weight: "moderate", // until you add FTO / MC4R markers
			visceral: "moderate", // until you add visceral-fat markers
			efficiency: "moderate", // until you add mitochondrial/metabolic markers
		},

		mitochondria: {
			energy: "moderate", // until you add mitochondrial enzyme markers
			oxidative: "moderate", // until you add oxidative stress markers
			flexibility: "moderate", // until you add metabolic switching markers
		},

		dna: {
			repair: "moderate", // until you add repair pathway markers
			stability: "moderate", // until you add telomere / chromosomal markers
			cleanup: "moderate", // until you add autophagy / proteostasis markers
		},

		epigenetics: {
			agingRate: "moderate", // until you add methylation markers
			stability: "moderate", // until you add chromatin / methylation maintenance markers
			sensitivity: "moderate", // until you add environment-linked epigenetic markers
		},

		stress: {
			oxidative: "moderate", // until you add SOD2 / GPX1 markers
			resilience: "moderate", // until you add heat-shock / UPR markers
			inflammatory: "moderate", // until you add cytokine stress markers
		},

		hormones: {
			sexHormones: "moderate", // until you add ESR1 / AR / CYP19A1 markers
			thyroid: "moderate", // until you add TSHR / DIO2 / thyroid pathway markers
			cortisol: "moderate", // until you add NR3C1 / HPA-axis markers
		},
	};
}

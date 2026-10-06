import type { VariantEvidence } from "./types";

export const LRRK2_G2019S_EVIDENCE: VariantEvidence = {
	id: "lrrk2-g2019s-parkinson-rs34637584",

	version: "1.0.0",

	variant: {
		rsid: "rs34637584",

		gene: "LRRK2",

		genomeBuild: "unknown",

		hgvs: "NM_198578.4:c.6055G>A",
	},

	phenotype: {
		name: "LRRK2-related Parkinson disease susceptibility",
	},

	evidenceClass: "established_risk_variant",

	evidenceStrength: "established",

	effectAllele: "A",

	otherAllele: "G",

	inheritanceModel: "genotype_specific",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "LRRK2 p.Gly2019Ser has been extensively characterised in familial and sporadic Parkinson disease cohorts",
	},

	validationPopulations: [
		{
			label: "Pathogenic association replicated across multiple populations; allele frequency and penetrance vary substantially by ancestry and cohort",
		},
	],

	replicated: true,

	sources: [
		{
			id: "gene-reviews-lrrk2-parkinson",

			type: "guideline",

			title: "LRRK2-Related Parkinson Disease — GeneReviews",

			identifier: "NBK1208",

			accessedAt: "2026-09-12",
		},

		{
			id: "clinvar-lrrk2-g2019s",

			type: "clinvar",

			title: "LRRK2 c.6055G>A (p.Gly2019Ser)",

			identifier: "rs34637584",

			accessedAt: "2026-09-12",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"LRRK2 p.Gly2019Ser is associated with Parkinson disease but has incomplete and age-dependent penetrance.",

		"Identification of the variant does not mean that Parkinson disease is present or will develop.",

		"Published penetrance estimates vary materially between populations, studies and age groups.",

		"Absence of this variant does not imply absence of genetic or non-genetic Parkinson disease risk.",

		"This model assesses only LRRK2 p.Gly2019Ser and does not constitute comprehensive Parkinson disease genetic testing.",

		"Consumer raw genotype data must not be treated as clinically confirmed detection of a pathogenic variant.",

		"Clinical confirmation is required before medical or financial-planning action is based on this finding.",
	],
};

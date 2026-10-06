import type { VariantEvidence } from "./types";

export const TTR_V142I_EVIDENCE: VariantEvidence = {
	id: "ttr-v142i-amyloidosis-rs76992529",

	version: "1.0.0",

	variant: {
		rsid: "rs76992529",

		gene: "TTR",

		genomeBuild: "unknown",

		hgvs: "NM_000371.4:c.424G>A",
	},

	phenotype: {
		name: "Hereditary transthyretin amyloidosis susceptibility",
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
		label: "TTR p.Val142Ile has been extensively characterised in hereditary transthyretin amyloidosis, particularly cardiac disease",
	},

	validationPopulations: [
		{
			label: "Established pathogenic variant; frequency and penetrance vary by ancestry, age and clinical context",
		},
	],

	replicated: true,

	sources: [
		{
			id: "clinvar-ttr-v142i",

			type: "clinvar",

			title: "TTR c.424G>A (p.Val142Ile)",

			identifier: "rs76992529",

			accessedAt: "2026-09-12",
		},

		{
			id: "gene-reviews-hattr",

			type: "guideline",

			title: "Hereditary Transthyretin Amyloidosis — GeneReviews",

			identifier: "NBK1194",

			accessedAt: "2026-09-12",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"TTR p.Val142Ile is a pathogenic variant associated with hereditary transthyretin amyloidosis, but penetrance is incomplete and age dependent.",

		"Identification of this variant does not establish that amyloidosis is present or that symptoms will develop.",

		"The p.Val142Ile variant has historically also been described as p.Val122Ile.",

		"Clinical presentation may include cardiac disease and can vary between individuals.",

		"This single-variant model does not constitute comprehensive TTR genetic testing.",

		"Consumer raw genotype data must be independently confirmed before medical or financial-planning action.",
	],
};

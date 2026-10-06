import type { VariantEvidence } from "./types";

export const HFE_C282Y_EVIDENCE: VariantEvidence = {
	id: "hfe-c282y",

	version: "1.0.0",

	variant: {
		rsid: "rs1800562",

		gene: "HFE",

		genomeBuild: "unknown",

		hgvs: "NM_000410.3:c.845G>A",
	},

	phenotype: {
		name: "HFE-related iron overload susceptibility",
	},

	evidenceClass: "established_risk_variant",

	evidenceStrength: "established",

	effectAllele: "A",

	otherAllele: "G",

	inheritanceModel: "genotype_specific",

	/*
	 * Do not collapse this genotype into one universal
	 * relative-risk estimate.
	 *
	 * HFE-related haemochromatosis has incomplete clinical
	 * penetrance, even among p.Cys282Tyr homozygotes.
	 */
	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "Not applicable — established HFE genotype association",
	},

	validationPopulations: [
		{
			label: "Association best characterised in populations of European ancestry; prevalence and penetrance vary by ancestry, sex, age and environmental factors",
		},
	],

	replicated: true,

	sources: [
		{
			id: "gene-reviews-hfe-hemochromatosis",

			type: "guideline",

			title: "HFE-Related Hemochromatosis — GeneReviews",

			identifier: "NBK1440",

			publicationYear: 2024,

			accessedAt: "2026-09-08",
		},

		{
			id: "clinvar-hfe-c282y",

			type: "clinvar",

			title: "HFE p.Cys282Tyr variant",

			identifier: "rs1800562",

			accessedAt: "2026-09-08",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",

		"HFE p.Cys282Tyr homozygosity does not mean that clinical haemochromatosis will develop.",

		"Clinical penetrance is incomplete and varies with sex, age, ancestry, alcohol exposure, metabolic factors and other genetic or environmental influences.",

		"Assessment of iron overload requires clinical context and laboratory measurements such as transferrin saturation and serum ferritin.",

		"Other pathogenic variants in HFE and other iron-overload genes are not assessed by this two-variant consumer-genotype model.",
	],
};

export const HFE_H63D_EVIDENCE: VariantEvidence = {
	id: "hfe-h63d",

	version: "1.0.0",

	variant: {
		rsid: "rs1799945",

		gene: "HFE",

		genomeBuild: "unknown",

		hgvs: "NM_000410.3:c.187C>G",
	},

	phenotype: {
		name: "HFE-related iron overload susceptibility",
	},

	evidenceClass: "established_risk_variant",

	evidenceStrength: "established",

	effectAllele: "G",

	otherAllele: "C",

	inheritanceModel: "genotype_specific",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "Not applicable — established HFE genotype association",
	},

	validationPopulations: [
		{
			label: "Association best characterised in populations of European ancestry; clinical penetrance is substantially lower than for p.Cys282Tyr homozygosity",
		},
	],

	replicated: true,

	sources: [
		{
			id: "gene-reviews-hfe-hemochromatosis",

			type: "guideline",

			title: "HFE-Related Hemochromatosis — GeneReviews",

			identifier: "NBK1440",

			publicationYear: 2024,

			accessedAt: "2026-09-08",
		},

		{
			id: "clinvar-hfe-h63d",

			type: "clinvar",

			title: "HFE p.His63Asp variant",

			identifier: "rs1799945",

			accessedAt: "2026-09-08",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",

		"HFE p.His63Asp generally has substantially lower clinical penetrance than p.Cys282Tyr homozygosity.",

		"H63D heterozygosity alone rarely provides a basis for predicting clinically important iron overload.",

		"Clinical assessment of suspected iron overload requires laboratory and medical evaluation.",

		"Other pathogenic variants in HFE and other iron-overload genes are not assessed by this two-variant consumer-genotype model.",
	],
};

import type { VariantEvidence } from "./types";

export const FACTOR_V_LEIDEN_EVIDENCE: VariantEvidence = {
	id: "f5-factor-v-leiden-vte",
	version: "1.0.0",

	variant: {
		rsid: "rs6025",
		gene: "F5",
		genomeBuild: "unknown",
		hgvs: "NM_000130.5:c.1601G>A",
	},

	phenotype: {
		name: "Venous thromboembolism susceptibility",
	},

	evidenceClass: "established_risk_variant",
	evidenceStrength: "established",

	effectAllele: "A",
	otherAllele: "G",

	inheritanceModel: "genotype_specific",

	/*
	 * Do not store one universal effect estimate here.
	 *
	 * Published VTE risk differs materially between
	 * heterozygous and homozygous carriers and is also
	 * modified by age, family history and acquired factors.
	 *
	 * Genotype-specific effects belong in the interpretation
	 * model rather than being collapsed into one scalar.
	 */
	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "Not applicable — established variant association",
	},

	validationPopulations: [
		{
			label: "Predominantly populations of European ancestry; prevalence and applicability vary by population",
		},
	],

	replicated: true,

	sources: [
		{
			id: "gene-reviews-factor-v-leiden",
			type: "guideline",
			title: "Factor V Leiden Thrombophilia — GeneReviews",
			identifier: "NBK1368",
			publicationYear: 2024,
			accessedAt: "2026-08-31",
		},
		{
			id: "clinvar-rs6025",
			type: "clinvar",
			title: "F5 Factor V Leiden variant",
			identifier: "rs6025",
			accessedAt: "2026-08-31",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",
		"Presence of the variant does not predict that venous thromboembolism will occur.",
		"Risk differs substantially between heterozygous and homozygous carriers.",
		"Absolute risk depends on age, family history and acquired or circumstantial risk factors.",
		"Variant prevalence differs substantially between ancestry groups.",
	],
};

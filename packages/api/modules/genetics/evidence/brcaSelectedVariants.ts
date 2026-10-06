import type { VariantEvidence } from "./types";

export const BRCA1_R1443X_EVIDENCE: VariantEvidence = {
	id: "brca1-r1443x-rs41293455",

	version: "1.0.0",

	variant: {
		rsid: "rs41293455",
		gene: "BRCA1",
		genomeBuild: "unknown",
		hgvs: "NM_007294.4:c.4327C>T",
	},

	phenotype: {
		name: "BRCA1-related cancer predisposition",
	},

	evidenceClass: "established_risk_variant",

	evidenceStrength: "established",

	/*
	 * BRCA1 is on the reverse strand.
	 *
	 * Transcript:
	 * c.4327C>T
	 *
	 * Genomic plus-strand:
	 * G>A
	 */
	effectAllele: "A",

	otherAllele: "G",

	inheritanceModel: "dominant",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "BRCA1 p.Arg1443Ter is an established pathogenic loss-of-function variant associated with hereditary cancer predisposition",
	},

	validationPopulations: [
		{
			label: "Pathogenic association supported by clinical cohorts and expert-panel classification",
		},
	],

	replicated: true,

	sources: [
		{
			id: "clinvar-brca1-r1443x",

			type: "clinvar",

			title: "BRCA1 c.4327C>T (p.Arg1443Ter)",

			identifier: "rs41293455",

			accessedAt: "2026-09-12",
		},

		{
			id: "23andme-brca-selected-variants",

			type: "other",

			title: "BRCA1/BRCA2 (Selected Variants)",

			identifier: "23andMe selected-variant panel",

			accessedAt: "2026-09-12",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"This model assesses selected BRCA1 and BRCA2 pathogenic variants and is not a comprehensive BRCA genetic test.",

		"Absence of the selected variants assessed by Bioanalytix does not exclude other pathogenic BRCA1 or BRCA2 variants.",

		"A pathogenic BRCA1 or BRCA2 variant indicates inherited cancer predisposition but does not mean that cancer is present or will definitely develop.",

		"Cancer risk varies by gene, variant, age, sex, family history and other genetic and non-genetic factors.",

		"Consumer raw genotype data must be independently confirmed before medical or financial-planning action.",
	],
};

export const BRCA2_Q2342X_EVIDENCE: VariantEvidence = {
	...BRCA1_R1443X_EVIDENCE,

	id: "brca2-q2342x-rs80358928",

	variant: {
		rsid: "rs80358928",
		gene: "BRCA2",
		genomeBuild: "unknown",
		hgvs: "NM_000059.4:c.7024C>T",
	},

	phenotype: {
		name: "BRCA2-related cancer predisposition",
	},

	effectAllele: "T",

	otherAllele: "C",

	developmentPopulation: {
		label: "BRCA2 p.Gln2342Ter is an established pathogenic loss-of-function variant associated with hereditary cancer predisposition",
	},

	sources: [
		{
			id: "clinvar-brca2-q2342x",

			type: "clinvar",

			title: "BRCA2 c.7024C>T (p.Gln2342Ter)",

			identifier: "rs80358928",

			accessedAt: "2026-09-12",
		},

		{
			id: "23andme-brca-selected-variants",

			type: "other",

			title: "BRCA1/BRCA2 (Selected Variants)",

			identifier: "23andMe selected-variant panel",

			accessedAt: "2026-09-12",
		},
	],
};

export const BRCA2_R2494X_EVIDENCE: VariantEvidence = {
	...BRCA1_R1443X_EVIDENCE,

	id: "brca2-r2494x-rs80358972",

	variant: {
		rsid: "rs80358972",
		gene: "BRCA2",
		genomeBuild: "unknown",
		hgvs: "NM_000059.4:c.7480C>T",
	},

	phenotype: {
		name: "BRCA2-related cancer predisposition",
	},

	effectAllele: "T",

	otherAllele: "C",

	developmentPopulation: {
		label: "BRCA2 p.Arg2494Ter is an established pathogenic loss-of-function variant associated with hereditary cancer predisposition",
	},

	sources: [
		{
			id: "clinvar-brca2-r2494x",

			type: "clinvar",

			title: "BRCA2 c.7480C>T (p.Arg2494Ter)",

			identifier: "rs80358972",

			accessedAt: "2026-09-12",
		},

		{
			id: "23andme-brca-selected-variants",

			type: "other",

			title: "BRCA1/BRCA2 (Selected Variants)",

			identifier: "23andMe selected-variant panel",

			accessedAt: "2026-09-12",
		},
	],
};

export const BRCA_SELECTED_VARIANT_EVIDENCE = [
	BRCA1_R1443X_EVIDENCE,
	BRCA2_Q2342X_EVIDENCE,
	BRCA2_R2494X_EVIDENCE,
] as const;

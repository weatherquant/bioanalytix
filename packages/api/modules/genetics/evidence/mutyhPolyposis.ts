import type { VariantEvidence } from "./types";

export const MUTYH_Y179C_EVIDENCE: VariantEvidence = {
	id: "mutyh-y179c-rs34612342",

	version: "1.0.0",

	variant: {
		rsid: "rs34612342",

		gene: "MUTYH",

		genomeBuild: "unknown",

		hgvs: "NM_001128425.1:c.536A>G",
	},

	phenotype: {
		name: "MUTYH-associated polyposis",
	},

	evidenceClass: "established_risk_variant",

	evidenceStrength: "established",

	/*
	 * Genomic plus-strand:
	 * NC_000001.11:g.45332803T>C
	 */
	effectAllele: "C",

	otherAllele: "T",

	inheritanceModel: "recessive",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "MUTYH p.Tyr179Cys is a well-established pathogenic variant for autosomal-recessive MUTYH-associated polyposis",
	},

	validationPopulations: [
		{
			label: "Pathogenic association replicated across affected families and clinical cohorts",
		},
	],

	replicated: true,

	sources: [
		{
			id: "clinvar-mutyh-y179c",

			type: "clinvar",

			title: "MUTYH c.536A>G (p.Tyr179Cys)",

			identifier: "rs34612342",

			accessedAt: "2026-09-12",
		},

		{
			id: "gene-reviews-mutyh-polyposis",

			type: "guideline",

			title: "MUTYH Polyposis — GeneReviews",

			identifier: "NBK107219",

			accessedAt: "2026-09-12",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"MUTYH-associated polyposis is primarily associated with biallelic pathogenic MUTYH variants.",

		"A single pathogenic MUTYH variant generally represents carrier status rather than a diagnosis of MUTYH-associated polyposis.",

		"This model assesses only two common pathogenic MUTYH variants and does not constitute comprehensive MUTYH testing.",

		"Absence of these selected variants does not exclude other pathogenic variants in MUTYH.",

		"Consumer raw genotype data must be independently confirmed before medical or financial-planning action.",
	],
};

export const MUTYH_G396D_EVIDENCE: VariantEvidence = {
	...MUTYH_Y179C_EVIDENCE,

	id: "mutyh-g396d-rs36053993",

	variant: {
		rsid: "rs36053993",

		gene: "MUTYH",

		genomeBuild: "unknown",

		hgvs: "NM_001128425.1:c.1187G>A",
	},

	/*
	 * Genomic plus-strand:
	 * NC_000001.11:g.45331556C>T
	 */
	effectAllele: "T",

	otherAllele: "C",

	developmentPopulation: {
		label: "MUTYH p.Gly396Asp is a well-established pathogenic variant for autosomal-recessive MUTYH-associated polyposis",
	},
};

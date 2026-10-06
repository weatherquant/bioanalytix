import type { VariantEvidence } from "./types";

export const APOB_R3527Q_EVIDENCE: VariantEvidence = {
	id: "apob-r3527q-fh-rs5742904",

	version: "1.0.0",

	variant: {
		rsid: "rs5742904",

		gene: "APOB",

		genomeBuild: "unknown",

		hgvs: "NM_000384.3:c.10580G>A",
	},

	phenotype: {
		name: "APOB-related familial hypercholesterolaemia",
	},

	evidenceClass: "established_risk_variant",

	evidenceStrength: "established",

	/*
	 * Consumer/raw genomic plus-strand orientation:
	 * NC_000002.12:g.21006288C>T
	 */
	effectAllele: "T",

	otherAllele: "C",

	inheritanceModel: "genotype_specific",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "APOB p.Arg3527Gln is a well-established cause of familial hypercholesterolaemia, especially in populations of European ancestry",
	},

	validationPopulations: [
		{
			label: "Pathogenic association replicated across affected families and clinical cohorts",
		},
	],

	replicated: true,

	sources: [
		{
			id: "clinvar-apob-r3527q",

			type: "clinvar",

			title: "APOB c.10580G>A (p.Arg3527Gln)",

			identifier: "rs5742904",

			accessedAt: "2026-09-12",
		},

		{
			id: "gene-reviews-familial-hypercholesterolemia",

			type: "guideline",

			title: "Familial Hypercholesterolemia — GeneReviews",

			identifier: "NBK174884",

			accessedAt: "2026-09-12",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"APOB p.Arg3527Gln is a pathogenic familial-hypercholesterolaemia variant but this single-variant model does not constitute comprehensive familial-hypercholesterolaemia genetic testing.",

		"Absence of this variant does not exclude familial hypercholesterolaemia or other causes of elevated LDL cholesterol.",

		"Clinical interpretation requires lipid measurements, personal history, family history and other relevant clinical information.",

		"Observed consumer genotype alleles are interpreted using genomic plus-strand C/T orientation for rs5742904.",

		"Consumer raw genotype data must be independently confirmed before medical or financial-planning action.",
	],
};

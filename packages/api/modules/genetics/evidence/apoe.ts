import type { VariantEvidence } from "./types";

export const APOE_RS429358_EVIDENCE: VariantEvidence = {
	id: "apoe-rs429358-alzheimer-susceptibility",
	version: "1.0.0",

	variant: {
		rsid: "rs429358",
		gene: "APOE",
		genomeBuild: "unknown",
	},

	phenotype: {
		name: "Late-onset Alzheimer disease susceptibility",
	},

	evidenceClass: "susceptibility_haplotype",
	evidenceStrength: "established",

	inheritanceModel: "haplotype",

	effect: {
		measure: "none",
	},

	replicated: true,

	sources: [
		{
			id: "ncbi-apoe-definitions",
			type: "guideline",
			title: "Common APOE Allele Minimum Variant Definitions and Associations",
			identifier: "NBK605938",
			accessedAt: "2026-08-31",
		},
		{
			id: "gene-reviews-alzheimer",
			type: "guideline",
			title: "Alzheimer Disease Overview — GeneReviews",
			identifier: "NBK1161",
			accessedAt: "2026-08-31",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"APOE interpretation requires rs429358 and rs7412 rather than rs429358 alone.",
		"APOE epsilon 4 is a susceptibility factor and is neither necessary nor sufficient for Alzheimer disease.",
		"Absence of epsilon 4 does not imply absence of Alzheimer disease risk.",
		"Risk associated with APOE genotype varies with age, sex, ancestry and other factors.",
		"Consumer raw genotype observations are not equivalent to clinically confirmed testing.",
		"Unphased genotype data may not uniquely determine APOE haplotypes in every possible genotype combination.",
	],
};

export const APOE_RS7412_EVIDENCE: VariantEvidence = {
	...APOE_RS429358_EVIDENCE,

	id: "apoe-rs7412-alzheimer-susceptibility",

	variant: {
		rsid: "rs7412",
		gene: "APOE",
		genomeBuild: "unknown",
	},
};

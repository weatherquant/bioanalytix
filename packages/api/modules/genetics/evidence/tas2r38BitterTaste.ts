import type { VariantEvidence } from "./types";

export const TAS2R38_RS713598_EVIDENCE: VariantEvidence = {
	id: "tas2r38-rs713598",

	version: "1.0.0",

	variant: {
		rsid: "rs713598",
		gene: "TAS2R38",
		genomeBuild: "unknown",
	},

	phenotype: {
		name: "Bitter taste perception",
	},

	evidenceClass: "established_trait_variant",

	evidenceStrength: "strong",

	inheritanceModel: "haplotype",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "TAS2R38 bitter-taste phenotype studied across multiple populations",
	},

	validationPopulations: [
		{
			label: "Multiple populations; PAV and AVI are the two major common TAS2R38 haplotypes, with population frequencies varying by ancestry",
		},
	],

	replicated: true,

	sources: [
		{
			id: "tas2r38-bitter-taste-review",

			type: "pubmed",

			title: "Genetic background of taste perception, taste preferences, and nutritional implications",

			identifier: "rs713598;rs1726866;rs10246939",

			publicationYear: 2020,

			accessedAt: "2026-09-11",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"TAS2R38 genotype strongly influences sensitivity to PTC and PROP but does not determine overall taste preference.",

		"Food preferences depend on many sensory, cultural, behavioural and environmental factors.",

		"Rare TAS2R38 haplotypes exist and are not represented by the simple PAV/AVI classification.",

		"Unphased consumer genotype data may not resolve every TAS2R38 diplotype uniquely.",

		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",
	],
};

export const TAS2R38_RS1726866_EVIDENCE: VariantEvidence = {
	...TAS2R38_RS713598_EVIDENCE,

	id: "tas2r38-rs1726866",

	variant: {
		rsid: "rs1726866",
		gene: "TAS2R38",
		genomeBuild: "unknown",
	},
};

export const TAS2R38_RS10246939_EVIDENCE: VariantEvidence = {
	...TAS2R38_RS713598_EVIDENCE,

	id: "tas2r38-rs10246939",

	variant: {
		rsid: "rs10246939",
		gene: "TAS2R38",
		genomeBuild: "unknown",
	},
};

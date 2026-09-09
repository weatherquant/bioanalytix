import type { VariantEvidence } from "./types";

export const SERPINA1_Z_EVIDENCE: VariantEvidence = {
	id: "serpina1-z",

	version: "1.0.0",

	variant: {
		rsid: "rs28929474",

		gene: "SERPINA1",

		genomeBuild: "unknown",

		hgvs: "NM_000295.5:c.1096G>A",
	},

	phenotype: {
		name: "Alpha-1 antitrypsin deficiency susceptibility",
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
		label: "Not applicable — established SERPINA1 deficiency allele",
	},

	validationPopulations: [
		{
			label: "Established across multiple populations; allele frequency and clinical expression vary by ancestry and environmental exposures",
		},
	],

	replicated: true,

	sources: [
		{
			id: "gene-reviews-alpha1-antitrypsin-deficiency",

			type: "guideline",

			title: "Alpha-1 Antitrypsin Deficiency — GeneReviews",

			identifier: "NBK1519",

			publicationYear: 2023,

			accessedAt: "2026-09-09",
		},

		{
			id: "clinvar-serpina1-z",

			type: "clinvar",

			title: "SERPINA1 PI*Z allele",

			identifier: "rs28929474",

			accessedAt: "2026-09-09",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",

		"The Z allele is one of several pathogenic SERPINA1 alleles; this model does not assess all disease-causing variants.",

		"Genotype does not by itself establish alpha-1 antitrypsin deficiency; serum alpha-1 antitrypsin concentration and clinical assessment may be required.",

		"Clinical expression varies substantially and is influenced by smoking, occupational exposures, age and other factors.",

		"Pulmonary and hepatic manifestations differ between individuals.",
	],
};

export const SERPINA1_S_EVIDENCE: VariantEvidence = {
	id: "serpina1-s",

	version: "1.0.0",

	variant: {
		rsid: "rs17580",

		gene: "SERPINA1",

		genomeBuild: "unknown",

		hgvs: "NM_000295.5:c.863A>T",
	},

	phenotype: {
		name: "Alpha-1 antitrypsin deficiency susceptibility",
	},

	evidenceClass: "established_risk_variant",

	evidenceStrength: "established",

	effectAllele: "T",

	otherAllele: "A",

	inheritanceModel: "genotype_specific",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "Not applicable — established SERPINA1 deficiency allele",
	},

	validationPopulations: [
		{
			label: "Established association; clinical consequence is generally substantially lower than PI*Z and is most relevant in combination with another deficiency allele",
		},
	],

	replicated: true,

	sources: [
		{
			id: "gene-reviews-alpha1-antitrypsin-deficiency",

			type: "guideline",

			title: "Alpha-1 Antitrypsin Deficiency — GeneReviews",

			identifier: "NBK1519",

			publicationYear: 2023,

			accessedAt: "2026-09-09",
		},

		{
			id: "clinvar-serpina1-s",

			type: "clinvar",

			title: "SERPINA1 PI*S allele",

			identifier: "rs17580",

			accessedAt: "2026-09-09",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",

		"The S allele generally has lower clinical significance than the Z allele when present alone.",

		"The S allele may be clinically important when combined with another deficiency allele such as PI*Z.",

		"This two-variant model does not assess all pathogenic SERPINA1 variants.",

		"Clinical interpretation may require serum alpha-1 antitrypsin testing and medical evaluation.",
	],
};

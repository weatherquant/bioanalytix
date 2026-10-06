import type { VariantEvidence } from "./types";

export const LACTASE_PERSISTENCE_EVIDENCE: VariantEvidence = {
	id: "mcm6-lactase-persistence-rs4988235",

	version: "1.0.0",

	variant: {
		rsid: "rs4988235",

		gene: "MCM6",

		genomeBuild: "unknown",

		hgvs: "NM_005915.6:c.1917+326C>T",
	},

	phenotype: {
		name: "Adult lactase persistence",
	},

	evidenceClass: "established_trait_variant",

	evidenceStrength: "established",

	effectAllele: "T",

	otherAllele: "C",

	inheritanceModel: "dominant",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "Lactase persistence association best established in European-ancestry populations",
	},

	validationPopulations: [
		{
			label: "European populations, where the rs4988235 T allele is strongly associated with persistence of lactase expression into adulthood",
		},
	],

	replicated: true,

	sources: [
		{
			id: "clinvar-rs4988235",

			type: "clinvar",

			title: "MCM6/LCT -13910C>T lactase persistence variant",

			identifier: "rs4988235",

			accessedAt: "2026-09-10",
		},

		{
			id: "lactase-persistence-population-evidence",

			type: "pubmed",

			title: "Lactase persistence-associated genetic variation",

			identifier: "rs4988235",

			accessedAt: "2026-09-10",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"rs4988235 is especially informative for lactase persistence in populations of European ancestry.",

		"Other populations can carry different lactase-persistence variants that are not assessed by this model.",

		"Genetic lactase non-persistence is not equivalent to symptomatic lactose intolerance.",

		"Diet, gut health, lactose dose and individual tolerance influence whether dairy consumption causes symptoms.",

		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",
	],
};

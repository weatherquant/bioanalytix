import type { VariantEvidence } from "./types";

export const CAFFEINE_METABOLISM_EVIDENCE: VariantEvidence = {
	id: "cyp1a2-caffeine-metabolism-rs762551",

	version: "1.0.0",

	variant: {
		rsid: "rs762551",

		gene: "CYP1A2",

		genomeBuild: "unknown",
	},

	phenotype: {
		name: "Caffeine metabolism tendency",
	},

	evidenceClass: "established_trait_variant",

	evidenceStrength: "strong",

	effectAllele: "A",

	otherAllele: "C",

	inheritanceModel: "genotype_specific",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "Association characterised across multiple populations, with environmental modifiers including smoking and other CYP1A2 inducers",
	},

	validationPopulations: [
		{
			label: "Multiple populations; rs762551 AA is generally associated with greater CYP1A2 inducibility and faster caffeine clearance than C-allele carrier genotypes",
		},
	],

	replicated: true,

	sources: [
		{
			id: "cyp1a2-caffeine-systematic-review",

			type: "pubmed",

			title: "Genetic susceptibility to caffeine intake and metabolism: a systematic review",

			identifier: "rs762551",

			accessedAt: "2026-09-11",
		},

		{
			id: "cyp1a2-caffeine-performance-review",

			type: "pubmed",

			title: "Does ergogenic effect of caffeine supplementation depend on CYP1A2 genotypes? A systematic review with meta-analysis",

			identifier: "rs762551",

			accessedAt: "2026-09-11",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"rs762551 influences CYP1A2 inducibility but does not completely determine caffeine metabolism rate.",

		"Smoking, medications, diet, hormonal factors and other environmental exposures can materially alter CYP1A2 activity.",

		"AA is commonly associated with faster caffeine clearance, while AC and CC are commonly associated with slower clearance, but individual responses vary.",

		"Caffeine sensitivity, sleep disruption and habitual caffeine consumption are not determined by CYP1A2 genotype alone.",

		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",
	],
};

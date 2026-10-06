import type { VariantEvidence } from "./types";

export const ACTN3_PERFORMANCE_EVIDENCE: VariantEvidence = {
	id: "actn3-r577x-rs1815739",

	version: "1.0.0",

	variant: {
		rsid: "rs1815739",

		gene: "ACTN3",

		genomeBuild: "unknown",
	},

	phenotype: {
		name: "Muscle performance tendency",
	},

	evidenceClass: "established_trait_variant",

	evidenceStrength: "strong",

	effectAllele: "C",

	otherAllele: "T",

	inheritanceModel: "genotype_specific",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "Association studied across athletic and population cohorts",
	},

	validationPopulations: [
		{
			label: "Multiple populations; effect sizes and athletic associations vary across ancestry groups and sporting disciplines",
		},
	],

	replicated: true,

	sources: [
		{
			id: "actn3-r577x-performance-review",

			type: "pubmed",

			title: "ACTN3 R577X polymorphism and athletic performance",

			identifier: "rs1815739",

			accessedAt: "2026-09-11",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"ACTN3 genotype does not determine athletic ability or sporting success.",

		"Training history, age, sex, body composition, environment and many other genes materially influence performance.",

		"Associations between ACTN3 genotype and power or endurance phenotypes vary across populations and studies.",

		"The XX genotype is compatible with normal health and normal athletic performance.",

		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",
	],
};

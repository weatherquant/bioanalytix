import type { VariantEvidence } from "./types";

export const TCF7L2_DIABETES_EVIDENCE: VariantEvidence = {
	id: "tcf7l2-type-2-diabetes-rs7903146",

	version: "1.0.0",

	variant: {
		rsid: "rs7903146",

		gene: "TCF7L2",

		genomeBuild: "unknown",
	},

	phenotype: {
		name: "Type 2 diabetes susceptibility",
	},

	evidenceClass: "established_risk_variant",

	evidenceStrength: "established",

	effectAllele: "T",

	otherAllele: "C",

	inheritanceModel: "genotype_specific",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "TCF7L2 rs7903146 has been extensively studied in type 2 diabetes cohorts across multiple populations",
	},

	validationPopulations: [
		{
			label: "Association replicated across multiple ancestry groups, with allele frequency and effect estimates varying between populations",
		},
	],

	replicated: true,

	sources: [
		{
			id: "tcf7l2-rs7903146-meta-analysis-2019",

			type: "pubmed",

			title: "Genetic associations between TCF7L2 rs7903146 polymorphism and type 2 diabetes mellitus: a meta-analysis of 115,809 subjects",

			identifier: "31312259",

			publicationYear: 2019,

			accessedAt: "2026-09-12",
		},

		{
			id: "tcf7l2-huge-review",

			type: "pubmed",

			title: "Association between TCF7L2 gene polymorphisms and susceptibility to Type 2 Diabetes Mellitus: a large Human Genome Epidemiology review and meta-analysis",

			identifier: "19228405",

			publicationYear: 2009,

			accessedAt: "2026-09-12",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"TCF7L2 rs7903146 is a susceptibility marker and does not establish that type 2 diabetes is present or will occur.",

		"Age, body composition, family history, physical activity, diet and many other genetic and environmental factors materially influence type 2 diabetes risk.",

		"This variant does not provide a personal absolute probability of developing type 2 diabetes.",

		"The association and allele frequency vary between ancestry groups.",

		"Normal genotype at this locus does not imply low overall diabetes risk.",

		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",
	],
};

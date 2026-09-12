import type { VariantEvidence } from "./types";

export const ADH1B_ALCOHOL_METABOLISM_EVIDENCE: VariantEvidence = {
	id: "adh1b-alcohol-metabolism-rs1229984",

	version: "1.0.0",

	variant: {
		rsid: "rs1229984",

		gene: "ADH1B",

		genomeBuild: "unknown",
	},

	phenotype: {
		name: "Alcohol metabolism tendency",
	},

	evidenceClass: "established_trait_variant",

	evidenceStrength: "strong",

	effectAllele: "A",

	otherAllele: "G",

	inheritanceModel: "genotype_specific",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "Functional ADH1B association characterised across multiple populations",
	},

	validationPopulations: [
		{
			label: "Multiple ancestry groups; allele frequencies vary substantially between populations",
		},
	],

	replicated: true,

	sources: [
		{
			id: "adh1b-alcohol-dependence-meta-analysis",

			type: "pubmed",

			title: "Strong association of the alcohol dehydrogenase 1B gene with alcohol dependence and alcohol-induced medical diseases",

			identifier: "rs1229984",

			publicationYear: 2011,

			accessedAt: "2026-09-12",
		},

		{
			id: "adh1b-consumption-mendelian-randomisation",

			type: "pubmed",

			title: "Association between alcohol and cardiovascular disease: Mendelian randomisation analysis based on individual participant data",

			identifier: "rs1229984",

			publicationYear: 2014,

			accessedAt: "2026-09-12",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"ADH1B rs1229984 affects the rate at which ethanol is converted to acetaldehyde but does not determine an individual's complete alcohol response.",

		"The A allele is associated with faster ethanol oxidation and, at population level, lower alcohol consumption and lower alcohol-dependence risk.",

		"Alcohol flushing is more strongly influenced by ALDH2 variants and should not be inferred from ADH1B alone.",

		"Alcohol consumption and subjective response are influenced by many genetic, behavioural, social and environmental factors.",

		"Allele frequencies vary substantially between ancestry groups.",

		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",
	],
};

import type { VariantEvidence } from "./types";

export const CFH_AMD_EVIDENCE: VariantEvidence = {
	id: "cfh-amd-rs1061170",

	version: "1.0.0",

	variant: {
		rsid: "rs1061170",
		gene: "CFH",
		genomeBuild: "unknown",
	},

	phenotype: {
		name: "Age-related macular degeneration susceptibility",
	},

	evidenceClass: "established_risk_variant",

	evidenceStrength: "established",

	effectAllele: "C",

	otherAllele: "T",

	inheritanceModel: "genotype_specific",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "CFH Y402H association characterised extensively in age-related macular degeneration cohorts",
	},

	validationPopulations: [
		{
			label: "Replicated across multiple populations; allele frequency and effect estimates vary by ancestry",
		},
	],

	replicated: true,

	sources: [
		{
			id: "beaver-dam-amd-cfh-arms2",

			type: "pubmed",

			title: "Risk alleles in CFH and ARMS2 and the long-term natural history of age-related macular degeneration",

			identifier: "23494043",

			publicationYear: 2013,

			accessedAt: "2026-09-12",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"CFH rs1061170 is a susceptibility marker and does not establish that age-related macular degeneration is present or will occur.",

		"Age is a major determinant of AMD risk and is not represented by this genotype result.",

		"Smoking, ocular findings, ancestry, other genetic variants and environmental factors materially influence AMD risk.",

		"Risk associated with CFH rs1061170 varies between ancestry groups.",

		"This model does not calculate personal absolute AMD risk.",

		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",
	],
};

export const ARMS2_AMD_EVIDENCE: VariantEvidence = {
	...CFH_AMD_EVIDENCE,

	id: "arms2-amd-rs10490924",

	variant: {
		rsid: "rs10490924",
		gene: "ARMS2",
		genomeBuild: "unknown",
	},

	effectAllele: "T",

	otherAllele: "G",

	developmentPopulation: {
		label: "ARMS2 A69S association characterised extensively in age-related macular degeneration cohorts",
	},

	limitations: [
		"ARMS2 rs10490924 is a susceptibility marker and does not establish that age-related macular degeneration is present or will occur.",

		"Age is a major determinant of AMD risk and is not represented by this genotype result.",

		"Smoking, ocular findings, ancestry, other genetic variants and environmental factors materially influence AMD risk.",

		"Risk associated with ARMS2 rs10490924 varies between ancestry groups.",

		"This model does not calculate personal absolute AMD risk.",

		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",
	],
};

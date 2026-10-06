import type { VariantEvidence } from "./types";

export const LPA_RS10455872_EVIDENCE: VariantEvidence = {
	id: "lpa-rs10455872",

	version: "1.0.0",

	variant: {
		rsid: "rs10455872",

		gene: "LPA",

		genomeBuild: "unknown",
	},

	phenotype: {
		name: "Elevated lipoprotein(a) and coronary disease susceptibility",
	},

	evidenceClass: "established_risk_variant",

	evidenceStrength: "established",

	effectAllele: "G",

	otherAllele: "A",

	inheritanceModel: "genotype_specific",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "LPA variant association characterised in large cardiovascular cohorts",
	},

	validationPopulations: [
		{
			label: "Replicated across multiple cohorts; variant frequencies and predictive value vary by ancestry",
		},
	],

	replicated: true,

	sources: [
		{
			id: "lpa-coronary-disease-genetic-variants",

			type: "pubmed",

			title: "Genetic variants associated with Lp(a) lipoprotein level and coronary disease",

			identifier: "20032323",

			publicationYear: 2009,

			accessedAt: "2026-09-12",
		},

		{
			id: "lpa-cad-fh-study",

			type: "pubmed",

			title: "Coronary artery disease and the risk-associated LPA variants rs3798220 and rs10455872",

			identifier: "32681934",

			publicationYear: 2020,

			accessedAt: "2026-09-12",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"Presence of an LPA risk allele does not establish that coronary artery disease is present or will occur.",

		"LPA genotype does not provide a personal absolute cardiovascular-risk estimate.",

		"Measured lipoprotein(a) concentration provides clinically relevant information beyond these selected variants.",

		"These variants explain only part of genetically determined variation in lipoprotein(a).",

		"Variant frequencies and predictive performance vary substantially between ancestry groups.",

		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",
	],
};

export const LPA_RS3798220_EVIDENCE: VariantEvidence = {
	...LPA_RS10455872_EVIDENCE,

	id: "lpa-rs3798220",

	variant: {
		rsid: "rs3798220",

		gene: "LPA",

		genomeBuild: "unknown",
	},

	effectAllele: "C",

	otherAllele: "T",
};

import type { VariantEvidence } from "./types";

export const ALDH2_ALCOHOL_RESPONSE_EVIDENCE: VariantEvidence = {
	id: "aldh2-alcohol-response-rs671",

	version: "1.0.0",

	variant: {
		rsid: "rs671",

		gene: "ALDH2",

		genomeBuild: "unknown",
	},

	phenotype: {
		name: "Acetaldehyde clearance and alcohol response",
	},

	evidenceClass: "established_trait_variant",

	evidenceStrength: "established",

	effectAllele: "A",

	otherAllele: "G",

	inheritanceModel: "genotype_specific",

	effect: {
		measure: "none",
	},

	developmentPopulation: {
		label: "ALDH2 rs671 is especially prevalent and extensively characterised in East Asian populations",
	},

	validationPopulations: [
		{
			label: "Strong functional evidence across populations, with the deficient A allele occurring much more frequently in East Asian ancestry groups",
		},
	],

	replicated: true,

	sources: [
		{
			id: "aldh2-rs671-alcohol-metabolism-review",

			type: "pubmed",

			title: "ALDH2 rs671 and alcohol metabolism",

			identifier: "rs671",

			accessedAt: "2026-09-12",
		},

		{
			id: "aldh2-glu504lys-review",

			type: "pubmed",

			title: "ALDH2 Glu504Lys functional variation and alcohol response",

			identifier: "rs671",

			accessedAt: "2026-09-12",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"ALDH2 rs671 strongly affects acetaldehyde metabolism but does not fully determine an individual's subjective response to alcohol.",

		"The A allele substantially reduces ALDH2 enzyme activity and can increase acetaldehyde accumulation after alcohol consumption.",

		"Facial flushing is commonly associated with ALDH2 deficiency but should not be inferred with certainty from genotype alone.",

		"Alcohol-related health risk depends on drinking behaviour, dose, frequency, other genetic variants and environmental factors.",

		"The rs671 A allele is substantially more common in East Asian populations than in many other ancestry groups.",

		"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",
	],
};

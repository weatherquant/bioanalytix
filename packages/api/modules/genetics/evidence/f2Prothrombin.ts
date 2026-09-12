import type { VariantEvidence } from "./types";

export const F2_G20210A_EVIDENCE: VariantEvidence = {
	id: "f2-g20210a-thrombophilia-rs1799963",

	version: "1.0.0",

	variant: {
		rsid: "rs1799963",

		gene: "F2",

		genomeBuild: "unknown",

		hgvs: "NM_000506.5:c.*97G>A",
	},

	phenotype: {
		name: "Prothrombin thrombophilia susceptibility",
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
		label: "F2 G20210A is a well-established inherited thrombophilia variant",
	},

	validationPopulations: [
		{
			label: "Association replicated across multiple clinical cohorts; prevalence varies by ancestry",
		},
	],

	replicated: true,

	sources: [
		{
			id: "clinvar-f2-g20210a",

			type: "clinvar",

			title: "F2 c.*97G>A (G20210A)",

			identifier: "rs1799963",

			accessedAt: "2026-09-12",
		},

		{
			id: "gene-reviews-prothrombin-thrombophilia",

			type: "guideline",

			title: "Prothrombin Thrombophilia — GeneReviews",

			identifier: "NBK1148",

			accessedAt: "2026-09-12",
		},
	],

	status: "approved",

	review: {
		reviewed: false,
	},

	limitations: [
		"F2 G20210A increases susceptibility to venous thromboembolism but does not mean that thrombosis will occur.",

		"Many carriers never experience a thrombotic event.",

		"Absolute thrombotic risk depends on age, family history, pregnancy, surgery, immobility, medications and other acquired or genetic factors.",

		"Absence of F2 G20210A does not exclude inherited or acquired thrombophilia.",

		"Consumer raw genotype data must be independently confirmed before medical or financial-planning action.",
	],
};

import type { EvidenceClass, EvidenceStrength } from "./types";

export type ConfirmationRequirement =
	| "none"
	| "recommended"
	| "required_before_medical_action"
	| "required_before_display";

export type ImplementationStatus = "experimental" | "implemented" | "retired";

export type ScientificReviewStatus = "pending" | "reviewed" | "approved" | "rejected";

export type ReleaseStatus = "development" | "approved_for_release" | "retired";

export interface ModelPermissions {
	calculateResult: boolean;
	displayResult: boolean;
	describeRelativeRisk: boolean;
	calculateAbsoluteRisk: boolean;
	useInLongevityModel: boolean;
	generatePlanningExposures: boolean;
	modifyFinancialParameters: boolean;
}

export interface GovernanceReview {
	status: ScientificReviewStatus;

	reviewer?: string;
	reviewedAt?: string;
	nextReviewAt?: string;

	notes?: string;
}

export interface ModelLifecycle {
	implementation: ImplementationStatus;

	release: ReleaseStatus;
}

export interface LicensingProvenance {
	/**
	 * This describes Bioanalytix's recorded
	 * licensing assessment, not a guarantee of
	 * legal permission.
	 */
	status: "not_applicable" | "review_required" | "reviewed_permitted" | "restricted";

	source?: string;
	notes?: string;
}

export interface ModelGovernance {
	modelId: string;
	modelVersion: string;

	evidenceClass: EvidenceClass;
	evidenceStrength: EvidenceStrength;

	lifecycle: ModelLifecycle;

	confirmationRequirement: ConfirmationRequirement;

	permissions: ModelPermissions;

	review: GovernanceReview;

	licensing: LicensingProvenance;

	limitations: string[];
}

export const MODEL_POLICIES: Record<string, ModelGovernance> = {
	"f5-factor-v-leiden-vte": {
		modelId: "f5-factor-v-leiden-vte",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",

			/**
			 * The implementation is available for
			 * development and validation, but has
			 * not yet completed the documented
			 * Bioanalytix scientific release
			 * process.
			 */
			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,
			displayResult: true,
			describeRelativeRisk: true,
			calculateAbsoluteRisk: false,
			useInLongevityModel: false,
			generatePlanningExposures: true,
			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Reference implementation pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific and clinical reference sources",

			notes: "This interpretation currently uses public variant definitions and evidence rather than a licensed proprietary scoring algorithm. Any incorporated third-party dataset or scoring model requires a separate licensing assessment.",
		},

		limitations: [
			"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",
			"Relative-risk statements must remain evidence-bound and must not be presented as personal absolute risk.",
			"The result must not directly alter mortality, retirement-age or financial assumptions.",
		],
	},

	"apoe-common-diplotype-v1": {
		modelId: "apoe-common-diplotype-v1",

		modelVersion: "1.0.0",

		evidenceClass: "susceptibility_haplotype",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",

			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,
			displayResult: true,
			describeRelativeRisk: true,
			calculateAbsoluteRisk: false,
			useInLongevityModel: false,
			generatePlanningExposures: true,
			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Reference implementation pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific and clinical reference sources",

			notes: "This interpretation currently uses public APOE allele definitions and evidence rather than a licensed proprietary scoring algorithm. Any incorporated third-party dataset or scoring model requires a separate licensing assessment.",
		},

		limitations: [
			"APOE is a susceptibility marker and is not diagnostic.",
			"Absence of epsilon 4 does not imply absence of Alzheimer disease risk.",
			"Unphased consumer genotype data may not uniquely resolve every APOE haplotype configuration.",
			"The result must not directly alter survival probabilities or financial-plan parameters.",
		],
	},

	"hfe-common-genotype-v1": {
		modelId: "hfe-common-genotype-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",

			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,

			displayResult: true,

			describeRelativeRisk: true,

			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			generatePlanningExposures: true,

			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Reference HFE C282Y/H63D consumer-genotype implementation pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific and clinical reference sources",

			notes: "This interpretation uses public HFE variant definitions and clinical evidence rather than a proprietary genetic scoring algorithm.",
		},

		limitations: [
			"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",

			"The model assesses only the common HFE C282Y and H63D variants.",

			"HFE genotype does not establish that iron overload or clinical haemochromatosis is present.",

			"Unphased consumer genotype data cannot prove whether two different HFE variants occur in trans.",

			"The result must not directly alter longevity, mortality or financial-plan parameters.",
		],
	},

	"serpina1-common-genotype-v1": {
		modelId: "serpina1-common-genotype-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",
			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,
			displayResult: true,
			describeRelativeRisk: true,
			calculateAbsoluteRisk: false,
			useInLongevityModel: false,
			generatePlanningExposures: true,
			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Reference SERPINA1 S/Z consumer-genotype implementation pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific and clinical reference sources",

			notes: "This interpretation uses public SERPINA1 allele definitions and evidence rather than a proprietary scoring algorithm.",
		},

		limitations: [
			"Consumer raw genotype data is not equivalent to clinically confirmed molecular testing.",

			"The model assesses only the common SERPINA1 S and Z alleles.",

			"Other pathogenic SERPINA1 alleles are not excluded by a reference S/Z result.",

			"Genotype does not itself establish alpha-1 antitrypsin deficiency.",

			"The result must not directly alter longevity, mortality or financial-plan parameters.",
		],
	},

	"mcm6-lactase-persistence-v1": {
		modelId: "mcm6-lactase-persistence-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_trait_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",
			release: "development",
		},

		confirmationRequirement: "none",

		permissions: {
			calculateResult: true,
			displayResult: true,

			describeRelativeRisk: false,
			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			/*
			 * This is an engaging personal characteristic,
			 * not a financial-planning exposure.
			 */
			generatePlanningExposures: false,

			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Consumer-facing lactase persistence interpretation pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific and clinical reference sources",

			notes: "This interpretation uses public rs4988235 evidence and does not implement a proprietary scoring algorithm.",
		},

		limitations: [
			"rs4988235 is most informative for lactase persistence in European-ancestry populations.",

			"Other lactase-persistence variants are not assessed.",

			"Genotype does not determine whether a person experiences gastrointestinal symptoms after consuming lactose.",

			"The result must not alter financial, longevity or mortality assumptions.",
		],
	},

	"cyp1a2-caffeine-metabolism-v1": {
		modelId: "cyp1a2-caffeine-metabolism-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_trait_variant",

		evidenceStrength: "strong",

		lifecycle: {
			implementation: "implemented",
			release: "development",
		},

		confirmationRequirement: "none",

		permissions: {
			calculateResult: true,
			displayResult: true,

			describeRelativeRisk: false,
			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			generatePlanningExposures: false,

			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Consumer-facing CYP1A2 caffeine-metabolism interpretation pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific literature",

			notes: "This interpretation uses public rs762551 evidence and does not implement a proprietary scoring algorithm.",
		},

		limitations: [
			"CYP1A2 genotype does not fully determine caffeine response or habitual caffeine use.",

			"Environmental and lifestyle factors can materially change CYP1A2 activity.",

			"The result must not alter financial, mortality or longevity assumptions.",
		],
	},

	"actn3-muscle-performance-v1": {
		modelId: "actn3-muscle-performance-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_trait_variant",

		evidenceStrength: "strong",

		lifecycle: {
			implementation: "implemented",
			release: "development",
		},

		confirmationRequirement: "none",

		permissions: {
			calculateResult: true,
			displayResult: true,

			describeRelativeRisk: false,
			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			generatePlanningExposures: false,

			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Consumer-facing ACTN3 R577X performance-trait interpretation pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific literature",

			notes: "This interpretation uses public ACTN3 rs1815739 evidence and does not implement a proprietary scoring algorithm.",
		},

		limitations: [
			"ACTN3 genotype does not determine athletic ability.",

			"Observed population associations should not be interpreted as a prescription for a specific sport or training program.",

			"The result must not alter financial, mortality or longevity assumptions.",
		],
	},

	"tas2r38-bitter-taste-v1": {
		modelId: "tas2r38-bitter-taste-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_trait_variant",

		evidenceStrength: "strong",

		lifecycle: {
			implementation: "implemented",
			release: "development",
		},

		confirmationRequirement: "none",

		permissions: {
			calculateResult: true,
			displayResult: true,

			describeRelativeRisk: false,
			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			generatePlanningExposures: false,

			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Consumer-facing TAS2R38 PAV/AVI bitter-taste interpretation pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific literature",

			notes: "This interpretation uses public TAS2R38 haplotype evidence and no proprietary scoring algorithm.",
		},

		limitations: [
			"The model primarily characterises sensitivity to PTC and PROP bitterness rather than all bitter foods.",

			"Rare TAS2R38 haplotypes are not fully characterised by the common PAV/AVI framework.",

			"Unphased consumer genotype data may prevent reliable diplotype assignment.",

			"The result must not alter financial, mortality or longevity assumptions.",
		],
	},

	"adh1b-alcohol-metabolism-v1": {
		modelId: "adh1b-alcohol-metabolism-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_trait_variant",

		evidenceStrength: "strong",

		lifecycle: {
			implementation: "implemented",
			release: "development",
		},

		confirmationRequirement: "none",

		permissions: {
			calculateResult: true,
			displayResult: true,

			describeRelativeRisk: false,
			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			generatePlanningExposures: false,

			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Consumer-facing ADH1B alcohol-metabolism interpretation pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific literature",

			notes: "This interpretation uses public ADH1B rs1229984 evidence and does not implement a proprietary scoring algorithm.",
		},

		limitations: [
			"ADH1B genotype does not determine alcohol tolerance or drinking behaviour.",

			"Alcohol flushing should not be inferred from ADH1B alone.",

			"Environmental, behavioural and other genetic factors materially influence alcohol response.",

			"The result must not alter financial, mortality or longevity assumptions.",
		],
	},

	"aldh2-alcohol-response-v1": {
		modelId: "aldh2-alcohol-response-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_trait_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",
			release: "development",
		},

		confirmationRequirement: "none",

		permissions: {
			calculateResult: true,
			displayResult: true,

			describeRelativeRisk: false,
			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			generatePlanningExposures: false,

			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Consumer-facing ALDH2 rs671 alcohol-response interpretation pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific literature",

			notes: "This interpretation uses public ALDH2 rs671 evidence and does not implement a proprietary scoring algorithm.",
		},

		limitations: [
			"ALDH2 genotype does not determine drinking behaviour or an individual's complete alcohol response.",

			"The rs671 A allele substantially reduces acetaldehyde clearance but its phenotypic effects vary.",

			"The finding must not be interpreted as recommending alcohol consumption or abstinence.",

			"The result must not alter financial, mortality or longevity assumptions.",
		],
	},

	"lpa-cardiovascular-risk-v1": {
		modelId: "lpa-cardiovascular-risk-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",

			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,

			displayResult: true,

			describeRelativeRisk: true,

			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			/*
			 * An elevated finding may justify offering
			 * planning stress tests.
			 */
			generatePlanningExposures: true,

			/*
			 * Genetics must never silently change
			 * financial assumptions.
			 */
			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "LPA susceptibility model pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific literature",

			notes: "This implementation uses public variant definitions and published association evidence rather than a proprietary cardiovascular-risk algorithm.",
		},

		limitations: [
			"These variants are susceptibility markers and do not diagnose elevated lipoprotein(a) or coronary artery disease.",

			"Measured lipoprotein(a) should not be replaced by genotype-based inference.",

			"The model must not calculate personal absolute cardiovascular risk.",

			"The result must not directly alter mortality, retirement-age or financial assumptions.",

			"Planning relevance should be expressed through optional stress-test scenarios only.",
		],
	},

	"amd-common-susceptibility-v1": {
		modelId: "amd-common-susceptibility-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",
			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,
			displayResult: true,

			describeRelativeRisk: true,
			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			generatePlanningExposures: true,

			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "AMD susceptibility model pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific literature",

			notes: "This implementation uses public CFH and ARMS2 variant evidence and does not implement a proprietary AMD-risk algorithm.",
		},

		limitations: [
			"These variants are susceptibility markers and do not diagnose age-related macular degeneration.",

			"The model must not calculate personal absolute AMD risk.",

			"Age, smoking, ocular examination findings and other genetic factors remain important determinants of AMD risk.",

			"The result must not directly alter retirement, mortality, spending or care assumptions.",

			"Planning relevance should be expressed only through optional resilience scenarios.",
		],
	},

	"tcf7l2-type-2-diabetes-v1": {
		modelId: "tcf7l2-type-2-diabetes-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",

			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,

			displayResult: true,

			describeRelativeRisk: true,

			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			generatePlanningExposures: true,

			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "TCF7L2 type-2-diabetes susceptibility model pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public scientific literature",

			notes: "This implementation uses public rs7903146 association evidence and does not implement a proprietary diabetes-risk algorithm.",
		},

		limitations: [
			"TCF7L2 rs7903146 is a susceptibility marker and does not diagnose type 2 diabetes.",

			"The model must not calculate personal absolute diabetes risk from genotype alone.",

			"Clinical and lifestyle factors remain important determinants of type 2 diabetes risk.",

			"The result must not directly alter financial, mortality, retirement-age or longevity assumptions.",

			"Planning relevance should be expressed only through optional resilience scenarios.",
		],
	},

	"lrrk2-g2019s-parkinson-v1": {
		modelId: "lrrk2-g2019s-parkinson-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",

			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,

			displayResult: true,

			describeRelativeRisk: false,

			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			/*
			 * The model is capable of producing planning
			 * exposures, but the planning bridge will require
			 * clinical confirmation first.
			 */
			generatePlanningExposures: true,

			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Clinically important LRRK2 G2019S interpretation pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "GeneReviews, ClinVar and public scientific literature",

			notes: "This implementation uses public variant definitions and clinical evidence rather than a proprietary Parkinson disease risk algorithm.",
		},

		limitations: [
			"LRRK2 p.Gly2019Ser is pathogenic but incompletely penetrant.",

			"Consumer raw genotype data requires independent clinical confirmation before medical or financial-planning action.",

			"The model must not calculate personal absolute Parkinson disease risk.",

			"The result must not alter survival, longevity, retirement-age or financial assumptions.",

			"Planning scenarios may only be offered after an appropriate confirmation gate.",
		],
	},

	"ttr-v142i-amyloidosis-v1": {
		modelId: "ttr-v142i-amyloidosis-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",

			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,
			displayResult: true,
			describeRelativeRisk: false,
			calculateAbsoluteRisk: false,
			useInLongevityModel: false,
			generatePlanningExposures: true,
			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "TTR V142I model pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public clinical and scientific sources",
		},

		limitations: [
			"Consumer raw genotype data requires clinical confirmation before action.",

			"The result must not automatically alter mortality, longevity or financial assumptions.",
		],
	},

	"apob-r3527q-fh-v1": {
		modelId: "apob-r3527q-fh-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",

			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,
			displayResult: true,
			describeRelativeRisk: false,
			calculateAbsoluteRisk: false,
			useInLongevityModel: false,
			generatePlanningExposures: true,
			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "APOB R3527Q model pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public clinical and scientific sources",
		},

		limitations: [
			"This model tests one APOB pathogenic variant and does not exclude familial hypercholesterolaemia.",

			"Consumer raw genotype data requires clinical confirmation before action.",

			"The result must not automatically alter mortality, retirement or financial assumptions.",
		],
	},

	"f2-g20210a-thrombophilia-v1": {
		modelId: "f2-g20210a-thrombophilia-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",

			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,
			displayResult: true,
			describeRelativeRisk: true,
			calculateAbsoluteRisk: false,
			useInLongevityModel: false,
			generatePlanningExposures: true,
			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "F2 G20210A model pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "Public clinical and scientific sources",
		},

		limitations: [
			"The variant indicates thrombosis susceptibility rather than certainty of a thrombotic event.",

			"Consumer raw genotype data requires clinical confirmation before action.",

			"The result must not automatically alter financial assumptions.",
		],
	},

	"mutyh-selected-variants-v1": {
		modelId: "mutyh-selected-variants-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",

			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,

			displayResult: true,

			describeRelativeRisk: false,

			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			generatePlanningExposures: true,

			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Selected-variant MUTYH model pending formal Bioanalytix scientific review and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "ClinVar, GeneReviews and public scientific literature",
		},

		limitations: [
			"This model assesses only two common pathogenic MUTYH variants.",

			"A negative selected-variant result does not exclude other pathogenic MUTYH variants.",

			"A single pathogenic variant generally represents carrier status rather than MUTYH-associated polyposis.",

			"Clinical confirmation is required before medical or financial-planning action.",

			"The result must not directly alter mortality, retirement-age or financial assumptions.",
		],
	},

	"brca-selected-substitution-variants-v1": {
		modelId: "brca-selected-substitution-variants-v1",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		lifecycle: {
			implementation: "implemented",

			release: "development",
		},

		confirmationRequirement: "required_before_medical_action",

		permissions: {
			calculateResult: true,

			displayResult: true,

			describeRelativeRisk: false,

			calculateAbsoluteRisk: false,

			useInLongevityModel: false,

			generatePlanningExposures: true,

			modifyFinancialParameters: false,
		},

		review: {
			status: "pending",

			notes: "Selected-substitution BRCA1/BRCA2 model pending formal Bioanalytix scientific review, parser validation and production-release approval.",
		},

		licensing: {
			status: "not_applicable",

			source: "ClinVar, FDA-authorized selected-variant definitions and public scientific sources",

			notes: "Bioanalytix currently evaluates only a deliberately limited set of selected pathogenic BRCA substitutions. Expansion requires variant-level scientific and analytical review.",
		},

		limitations: [
			"This model is not a comprehensive BRCA1 or BRCA2 genetic test.",

			"A result in which none of the selected variants is identified must not be described as BRCA-negative.",

			"Thousands of other pathogenic BRCA1 and BRCA2 variants are outside the scope of this model.",

			"The initial Bioanalytix v1 implementation is deliberately limited to selected substitution variants supported by the current consumer-genotype parser.",

			"Consumer raw genotype findings require independent clinical confirmation before medical or financial-planning action.",

			"The result must not directly alter mortality, longevity, retirement-age or financial assumptions.",
		],
	},
};

export function getModelPolicy(modelId: string): ModelGovernance | undefined {
	return MODEL_POLICIES[modelId];
}

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
};

export function getModelPolicy(modelId: string): ModelGovernance | undefined {
	return MODEL_POLICIES[modelId];
}

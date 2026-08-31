import type { EvidenceClass, EvidenceStrength, InterpretationStatus } from "./types";

export type ConfirmationRequirement =
	| "none"
	| "recommended"
	| "required_before_medical_action"
	| "required_before_display";

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
	reviewed: boolean;
	reviewer?: string;
	reviewedAt?: string;
	nextReviewAt?: string;
}

export interface LicensingProvenance {
	status: "permitted" | "restricted" | "unknown";

	source?: string;
	notes?: string;
}

export interface ModelGovernance {
	modelId: string;
	modelVersion: string;

	evidenceClass: EvidenceClass;
	evidenceStrength: EvidenceStrength;
	status: InterpretationStatus;

	confirmationRequirement: ConfirmationRequirement;

	commercialUsePermitted: boolean;

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
		status: "approved",

		confirmationRequirement: "required_before_medical_action",

		commercialUsePermitted: true,

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
			reviewed: false,
		},

		licensing: {
			status: "permitted",
			source: "Publicly available scientific evidence and clinical reference sources",
			notes: "No third-party proprietary scoring model is required for this interpretation.",
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
		status: "approved",

		confirmationRequirement: "required_before_medical_action",

		commercialUsePermitted: true,

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
			reviewed: false,
		},

		licensing: {
			status: "permitted",
			source: "Publicly available scientific evidence and clinical reference sources",
			notes: "No third-party proprietary scoring model is required for this interpretation.",
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

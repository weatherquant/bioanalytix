import { getModelPolicy, type ScientificReviewStatus } from "./modelPolicy";
import { getGeneticsModel } from "./modelRegistry";
import type { EvidenceClass, EvidenceStrength } from "./types";

export type ScientificReviewCriterionStatus = "pass" | "fail" | "not_applicable";

export interface ScientificReviewCriterion {
	id:
		| "model_identity"
		| "evidence_sources"
		| "analytical_validity"
		| "biological_interpretation"
		| "population_applicability"
		| "effect_interpretation"
		| "limitations"
		| "consumer_data_boundary"
		| "clinical_boundary"
		| "planning_use"
		| "licensing_provenance";

	status: ScientificReviewCriterionStatus;

	rationale: string;
}

export interface ScientificReviewDossier {
	modelId: string;

	modelVersion: string;

	evidenceClass: EvidenceClass;

	evidenceStrength: EvidenceStrength;

	reviewer: string;

	reviewedAt: string;

	nextReviewAt?: string;

	criteria: ScientificReviewCriterion[];

	summary: string;
}

export interface ScientificReviewAssessment {
	valid: boolean;

	recommendedStatus: Extract<ScientificReviewStatus, "reviewed" | "approved" | "rejected">;

	reasons: string[];
}

const REQUIRED_CRITERIA: readonly ScientificReviewCriterion["id"][] = [
	"model_identity",
	"evidence_sources",
	"analytical_validity",
	"biological_interpretation",
	"population_applicability",
	"effect_interpretation",
	"limitations",
	"consumer_data_boundary",
	"clinical_boundary",
	"planning_use",
	"licensing_provenance",
];

export function assessScientificReviewDossier(
	dossier: ScientificReviewDossier,
): ScientificReviewAssessment {
	const reasons: string[] = [];

	const model = getGeneticsModel(dossier.modelId);

	if (!model) {
		return {
			valid: false,
			recommendedStatus: "rejected",
			reasons: [`Unknown genetics model: ${dossier.modelId}.`],
		};
	}

	const policy = getModelPolicy(dossier.modelId);

	if (!policy) {
		return {
			valid: false,
			recommendedStatus: "rejected",
			reasons: [`No governance policy exists for model ${dossier.modelId}.`],
		};
	}

	if (dossier.modelVersion !== model.version) {
		reasons.push(
			`Review version ${dossier.modelVersion} does not match registered model version ${model.version}.`,
		);
	}

	if (dossier.modelVersion !== policy.modelVersion) {
		reasons.push(
			`Review version ${dossier.modelVersion} does not match governance policy version ${policy.modelVersion}.`,
		);
	}

	if (dossier.evidenceClass !== model.evidenceClass) {
		reasons.push(
			`Review evidence class ${dossier.evidenceClass} does not match model evidence class ${model.evidenceClass}.`,
		);
	}

	if (dossier.evidenceClass !== policy.evidenceClass) {
		reasons.push(
			`Review evidence class ${dossier.evidenceClass} does not match governance evidence class ${policy.evidenceClass}.`,
		);
	}

	if (dossier.evidenceStrength !== policy.evidenceStrength) {
		reasons.push(
			`Review evidence strength ${dossier.evidenceStrength} does not match governance evidence strength ${policy.evidenceStrength}.`,
		);
	}

	if (!dossier.reviewer.trim()) {
		reasons.push("A scientific reviewer must be identified.");
	}

	if (!dossier.reviewedAt.trim()) {
		reasons.push("A scientific review date must be recorded.");
	}

	if (!dossier.summary.trim()) {
		reasons.push("A scientific review summary must be recorded.");
	}

	const criteriaById = new Map(dossier.criteria.map((criterion) => [criterion.id, criterion]));

	for (const requiredCriterion of REQUIRED_CRITERIA) {
		if (!criteriaById.has(requiredCriterion)) {
			reasons.push(`Missing scientific review criterion: ${requiredCriterion}.`);
		}
	}

	const failedCriteria = dossier.criteria.filter((criterion) => criterion.status === "fail");

	for (const criterion of dossier.criteria) {
		if (!criterion.rationale.trim()) {
			reasons.push(`Scientific review criterion ${criterion.id} requires a rationale.`);
		}
	}

	if (failedCriteria.length > 0) {
		for (const criterion of failedCriteria) {
			reasons.push(`Scientific review criterion failed: ${criterion.id}.`);
		}
	}

	if (reasons.length > 0) {
		return {
			valid: false,
			recommendedStatus: failedCriteria.length > 0 ? "rejected" : "reviewed",
			reasons,
		};
	}

	return {
		valid: true,
		recommendedStatus: "approved",
		reasons: [],
	};
}

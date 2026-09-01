import { describe, expect, it } from "vitest";

import {
	assessScientificReviewDossier,
	type ScientificReviewCriterion,
	type ScientificReviewDossier,
} from "./scientificReview";

function completeCriteria(): ScientificReviewCriterion[] {
	return [
		{
			id: "model_identity",
			status: "pass",
			rationale: "Model identity and version are documented.",
		},
		{
			id: "evidence_sources",
			status: "pass",
			rationale: "Supporting scientific sources have been reviewed.",
		},
		{
			id: "analytical_validity",
			status: "pass",
			rationale: "Technical interpretation requirements have been reviewed.",
		},
		{
			id: "biological_interpretation",
			status: "pass",
			rationale: "The biological interpretation is supported by the reviewed evidence.",
		},
		{
			id: "population_applicability",
			status: "pass",
			rationale: "Population applicability and limitations are documented.",
		},
		{
			id: "effect_interpretation",
			status: "pass",
			rationale:
				"Effect interpretation is evidence-bound and does not imply unsupported absolute risk.",
		},
		{
			id: "limitations",
			status: "pass",
			rationale: "Material limitations are documented.",
		},
		{
			id: "consumer_data_boundary",
			status: "pass",
			rationale: "Consumer raw-data limitations are explicitly documented.",
		},
		{
			id: "clinical_boundary",
			status: "pass",
			rationale: "Clinical confirmation and medical-action boundaries are documented.",
		},
		{
			id: "planning_use",
			status: "pass",
			rationale:
				"Planning use is limited to resilience scenarios and does not imply expected disease.",
		},
		{
			id: "licensing_provenance",
			status: "not_applicable",
			rationale:
				"The current implementation relies on public scientific references rather than a licensed proprietary scoring model.",
		},
	];
}

function factorVDossier(overrides: Partial<ScientificReviewDossier> = {}): ScientificReviewDossier {
	return {
		modelId: "f5-factor-v-leiden-vte",

		modelVersion: "1.0.0",

		evidenceClass: "established_risk_variant",

		evidenceStrength: "established",

		reviewer: "Scientific reviewer",

		reviewedAt: "2026-09-01",

		nextReviewAt: "2027-09-01",

		criteria: completeCriteria(),

		summary:
			"The model is suitable for qualified Bioanalytix interpretation and financial resilience planning subject to governance restrictions.",

		...overrides,
	};
}

describe("scientific review dossier", () => {
	it("approves a complete version-matched review dossier", () => {
		const assessment = assessScientificReviewDossier(factorVDossier());

		expect(assessment.valid).toBe(true);

		expect(assessment.recommendedStatus).toBe("approved");

		expect(assessment.reasons).toEqual([]);
	});

	it("fails closed for an unknown model", () => {
		const assessment = assessScientificReviewDossier(
			factorVDossier({
				modelId: "unknown-model",
			}),
		);

		expect(assessment.valid).toBe(false);

		expect(assessment.recommendedStatus).toBe("rejected");
	});

	it("does not allow approval of the wrong model version", () => {
		const assessment = assessScientificReviewDossier(
			factorVDossier({
				modelVersion: "2.0.0",
			}),
		);

		expect(assessment.valid).toBe(false);

		expect(assessment.reasons.some((reason) => reason.toLowerCase().includes("version"))).toBe(
			true,
		);
	});

	it("does not allow approval when a required criterion is missing", () => {
		const criteria = completeCriteria().filter(
			(criterion) => criterion.id !== "population_applicability",
		);

		const assessment = assessScientificReviewDossier(
			factorVDossier({
				criteria,
			}),
		);

		expect(assessment.valid).toBe(false);

		expect(assessment.recommendedStatus).toBe("reviewed");
	});

	it("rejects a dossier when a scientific criterion fails", () => {
		const criteria = completeCriteria().map((criterion) =>
			criterion.id === "biological_interpretation"
				? {
						...criterion,
						status: "fail" as const,
					}
				: criterion,
		);

		const assessment = assessScientificReviewDossier(
			factorVDossier({
				criteria,
			}),
		);

		expect(assessment.valid).toBe(false);

		expect(assessment.recommendedStatus).toBe("rejected");
	});

	it("requires rationale for every review criterion", () => {
		const criteria = completeCriteria().map((criterion) =>
			criterion.id === "limitations"
				? {
						...criterion,
						rationale: "",
					}
				: criterion,
		);

		const assessment = assessScientificReviewDossier(
			factorVDossier({
				criteria,
			}),
		);

		expect(assessment.valid).toBe(false);

		expect(assessment.reasons.some((reason) => reason.includes("limitations"))).toBe(true);
	});
});

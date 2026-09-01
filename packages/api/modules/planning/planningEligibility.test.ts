import { describe, expect, it } from "vitest";

import { interpretApoe } from "../genetics/evidence/apoeInterpretation";
import { interpretFactorVLeiden } from "../genetics/evidence/factorVLeidenInterpretation";
import type { BiologicalInsight } from "../genetics/evidence/insight";
import { createGenotypeObservation } from "../genetics/observations/createObservation";
import { assessPlanningEligibility } from "./planningEligibility";

function observation(rsid: string, genotype: string) {
	return createGenotypeObservation({
		rsid,
		genotype,
		sourceType: "consumer_raw_data",
		provider: "23andMe",
		fileFormat: "23andMe raw genotype data",
		genomeBuild: "unknown",
		strandOrientation: "unknown",
		confirmationStatus: "unconfirmed",
		parserVersion: "23andme-parser-v1",
	});
}

describe("genetics planning eligibility", () => {
	it("permits an elevated Factor V Leiden signal for resilience planning", () => {
		const insight = interpretFactorVLeiden(observation("rs6025", "AG"));

		const assessment = assessPlanningEligibility(insight);

		expect(assessment.eligible).toBe(true);
	});

	it("does not require clinical confirmation for an otherwise permitted planning scenario", () => {
		const insight = interpretFactorVLeiden(observation("rs6025", "AG"));

		const assessment = assessPlanningEligibility(insight);

		expect(assessment.eligible).toBe(true);

		expect(
			assessment.qualifications.some((qualification) =>
				qualification.toLowerCase().includes("unconfirmed"),
			),
		).toBe(true);
	});

	it("permits an elevated APOE susceptibility signal for resilience planning", () => {
		const insight = interpretApoe(observation("rs429358", "CT"), observation("rs7412", "CC"));

		const assessment = assessPlanningEligibility(insight);

		expect(assessment.eligible).toBe(true);
	});

	it("does not create genotype-attributed planning eligibility from a reference finding", () => {
		const insight = interpretFactorVLeiden(observation("rs6025", "GG"));

		const assessment = assessPlanningEligibility(insight);

		expect(assessment.eligible).toBe(false);

		expect(
			assessment.reasons.some((reason) => reason.toLowerCase().includes("reference")),
		).toBe(true);
	});

	it("does not create planning eligibility from an indeterminate finding", () => {
		const insight = interpretApoe(observation("rs429358", "CT"), observation("rs7412", "CT"));

		const assessment = assessPlanningEligibility(insight);

		expect(assessment.eligible).toBe(false);
	});

	it("fails closed when no governance policy exists", () => {
		const source = interpretFactorVLeiden(observation("rs6025", "AG"));

		const insight: BiologicalInsight = {
			...source,
			model: {
				...source.model,
				id: "unknown-test-model",
			},
		};

		const assessment = assessPlanningEligibility(insight);

		expect(assessment.eligible).toBe(false);

		expect(assessment.reasons.some((reason) => reason.includes("No governance policy"))).toBe(
			true,
		);
	});

	it("preserves the prohibition on personal absolute-risk conversion", () => {
		const insight = interpretApoe(observation("rs429358", "CT"), observation("rs7412", "CC"));

		const assessment = assessPlanningEligibility(insight);

		expect(
			assessment.qualifications.some((qualification) =>
				qualification.toLowerCase().includes("absolute disease probability"),
			),
		).toBe(true);
	});

	it("preserves the prohibition on deterministic financial parameter changes", () => {
		const insight = interpretFactorVLeiden(observation("rs6025", "AG"));

		const assessment = assessPlanningEligibility(insight);

		expect(
			assessment.qualifications.some((qualification) =>
				qualification.toLowerCase().includes("financial-plan parameters"),
			),
		).toBe(true);
	});

	it("allows a pending-review implemented model to exercise planning in development", () => {
		const insight = interpretFactorVLeiden(observation("rs6025", "AG"));

		const assessment = assessPlanningEligibility(insight, "development");

		expect(assessment.eligible).toBe(true);

		expect(
			assessment.qualifications.some((qualification) =>
				qualification.toLowerCase().includes("development only"),
			),
		).toBe(true);
	});

	it("blocks a pending-review development model from production planning use", () => {
		const insight = interpretFactorVLeiden(observation("rs6025", "AG"));

		const assessment = assessPlanningEligibility(insight, "production");

		expect(assessment.eligible).toBe(false);

		expect(
			assessment.reasons.some((reason) =>
				reason.toLowerCase().includes("scientific approval"),
			),
		).toBe(true);

		expect(
			assessment.reasons.some((reason) =>
				reason.toLowerCase().includes("production release"),
			),
		).toBe(true);
	});
});

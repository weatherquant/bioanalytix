import { describe, expect, it } from "vitest";

import { interpretApoe } from "../genetics/evidence/apoeInterpretation";
import { interpretFactorVLeiden } from "../genetics/evidence/factorVLeidenInterpretation";
import { createGenotypeObservation } from "../genetics/observations/createObservation";
import { biologicalInsightToPlanningExposures } from "./geneticsBridge";

function factorVObservation(genotype: string) {
	return createGenotypeObservation({
		rsid: "rs6025",
		genotype,
		sourceType: "consumer_raw_data",
		provider: "23andMe",
		parserVersion: "genetics-parser-v1",
	});
}

function apoeObservation(rsid: "rs429358" | "rs7412", genotype?: string) {
	return createGenotypeObservation({
		rsid,
		genotype,
		sourceType: "consumer_raw_data",
		provider: "23andMe",
		parserVersion: "genetics-parser-v1",
	});
}

describe("genetics to planning bridge", () => {
	it("creates qualified planning exposures for a Factor V Leiden carrier", () => {
		const insight = interpretFactorVLeiden(factorVObservation("AG"));

		const exposures = biologicalInsightToPlanningExposures(insight);

		expect(exposures.length).toBeGreaterThan(0);

		expect(exposures.every((exposure) => exposure.basis === "biological_insight")).toBe(true);

		expect(exposures.every((exposure) => exposure.qualifications.length > 0)).toBe(true);

		expect(
			exposures.every((exposure) => exposure.uncertainty?.evidenceStrength === "established"),
		).toBe(true);

		expect(
			exposures.every(
				(exposure) => exposure.uncertainty?.confirmationStatus === "unconfirmed",
			),
		).toBe(true);
	});

	it("does not attribute planning exposures to a Factor V Leiden reference genotype", () => {
		const insight = interpretFactorVLeiden(factorVObservation("GG"));

		expect(biologicalInsightToPlanningExposures(insight)).toEqual([]);
	});

	it("creates care and household resilience exposures for an APOE e3/e4 result", () => {
		const insight = interpretApoe(
			apoeObservation("rs429358", "CT"),
			apoeObservation("rs7412", "CC"),
		);

		const exposures = biologicalInsightToPlanningExposures(insight);

		expect(exposures.length).toBeGreaterThan(0);

		expect(exposures.map((exposure) => exposure.domain)).toContain("care_dependency");

		expect(exposures.map((exposure) => exposure.domain)).toContain("estate");

		expect(exposures.map((exposure) => exposure.domain)).toContain("partner_dependency");
	});

	it("does not attribute planning exposures to APOE e3/e3", () => {
		const insight = interpretApoe(
			apoeObservation("rs429358", "TT"),
			apoeObservation("rs7412", "CC"),
		);

		expect(biologicalInsightToPlanningExposures(insight)).toEqual([]);
	});

	it("does not attribute planning exposures to an unresolved APOE result", () => {
		const insight = interpretApoe(
			apoeObservation("rs429358", "CT"),
			apoeObservation("rs7412", undefined),
		);

		expect(biologicalInsightToPlanningExposures(insight)).toEqual([]);
	});

	it("carries explicit financial-use constraints on every biological exposure", () => {
		const insight = interpretFactorVLeiden(factorVObservation("AG"));

		const exposures = biologicalInsightToPlanningExposures(insight);

		for (const exposure of exposures) {
			expect(exposure.constraints.diagnosticInferencePermitted).toBe(false);

			expect(exposure.constraints.absoluteRiskConversionPermitted).toBe(false);

			expect(exposure.constraints.directLongevityAdjustmentPermitted).toBe(false);

			expect(exposure.constraints.deterministicFinancialAdjustmentPermitted).toBe(false);
		}
	});

	it("does not expose genotype-specific biological identifiers across the planning boundary", () => {
		const insight = interpretFactorVLeiden(factorVObservation("AG"));

		const exposures = biologicalInsightToPlanningExposures(insight);

		const serialized = JSON.stringify(exposures).toLowerCase();

		expect(serialized).not.toContain("rs6025");

		expect(serialized).not.toContain("factor-v-leiden-vte");

		expect(serialized).not.toContain('"genotype"');

		expect(serialized).not.toContain('"haplotype"');

		expect(serialized).not.toContain('"absoluterisk"');
	});

	it("fails closed for production planning while the model is not scientifically approved and released", () => {
		const insight = interpretFactorVLeiden(factorVObservation("AG"));

		const exposures = biologicalInsightToPlanningExposures(insight, "production");

		expect(exposures).toEqual([]);
	});
});

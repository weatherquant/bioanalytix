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
	it("creates planning exposures for a Factor V Leiden carrier", () => {
		const insight = interpretFactorVLeiden(factorVObservation("AG"));

		const exposures = biologicalInsightToPlanningExposures(insight);

		expect(exposures.length).toBeGreaterThan(0);

		expect(exposures.every((exposure) => exposure.basis === "biological_insight")).toBe(true);

		expect(exposures.every((exposure) => exposure.sourceInsightIds.includes(insight.id))).toBe(
			true,
		);
	});

	it("does not attribute planning exposures to a Factor V Leiden reference genotype", () => {
		const insight = interpretFactorVLeiden(factorVObservation("GG"));

		expect(biologicalInsightToPlanningExposures(insight)).toEqual([]);
	});

	it("creates planning exposures for an APOE e3/e4 result", () => {
		const insight = interpretApoe(
			apoeObservation("rs429358", "CT"),
			apoeObservation("rs7412", "CC"),
		);
	});

	it("does not attribute planning exposures to APOE e3/e3", () => {
		const insight = interpretApoe(
			apoeObservation("rs429358", "TT"),
			apoeObservation("rs7412", "CC"),
		);
	});

	it("does not attribute planning exposures to an unresolved APOE result", () => {
		const insight = interpretApoe(
			apoeObservation("rs429358", "CT"),
			apoeObservation("rs7412", undefined),
		);
	});
});

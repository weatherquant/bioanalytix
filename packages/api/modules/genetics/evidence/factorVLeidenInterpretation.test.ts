import { describe, expect, it } from "vitest";

import { createGenotypeObservation } from "../observations/createObservation";
import {
	classifyFactorVLeidenGenotype,
	interpretFactorVLeiden,
} from "./factorVLeidenInterpretation";

function observation(genotype: string) {
	return createGenotypeObservation({
		rsid: "rs6025",
		genotype,
		sourceType: "consumer_raw_data",
		provider: "23andMe",
		parserVersion: "genetics-parser-v1",
	});
}

describe("Factor V Leiden genotype classification", () => {
	it("classifies GG as non-carrier", () => {
		expect(classifyFactorVLeidenGenotype("GG")).toBe("non_carrier");
	});

	it("classifies AG as heterozygous", () => {
		expect(classifyFactorVLeidenGenotype("AG")).toBe("heterozygous");
	});

	it("classifies GA as heterozygous", () => {
		expect(classifyFactorVLeidenGenotype("GA")).toBe("heterozygous");
	});

	it("classifies AA as homozygous", () => {
		expect(classifyFactorVLeidenGenotype("AA")).toBe("homozygous");
	});

	it("returns unresolved for missing data", () => {
		expect(classifyFactorVLeidenGenotype(undefined)).toBe("unresolved");
	});

	it("does not call a non-carrier low risk", () => {
		const result = interpretFactorVLeiden(observation("GG"));

		expect(result.result.direction).toBe("reference");
	});

	it("marks consumer genotype results as unconfirmed", () => {
		const result = interpretFactorVLeiden(observation("AG"));

		expect(result.input.confirmationStatus).toBe("unconfirmed");
	});

	it("refuses to interpret an observation from the wrong locus", () => {
		const wrongObservation = createGenotypeObservation({
			rsid: "rs429358",
			genotype: "AG",
			sourceType: "consumer_raw_data",
			parserVersion: "genetics-parser-v1",
		});

		const result = interpretFactorVLeiden(wrongObservation);

		expect(result.result.direction).toBe("indeterminate");
		expect(result.confidence.genotypeCoverage).toBe(0);
	});
});

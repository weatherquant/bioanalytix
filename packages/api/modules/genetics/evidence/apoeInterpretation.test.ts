import { describe, expect, it } from "vitest";

import { createGenotypeObservation } from "../observations/createObservation";
import { classifyApoeDiplotype, interpretApoe } from "./apoeInterpretation";

function observation(rsid: "rs429358" | "rs7412" | "rs6025", genotype?: string) {
	return createGenotypeObservation({
		rsid,
		genotype,
		sourceType: "consumer_raw_data",
		provider: "23andMe",
		parserVersion: "genetics-parser-v1",
	});
}

describe("APOE diplotype classification", () => {
	it("classifies e2/e2", () => {
		expect(classifyApoeDiplotype("TT", "TT")).toEqual({
			status: "resolved",
			diplotype: "e2/e2",
		});
	});

	it("classifies e2/e3", () => {
		expect(classifyApoeDiplotype("TT", "CT")).toEqual({
			status: "resolved",
			diplotype: "e2/e3",
		});
	});

	it("classifies e3/e3", () => {
		expect(classifyApoeDiplotype("TT", "CC")).toEqual({
			status: "resolved",
			diplotype: "e3/e3",
		});
	});

	it("classifies e3/e4", () => {
		expect(classifyApoeDiplotype("CT", "CC")).toEqual({
			status: "resolved",
			diplotype: "e3/e4",
		});
	});

	it("classifies e4/e4", () => {
		expect(classifyApoeDiplotype("CC", "CC")).toEqual({
			status: "resolved",
			diplotype: "e4/e4",
		});
	});

	it("does not infer APOE from one SNP", () => {
		const classification = classifyApoeDiplotype("CT", undefined);

		expect(classification.status).toBe("unresolved");
	});

	it("flags unphased CT/CT as ambiguous", () => {
		const classification = classifyApoeDiplotype("CT", "CT");

		expect(classification.status).toBe("ambiguous");
	});

	it("does not describe e3/e3 as low risk", () => {
		const insight = interpretApoe(observation("rs429358", "TT"), observation("rs7412", "CC"));

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.direction).not.toBe("lower");
	});

	it("identifies e3/e4 as higher susceptibility", () => {
		const insight = interpretApoe(observation("rs429358", "CT"), observation("rs7412", "CC"));

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.haplotype).toBe("e3/e4");
	});

	it("identifies e4/e4 as higher susceptibility", () => {
		const insight = interpretApoe(observation("rs429358", "CC"), observation("rs7412", "CC"));

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.haplotype).toBe("e4/e4");
	});

	it("does not turn APOE into an absolute disease probability", () => {
		const insight = interpretApoe(observation("rs429358", "CT"), observation("rs7412", "CC"));

		expect("absoluteRisk" in insight.result).toBe(false);
	});

	it("marks consumer APOE observations as unconfirmed", () => {
		const insight = interpretApoe(observation("rs429358", "CT"), observation("rs7412", "CC"));

		expect(insight.input.confirmationStatus).toBe("unconfirmed");
	});

	it("does not interpret APOE when the loci are swapped", () => {
		const insight = interpretApoe(observation("rs7412", "CT"), observation("rs429358", "CC"));

		expect(insight.result.direction).toBe("indeterminate");

		expect(insight.confidence.genotypeCoverage).toBe(0);
	});

	it("does not interpret APOE with an unrelated locus", () => {
		const insight = interpretApoe(observation("rs429358", "CT"), observation("rs6025", "CC"));

		expect(insight.result.direction).toBe("indeterminate");

		expect(insight.confidence.genotypeCoverage).toBe(0);
	});

	it("preserves ambiguity for unphased CT CT observations", () => {
		const insight = interpretApoe(observation("rs429358", "CT"), observation("rs7412", "CT"));

		expect(insight.result.direction).toBe("indeterminate");

		expect(insight.confidence.genotypeCoverage).toBe(0);
	});

	it("does not interpret APOE when a required genotype is missing", () => {
		const insight = interpretApoe(
			observation("rs429358", "CT"),
			observation("rs7412", undefined),
		);

		expect(insight.result.direction).toBe("indeterminate");

		expect(insight.confidence.genotypeCoverage).toBe(0);
	});
});

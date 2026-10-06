import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import { classifyTcf7l2Diabetes, interpretTcf7l2Diabetes } from "./tcf7l2DiabetesInterpretation";

function observation(genotype: string): GenotypeObservation {
	return {
		rsid: "rs7903146",

		genotype,

		genomeBuild: "GRCh37",

		callStatus: "called",

		source: {
			type: "consumer_genotype",

			provider: "23andMe",
		},

		strandOrientation: "unknown",
		confirmationStatus: "unconfirmed",

		provenance: {
		parserVersion: "test",
		},
		limitations: [],
	};
}

describe("TCF7L2 type 2 diabetes interpretation", () => {
	it("identifies CC as reference", () => {
		expect(classifyTcf7l2Diabetes("CC")).toBe("reference");
	});

	it("identifies CT as one risk allele", () => {
		expect(classifyTcf7l2Diabetes("CT")).toBe("one_risk_allele");
	});

	it("normalizes reversed heterozygous order", () => {
		expect(classifyTcf7l2Diabetes("TC")).toBe("one_risk_allele");
	});

	it("identifies TT as two risk alleles", () => {
		expect(classifyTcf7l2Diabetes("TT")).toBe("two_risk_alleles");
	});

	it("returns unresolved for unusable genotype", () => {
		expect(classifyTcf7l2Diabetes("--")).toBe("unresolved");
	});

	it("returns reference direction for CC", () => {
		const insight = interpretTcf7l2Diabetes(observation("CC"));

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("reference");
	});

	it("returns higher susceptibility for CT", () => {
		const insight = interpretTcf7l2Diabetes(observation("CT"));

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("one_risk_allele");

		expect(insight.confidence.evidenceStrength).toBe("established");
	});

	it("returns higher susceptibility for TT", () => {
		const insight = interpretTcf7l2Diabetes(observation("TT"));

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("two_risk_alleles");
	});

	it("returns indeterminate for unresolved genotype", () => {
		const insight = interpretTcf7l2Diabetes(observation("--"));

		expect(insight.result.direction).toBe("indeterminate");
	});
});


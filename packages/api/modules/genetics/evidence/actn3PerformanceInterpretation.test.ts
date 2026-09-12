import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import {
	classifyActn3Performance,
	interpretActn3Performance,
} from "./actn3PerformanceInterpretation";

function observation(genotype: string): GenotypeObservation {
	return {
		rsid: "rs1815739",

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

describe("ACTN3 muscle performance interpretation", () => {
	it("identifies CC as RR", () => {
		expect(classifyActn3Performance("CC")).toBe("rr");
	});

	it("identifies CT as RX", () => {
		expect(classifyActn3Performance("CT")).toBe("rx");
	});

	it("identifies TT as XX", () => {
		expect(classifyActn3Performance("TT")).toBe("xx");
	});

	it("normalizes reversed heterozygous order", () => {
		expect(classifyActn3Performance("TC")).toBe("rx");
	});

	it("returns unresolved for unusable genotype", () => {
		expect(classifyActn3Performance("--")).toBe("unresolved");
	});

	it("returns an informational RR phenotype", () => {
		const insight = interpretActn3Performance(observation("CC"));

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("rr");

		expect(insight.model.evidenceClass).toBe("established_trait_variant");
	});

	it("returns an informational XX phenotype", () => {
		const insight = interpretActn3Performance(observation("TT"));

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("xx");
	});

	it("returns indeterminate for unresolved genotype data", () => {
		const insight = interpretActn3Performance(observation("--"));

		expect(insight.result.direction).toBe("indeterminate");
	});
});


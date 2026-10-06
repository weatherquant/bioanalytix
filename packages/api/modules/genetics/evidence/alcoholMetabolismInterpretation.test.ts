import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import {
	classifyAlcoholMetabolism,
	interpretAlcoholMetabolism,
} from "./alcoholMetabolismInterpretation";

function observation(genotype: string): GenotypeObservation {
	return {
		rsid: "rs1229984",

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

describe("ADH1B alcohol metabolism interpretation", () => {
	it("identifies AA as faster ethanol oxidation tendency", () => {
		expect(classifyAlcoholMetabolism("AA")).toBe("faster");
	});

	it("identifies AG as intermediate", () => {
		expect(classifyAlcoholMetabolism("AG")).toBe("intermediate");
	});

	it("normalizes reversed heterozygous order", () => {
		expect(classifyAlcoholMetabolism("GA")).toBe("intermediate");
	});

	it("identifies GG as the common activity pattern", () => {
		expect(classifyAlcoholMetabolism("GG")).toBe("common");
	});

	it("returns unresolved for unusable genotype data", () => {
		expect(classifyAlcoholMetabolism("--")).toBe("unresolved");
	});

	it("returns an informational faster-metabolism phenotype", () => {
		const insight = interpretAlcoholMetabolism(observation("AA"));

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("faster");

		expect(insight.model.evidenceClass).toBe("established_trait_variant");
	});

	it("returns an informational common phenotype", () => {
		const insight = interpretAlcoholMetabolism(observation("GG"));

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("common");
	});

	it("returns indeterminate for unresolved genotype data", () => {
		const insight = interpretAlcoholMetabolism(observation("--"));

		expect(insight.result.direction).toBe("indeterminate");
	});
});


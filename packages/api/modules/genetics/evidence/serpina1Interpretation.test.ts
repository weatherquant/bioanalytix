import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import { classifySerpina1Genotype, interpretSerpina1 } from "./serpina1Interpretation";

function observation(rsid: string, genotype: string): GenotypeObservation {
	return {
		rsid,
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

describe("SERPINA1 genotype interpretation", () => {
	it("identifies ZZ genotype", () => {
		expect(classifySerpina1Genotype("AA", "AA")).toBe("zz");
	});

	it("identifies SZ genotype", () => {
		expect(classifySerpina1Genotype("AG", "AT")).toBe("sz");
	});

	it("identifies SS genotype", () => {
		expect(classifySerpina1Genotype("GG", "TT")).toBe("ss");
	});

	it("identifies MZ carrier state", () => {
		expect(classifySerpina1Genotype("AG", "AA")).toBe("mz");
	});

	it("identifies MS carrier state", () => {
		expect(classifySerpina1Genotype("GG", "AT")).toBe("ms");
	});

	it("identifies the reference pattern", () => {
		expect(classifySerpina1Genotype("GG", "AA")).toBe("reference");
	});

	it("returns unresolved when one genotype is missing", () => {
		expect(classifySerpina1Genotype(undefined, "AA")).toBe("unresolved");
	});

	it("returns higher susceptibility for ZZ", () => {
		const insight = interpretSerpina1(
			observation("rs28929474", "AA"),

			observation("rs17580", "AA"),
		);

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("zz");

		expect(insight.confidence.evidenceStrength).toBe("established");
	});

	it("returns higher susceptibility for SZ", () => {
		const insight = interpretSerpina1(
			observation("rs28929474", "AG"),

			observation("rs17580", "AT"),
		);

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("sz");
	});

	it("does not classify MZ as an elevated disease finding", () => {
		const insight = interpretSerpina1(
			observation("rs28929474", "AG"),

			observation("rs17580", "AA"),
		);

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("mz");
	});

	it("returns reference for the common reference pattern", () => {
		const insight = interpretSerpina1(
			observation("rs28929474", "GG"),

			observation("rs17580", "AA"),
		);

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("reference");
	});

	it("returns indeterminate when genotype data cannot be interpreted", () => {
		const insight = interpretSerpina1(
			observation("rs28929474", "--"),

			observation("rs17580", "AA"),
		);

		expect(insight.result.direction).toBe("indeterminate");

		expect(insight.result.genotype).toBe("unresolved");
	});
});

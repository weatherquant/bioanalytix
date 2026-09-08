import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import { classifyHfeGenotype, interpretHfe } from "./hfeInterpretation";

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

		confirmationStatus: "unconfirmed",

		limitations: [],
	};
}

describe("HFE genotype interpretation", () => {
	it("identifies C282Y homozygosity", () => {
		expect(classifyHfeGenotype("AA", "CC")).toBe("c282y_homozygous");
	});

	it("identifies C282Y and H63D double heterozygosity", () => {
		expect(classifyHfeGenotype("AG", "CG")).toBe("c282y_h63d_double_heterozygous");
	});

	it("identifies C282Y carrier state", () => {
		expect(classifyHfeGenotype("AG", "CC")).toBe("c282y_heterozygous");
	});

	it("identifies H63D homozygosity", () => {
		expect(classifyHfeGenotype("GG", "GG")).toBe("h63d_homozygous");
	});

	it("identifies H63D carrier state", () => {
		expect(classifyHfeGenotype("GG", "CG")).toBe("h63d_heterozygous");
	});

	it("identifies the two-variant reference pattern", () => {
		expect(classifyHfeGenotype("GG", "CC")).toBe("reference");
	});

	it("returns higher susceptibility for C282Y homozygosity", () => {
		const insight = interpretHfe(
			observation("rs1800562", "AA"),

			observation("rs1799945", "CC"),
		);

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("c282y_homozygous");

		expect(insight.confidence.evidenceStrength).toBe("established");
	});

	it("does not classify a simple C282Y carrier as an elevated disease finding", () => {
		const insight = interpretHfe(
			observation("rs1800562", "AG"),

			observation("rs1799945", "CC"),
		);

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("c282y_heterozygous");
	});

	it("returns indeterminate when genotype data cannot be interpreted", () => {
		const insight = interpretHfe(
			observation("rs1800562", "--"),

			observation("rs1799945", "CC"),
		);

		expect(insight.result.direction).toBe("indeterminate");
	});
});

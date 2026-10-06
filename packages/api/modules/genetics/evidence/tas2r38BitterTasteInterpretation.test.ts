import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import {
	classifyTas2r38BitterTaste,
	interpretTas2r38BitterTaste,
} from "./tas2r38BitterTasteInterpretation";

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

describe("TAS2R38 bitter taste interpretation", () => {
	it("identifies common PAV/PAV pattern", () => {
		expect(classifyTas2r38BitterTaste("CC", "GG", "CC")).toBe("pav_pav");
	});

	it("identifies common PAV/AVI pattern", () => {
		expect(classifyTas2r38BitterTaste("CG", "AG", "CT")).toBe("pav_avi");
	});

	it("identifies common AVI/AVI pattern", () => {
		expect(classifyTas2r38BitterTaste("GG", "AA", "TT")).toBe("avi_avi");
	});

	it("normalizes reversed heterozygous allele order", () => {
		expect(classifyTas2r38BitterTaste("GC", "GA", "TC")).toBe("pav_avi");
	});

	it("leaves uncommon haplotype patterns unresolved", () => {
		expect(classifyTas2r38BitterTaste("CC", "AG", "CT")).toBe("unresolved");
	});

	it("returns unresolved for unusable genotype input", () => {
		expect(classifyTas2r38BitterTaste("--", "GG", "CC")).toBe("unresolved");
	});

	it("returns an informational PAV/PAV phenotype", () => {
		const insight = interpretTas2r38BitterTaste(
			observation("rs713598", "CC"),

			observation("rs1726866", "GG"),

			observation("rs10246939", "CC"),
		);

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("pav_pav");

		expect(insight.model.evidenceClass).toBe("established_trait_variant");
	});

	it("returns an informational AVI/AVI phenotype", () => {
		const insight = interpretTas2r38BitterTaste(
			observation("rs713598", "GG"),

			observation("rs1726866", "AA"),

			observation("rs10246939", "TT"),
		);

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("avi_avi");
	});

	it("returns indeterminate when diplotype cannot be resolved", () => {
		const insight = interpretTas2r38BitterTaste(
			observation("rs713598", "CC"),

			observation("rs1726866", "AG"),

			observation("rs10246939", "CT"),
		);

		expect(insight.result.direction).toBe("indeterminate");

		expect(insight.result.genotype).toBe("unresolved");
	});
});


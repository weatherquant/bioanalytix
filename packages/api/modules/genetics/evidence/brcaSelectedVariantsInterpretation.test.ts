import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import {
	classifyBrcaSelectedVariants,
	interpretBrcaSelectedVariants,
} from "./brcaSelectedVariantsInterpretation";

function observation(
	rsid: string,
	genotype: string,
	confirmationStatus: "confirmed" | "unconfirmed" = "unconfirmed",
): GenotypeObservation {
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

		confirmationStatus,

		provenance: {
			parserVersion: "test",
		},

		limitations: [],
	};
}

describe("BRCA selected substitution-variant interpretation", () => {
	it("identifies no selected pathogenic variant", () => {
		expect(classifyBrcaSelectedVariants("GG", "CC", "CC")).toBe(
			"no_selected_variant_identified",
		);
	});

	it("identifies selected BRCA1 pathogenic heterozygosity", () => {
		expect(classifyBrcaSelectedVariants("AG", "CC", "CC")).toBe(
			"one_selected_pathogenic_variant",
		);
	});

	it("identifies selected BRCA2 Q2342X heterozygosity", () => {
		expect(classifyBrcaSelectedVariants("GG", "CT", "CC")).toBe(
			"one_selected_pathogenic_variant",
		);
	});

	it("identifies selected BRCA2 R2494X heterozygosity", () => {
		expect(classifyBrcaSelectedVariants("GG", "CC", "CT")).toBe(
			"one_selected_pathogenic_variant",
		);
	});

	it("identifies multiple selected pathogenic variant alleles", () => {
		expect(classifyBrcaSelectedVariants("AG", "CT", "CC")).toBe(
			"multiple_selected_pathogenic_variants",
		);
	});

	it("returns unresolved for incomplete genotype data", () => {
		expect(classifyBrcaSelectedVariants("--", "CC", "CC")).toBe("unresolved");
	});

	it("returns reference direction without claiming comprehensive BRCA negativity", () => {
		const insight = interpretBrcaSelectedVariants(
			observation("rs41293455", "GG"),

			observation("rs80358928", "CC"),

			observation("rs80358972", "CC"),
		);

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("no_selected_variant_identified");

		expect(insight.limitations.join(" ")).toContain("not a comprehensive BRCA");
	});

	it("returns higher direction when a selected pathogenic variant is identified", () => {
		const insight = interpretBrcaSelectedVariants(
			observation("rs41293455", "AG"),

			observation("rs80358928", "CC"),

			observation("rs80358972", "CC"),
		);

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("one_selected_pathogenic_variant");
	});

	it("retains unconfirmed status for consumer raw-data findings", () => {
		const insight = interpretBrcaSelectedVariants(
			observation("rs41293455", "AG"),

			observation("rs80358928", "CC"),

			observation("rs80358972", "CC"),
		);

		expect(insight.input.confirmationStatus).toBe("unconfirmed");
	});

	it("retains confirmed status only when every model observation is confirmed", () => {
		const insight = interpretBrcaSelectedVariants(
			observation("rs41293455", "AG", "confirmed"),

			observation("rs80358928", "CC", "confirmed"),

			observation("rs80358972", "CC", "confirmed"),
		);

		expect(insight.input.confirmationStatus).toBe("confirmed");
	});
});

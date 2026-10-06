import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import {
	classifyAmdSusceptibility,
	interpretAmdSusceptibility,
} from "./amdSusceptibilityInterpretation";

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

describe("AMD susceptibility interpretation", () => {
	it("identifies the reference pattern", () => {
		expect(classifyAmdSusceptibility("TT", "GG")).toBe("reference");
	});

	it("identifies one CFH risk allele", () => {
		expect(classifyAmdSusceptibility("CT", "GG")).toBe("one_risk_allele");
	});

	it("identifies one ARMS2 risk allele", () => {
		expect(classifyAmdSusceptibility("TT", "GT")).toBe("one_risk_allele");
	});

	it("identifies multiple risk alleles across the two loci", () => {
		expect(classifyAmdSusceptibility("CT", "GT")).toBe("multiple_risk_alleles");
	});

	it("identifies two CFH risk alleles", () => {
		expect(classifyAmdSusceptibility("CC", "GG")).toBe("multiple_risk_alleles");
	});

	it("normalizes reversed heterozygous allele order", () => {
		expect(classifyAmdSusceptibility("TC", "TG")).toBe("multiple_risk_alleles");
	});

	it("returns unresolved for unusable genotype input", () => {
		expect(classifyAmdSusceptibility("--", "GG")).toBe("unresolved");
	});

	it("returns reference direction for the reference pattern", () => {
		const insight = interpretAmdSusceptibility(
			observation("rs1061170", "TT"),

			observation("rs10490924", "GG"),
		);

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("reference");
	});

	it("returns higher susceptibility for one risk allele", () => {
		const insight = interpretAmdSusceptibility(
			observation("rs1061170", "CT"),

			observation("rs10490924", "GG"),
		);

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("one_risk_allele");

		expect(insight.confidence.evidenceStrength).toBe("established");
	});

	it("returns higher susceptibility for multiple risk alleles", () => {
		const insight = interpretAmdSusceptibility(
			observation("rs1061170", "CT"),

			observation("rs10490924", "GT"),
		);

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("multiple_risk_alleles");
	});

	it("returns indeterminate when the model cannot resolve", () => {
		const insight = interpretAmdSusceptibility(
			observation("rs1061170", "--"),

			observation("rs10490924", "GG"),
		);

		expect(insight.result.direction).toBe("indeterminate");
	});
});


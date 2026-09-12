import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import {
	classifyLpaCardiovascular,
	interpretLpaCardiovascular,
} from "./lpaCardiovascularInterpretation";

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

describe("LPA cardiovascular interpretation", () => {
	it("identifies reference pattern", () => {
		expect(classifyLpaCardiovascular("AA", "TT")).toBe("reference");
	});

	it("identifies one rs10455872 risk allele", () => {
		expect(classifyLpaCardiovascular("AG", "TT")).toBe("one_risk_allele");
	});

	it("identifies one rs3798220 risk allele", () => {
		expect(classifyLpaCardiovascular("AA", "CT")).toBe("one_risk_allele");
	});

	it("identifies multiple risk alleles across loci", () => {
		expect(classifyLpaCardiovascular("AG", "CT")).toBe("multiple_risk_alleles");
	});

	it("identifies multiple copies at one locus", () => {
		expect(classifyLpaCardiovascular("GG", "TT")).toBe("multiple_risk_alleles");
	});

	it("normalizes reversed heterozygous genotype order", () => {
		expect(classifyLpaCardiovascular("GA", "TC")).toBe("multiple_risk_alleles");
	});

	it("returns unresolved when genotype input is unusable", () => {
		expect(classifyLpaCardiovascular("--", "TT")).toBe("unresolved");
	});

	it("returns reference direction for the reference pattern", () => {
		const insight = interpretLpaCardiovascular(
			observation("rs10455872", "AA"),

			observation("rs3798220", "TT"),
		);

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("reference");
	});

	it("returns higher susceptibility when one risk allele is identified", () => {
		const insight = interpretLpaCardiovascular(
			observation("rs10455872", "AG"),

			observation("rs3798220", "TT"),
		);

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("one_risk_allele");

		expect(insight.confidence.evidenceStrength).toBe("established");
	});

	it("returns higher susceptibility for multiple risk alleles", () => {
		const insight = interpretLpaCardiovascular(
			observation("rs10455872", "AG"),

			observation("rs3798220", "CT"),
		);

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("multiple_risk_alleles");
	});

	it("returns indeterminate when the model cannot resolve", () => {
		const insight = interpretLpaCardiovascular(
			observation("rs10455872", "--"),

			observation("rs3798220", "TT"),
		);

		expect(insight.result.direction).toBe("indeterminate");
	});
});

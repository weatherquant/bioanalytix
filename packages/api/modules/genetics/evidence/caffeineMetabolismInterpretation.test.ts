import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import {
	classifyCaffeineMetabolism,
	interpretCaffeineMetabolism,
} from "./caffeineMetabolismInterpretation";

function observation(genotype: string): GenotypeObservation {
	return {
		rsid: "rs762551",

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

describe("CYP1A2 caffeine metabolism interpretation", () => {
	it("identifies AA as faster metabolism tendency", () => {
		expect(classifyCaffeineMetabolism("AA")).toBe("faster");
	});

	it("identifies AC as slower metabolism tendency", () => {
		expect(classifyCaffeineMetabolism("AC")).toBe("slower");
	});

	it("identifies CC as slower metabolism tendency", () => {
		expect(classifyCaffeineMetabolism("CC")).toBe("slower");
	});

	it("normalizes reversed heterozygous genotype order", () => {
		expect(classifyCaffeineMetabolism("CA")).toBe("slower");
	});

	it("returns unresolved for unusable genotype data", () => {
		expect(classifyCaffeineMetabolism("--")).toBe("unresolved");
	});

	it("returns an informational phenotype for faster metabolism", () => {
		const insight = interpretCaffeineMetabolism(observation("AA"));

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("faster");

		expect(insight.model.evidenceClass).toBe("established_trait_variant");
	});

	it("returns an informational phenotype for slower metabolism", () => {
		const insight = interpretCaffeineMetabolism(observation("AC"));

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("slower");
	});

	it("returns indeterminate for unresolved genotype data", () => {
		const insight = interpretCaffeineMetabolism(observation("--"));

		expect(insight.result.direction).toBe("indeterminate");
	});
});


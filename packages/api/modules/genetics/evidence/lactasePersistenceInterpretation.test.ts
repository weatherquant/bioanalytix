import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import {
	classifyLactasePersistence,
	interpretLactasePersistence,
} from "./lactasePersistenceInterpretation";

function observation(genotype: string): GenotypeObservation {
	return {
		rsid: "rs4988235",

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

describe("lactase persistence interpretation", () => {
	it("identifies CT as lactase persistent", () => {
		expect(classifyLactasePersistence("CT")).toBe("persistent");
	});

	it("identifies TT as lactase persistent", () => {
		expect(classifyLactasePersistence("TT")).toBe("persistent");
	});

	it("identifies CC as lactase non-persistent", () => {
		expect(classifyLactasePersistence("CC")).toBe("non_persistent");
	});

	it("normalizes reversed heterozygous genotype order", () => {
		expect(classifyLactasePersistence("TC")).toBe("persistent");
	});

	it("returns unresolved for unusable genotype data", () => {
		expect(classifyLactasePersistence("--")).toBe("unresolved");
	});

	it("returns an informational phenotype for lactase persistence", () => {
		const insight = interpretLactasePersistence(observation("CT"));

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("persistent");

		expect(insight.model.evidenceClass).toBe("established_trait_variant");
	});

	it("returns an informational phenotype for lactase non-persistence", () => {
		const insight = interpretLactasePersistence(observation("CC"));

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("non_persistent");
	});

	it("returns indeterminate for unresolved genotype data", () => {
		const insight = interpretLactasePersistence(observation("--"));

		expect(insight.result.direction).toBe("indeterminate");
	});
});


import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import {
	classifyAldh2AlcoholResponse,
	interpretAldh2AlcoholResponse,
} from "./aldh2AlcoholResponseInterpretation";

function observation(genotype: string): GenotypeObservation {
	return {
		rsid: "rs671",

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

describe("ALDH2 alcohol response interpretation", () => {
	it("identifies GG as typical acetaldehyde clearance", () => {
		expect(classifyAldh2AlcoholResponse("GG")).toBe("typical_clearance");
	});

	it("identifies AG as reduced acetaldehyde clearance", () => {
		expect(classifyAldh2AlcoholResponse("AG")).toBe("reduced_clearance");
	});

	it("normalizes reversed heterozygous order", () => {
		expect(classifyAldh2AlcoholResponse("GA")).toBe("reduced_clearance");
	});

	it("identifies AA as markedly reduced acetaldehyde clearance", () => {
		expect(classifyAldh2AlcoholResponse("AA")).toBe("markedly_reduced_clearance");
	});

	it("returns unresolved for unusable genotype data", () => {
		expect(classifyAldh2AlcoholResponse("--")).toBe("unresolved");
	});

	it("returns an informational typical-clearance phenotype", () => {
		const insight = interpretAldh2AlcoholResponse(observation("GG"));

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("typical_clearance");

		expect(insight.model.evidenceClass).toBe("established_trait_variant");
	});

	it("returns an informational reduced-clearance phenotype", () => {
		const insight = interpretAldh2AlcoholResponse(observation("AG"));

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("reduced_clearance");
	});

	it("returns indeterminate for unresolved genotype data", () => {
		const insight = interpretAldh2AlcoholResponse(observation("--"));

		expect(insight.result.direction).toBe("indeterminate");
	});
});


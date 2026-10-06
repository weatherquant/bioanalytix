import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import { classifyLrrk2Parkinson, interpretLrrk2Parkinson } from "./lrrk2ParkinsonInterpretation";

function observation(
	genotype: string,
	confirmationStatus: "confirmed" | "unconfirmed" = "unconfirmed",
): GenotypeObservation {
	return {
		rsid: "rs34637584",

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

describe("LRRK2 Parkinson interpretation", () => {
	it("identifies GG as reference", () => {
		expect(classifyLrrk2Parkinson("GG")).toBe("reference");
	});

	it("identifies AG as heterozygous G2019S", () => {
		expect(classifyLrrk2Parkinson("AG")).toBe("heterozygous_g2019s");
	});

	it("normalizes reversed heterozygous order", () => {
		expect(classifyLrrk2Parkinson("GA")).toBe("heterozygous_g2019s");
	});

	it("identifies AA as homozygous G2019S", () => {
		expect(classifyLrrk2Parkinson("AA")).toBe("homozygous_g2019s");
	});

	it("returns unresolved for unusable genotype", () => {
		expect(classifyLrrk2Parkinson("--")).toBe("unresolved");
	});

	it("returns reference direction for GG", () => {
		const insight = interpretLrrk2Parkinson(observation("GG"));

		expect(insight.result.direction).toBe("reference");
	});

	it("returns higher biological susceptibility for heterozygous G2019S", () => {
		const insight = interpretLrrk2Parkinson(observation("AG"));

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("heterozygous_g2019s");
	});

	it("retains unconfirmed consumer-data status", () => {
		const insight = interpretLrrk2Parkinson(observation("AG"));

		expect(insight.input.confirmationStatus).toBe("unconfirmed");
	});

	it("retains confirmed status when clinically confirmed", () => {
		const insight = interpretLrrk2Parkinson(observation("AG", "confirmed"));

		expect(insight.input.confirmationStatus).toBe("confirmed");
	});

	it("returns indeterminate for unresolved genotype", () => {
		const insight = interpretLrrk2Parkinson(observation("--"));

		expect(insight.result.direction).toBe("indeterminate");
	});
});

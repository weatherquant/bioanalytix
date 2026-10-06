import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import { interpretApobFamilialHypercholesterolemia } from "./apobFamilialHypercholesterolemiaInterpretation";
import { interpretF2Prothrombin } from "./f2ProthrombinInterpretation";
import { interpretTtrAmyloidosis } from "./ttrAmyloidosisInterpretation";

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

describe("high-impact single-variant clinical models", () => {
	it("interprets TTR reference genotype", () => {
		const insight = interpretTtrAmyloidosis(observation("rs76992529", "GG"));

		expect(insight.result.direction).toBe("reference");
	});

	it("identifies TTR V142I heterozygosity", () => {
		const insight = interpretTtrAmyloidosis(observation("rs76992529", "AG"));

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("heterozygous_variant");
	});

	it("interprets APOB genomic C/C as reference", () => {
		const insight = interpretApobFamilialHypercholesterolemia(observation("rs5742904", "CC"));

		expect(insight.result.direction).toBe("reference");
	});

	it("identifies APOB genomic C/T pathogenic variant", () => {
		const insight = interpretApobFamilialHypercholesterolemia(observation("rs5742904", "CT"));

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("heterozygous_variant");
	});

	it("interprets F2 G/G as reference", () => {
		const insight = interpretF2Prothrombin(observation("rs1799963", "GG"));

		expect(insight.result.direction).toBe("reference");
	});

	it("identifies F2 G20210A heterozygosity", () => {
		const insight = interpretF2Prothrombin(observation("rs1799963", "AG"));

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("heterozygous_variant");
	});

	it("keeps all consumer findings unconfirmed", () => {
		const insights = [
			interpretTtrAmyloidosis(observation("rs76992529", "AG")),

			interpretApobFamilialHypercholesterolemia(observation("rs5742904", "CT")),

			interpretF2Prothrombin(observation("rs1799963", "AG")),
		];

		for (const insight of insights) {
			expect(insight.input.confirmationStatus).toBe("unconfirmed");
		}
	});
});


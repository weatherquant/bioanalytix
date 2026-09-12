import { describe, expect, it } from "vitest";

import type { GenotypeObservation } from "../observations/types";
import { classifyMutyhPolyposis, interpretMutyhPolyposis } from "./mutyhPolyposisInterpretation";

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

describe("MUTYH selected-variant interpretation", () => {
	it("identifies reference pattern", () => {
		expect(classifyMutyhPolyposis("TT", "CC")).toBe("reference");
	});

	it("identifies one Y179C pathogenic allele as a single selected variant", () => {
		expect(classifyMutyhPolyposis("CT", "CC")).toBe("single_pathogenic_variant");
	});

	it("identifies one G396D pathogenic allele as a single selected variant", () => {
		expect(classifyMutyhPolyposis("TT", "CT")).toBe("single_pathogenic_variant");
	});

	it("identifies compound heterozygosity across selected variants", () => {
		expect(classifyMutyhPolyposis("CT", "CT")).toBe("biallelic_selected_variants");
	});

	it("identifies homozygosity at Y179C as biallelic", () => {
		expect(classifyMutyhPolyposis("CC", "CC")).toBe("biallelic_selected_variants");
	});

	it("identifies homozygosity at G396D as biallelic", () => {
		expect(classifyMutyhPolyposis("TT", "TT")).toBe("biallelic_selected_variants");
	});

	it("keeps monoallelic carrier state out of higher disease direction", () => {
		const insight = interpretMutyhPolyposis(
			observation("rs34612342", "CT"),
			observation("rs36053993", "CC"),
		);

		expect(insight.result.direction).toBe("reference");

		expect(insight.result.genotype).toBe("single_pathogenic_variant");
	});

	it("returns higher direction for biallelic selected variants", () => {
		const insight = interpretMutyhPolyposis(
			observation("rs34612342", "CT"),
			observation("rs36053993", "CT"),
		);

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.genotype).toBe("biallelic_selected_variants");
	});

	it("retains confirmed status only when both observations are confirmed", () => {
		const insight = interpretMutyhPolyposis(
			observation("rs34612342", "CT", "confirmed"),
			observation("rs36053993", "CT", "confirmed"),
		);

		expect(insight.input.confirmationStatus).toBe("confirmed");
	});

	it("returns indeterminate when either required observation is unresolved", () => {
		const insight = interpretMutyhPolyposis(
			observation("rs34612342", "--"),
			observation("rs36053993", "CC"),
		);

		expect(insight.result.direction).toBe("indeterminate");
	});
});

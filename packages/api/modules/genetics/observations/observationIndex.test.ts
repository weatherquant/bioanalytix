import { describe, expect, it } from "vitest";

import { createGenotypeObservation } from "./createObservation";
import { buildObservationIndex } from "./observationIndex";

function observation(rsid: string, genotype?: string) {
	return createGenotypeObservation({
		rsid,
		genotype,
		sourceType: "consumer_raw_data",
		provider: "23andMe",
		fileFormat: "23andMe raw genotype data",
		genomeBuild: "unknown",
		strandOrientation: "unknown",
		confirmationStatus: "unconfirmed",
		parserVersion: "23andme-parser-v1",
	});
}

describe("observation index resolution", () => {
	it("indexes a single genotype observation", () => {
		const result = buildObservationIndex([observation("rs6025", "AG")]);

		expect(result.index.get("rs6025")?.genotype).toBe("AG");

		expect(result.duplicateRsids).toEqual([]);

		expect(result.conflictingRsids).toEqual([]);
	});

	it("normalizes rsIDs when indexing observations", () => {
		const result = buildObservationIndex([observation("RS6025", "AG")]);

		expect(result.index.has("rs6025")).toBe(true);
	});

	it("deduplicates concordant genotype calls", () => {
		const result = buildObservationIndex([
			observation("rs6025", "AG"),

			observation("rs6025", "AG"),
		]);

		expect(result.index.size).toBe(1);

		expect(result.index.get("rs6025")?.genotype).toBe("AG");

		expect(result.duplicateRsids).toContain("rs6025");

		expect(result.conflictingRsids).toEqual([]);
	});

	it("treats genotype case differences as concordant", () => {
		const result = buildObservationIndex([
			observation("rs6025", "AG"),

			observation("rs6025", "ag"),
		]);

		expect(result.conflictingRsids).toEqual([]);

		expect(result.index.has("rs6025")).toBe(true);
	});

	it("removes a locus when called genotypes conflict", () => {
		const result = buildObservationIndex([
			observation("rs6025", "AG"),

			observation("rs6025", "GG"),
		]);

		expect(result.index.has("rs6025")).toBe(false);

		expect(result.conflictingRsids).toContain("rs6025");

		expect(
			result.warnings.some((warning) => warning.toLowerCase().includes("conflicting")),
		).toBe(true);
	});

	it("does not allow a later genotype to restore an already conflicted locus", () => {
		const result = buildObservationIndex([
			observation("rs6025", "AG"),

			observation("rs6025", "GG"),

			observation("rs6025", "AG"),
		]);

		expect(result.index.has("rs6025")).toBe(false);

		expect(result.conflictingRsids).toEqual(["rs6025"]);
	});

	it("keeps conflicts isolated to the affected locus", () => {
		const result = buildObservationIndex([
			observation("rs6025", "AG"),

			observation("rs6025", "GG"),

			observation("rs429358", "CT"),

			observation("rs7412", "CC"),
		]);

		expect(result.index.has("rs6025")).toBe(false);

		expect(result.index.has("rs429358")).toBe(true);

		expect(result.index.has("rs7412")).toBe(true);
	});

	it("records only one duplicate rsID even when it appears repeatedly", () => {
		const result = buildObservationIndex([
			observation("rs6025", "AG"),

			observation("rs6025", "AG"),

			observation("rs6025", "AG"),
		]);

		expect(result.duplicateRsids).toEqual(["rs6025"]);
	});
});

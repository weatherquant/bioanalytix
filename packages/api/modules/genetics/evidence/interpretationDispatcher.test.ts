import { describe, expect, it } from "vitest";

import { createGenotypeObservation } from "../observations/createObservation";
import { createGenotypeObservation } from "../observations/createObservation";
import { interpretAvailableModels, interpretRegisteredModel } from "./interpretationDispatcher";

function observation(rsid: string, genotype: string) {
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

describe("genetics interpretation dispatcher", () => {
	it("interprets Factor V Leiden by registered model id", () => {
		const insight = interpretRegisteredModel("f5-factor-v-leiden-vte", [
			observation("rs6025", "AG"),
		]);

		expect(insight.model.id).toBe("f5-factor-v-leiden-vte");

		expect(insight.result.direction).toBe("higher");
	});

	it("interprets APOE by registered model id", () => {
		const insight = interpretRegisteredModel("apoe-common-diplotype-v1", [
			observation("rs429358", "CT"),
			observation("rs7412", "CC"),
		]);

		expect(insight.model.id).toBe("apoe-common-diplotype-v1");

		expect(insight.result.direction).toBe("higher");

		expect(insight.result.haplotype).toBe("e3/e4");
	});

	it("fails closed when a required observation is missing", () => {
		expect(() =>
			interpretRegisteredModel("apoe-common-diplotype-v1", [observation("rs429358", "CT")]),
		).toThrow("Required genotype observation is missing: rs7412");
	});

	it("fails closed for an unknown registered model", () => {
		expect(() => interpretRegisteredModel("unknown-model", [])).toThrow(
			"Unknown genetics model",
		);
	});

	it("interprets all available models from a mixed observation set", () => {
		const insights = interpretAvailableModels([
			observation("rs6025", "AG"),
			observation("rs429358", "CT"),
			observation("rs7412", "CC"),
		]);

		expect(insights.map((insight) => insight.model.id)).toEqual([
			"f5-factor-v-leiden-vte",
			"apoe-common-diplotype-v1",
		]);
	});

	it("does not attempt APOE when only one required locus is present", () => {
		const insights = interpretAvailableModels([
			observation("rs6025", "GG"),
			observation("rs429358", "CT"),
		]);

		expect(insights.map((insight) => insight.model.id)).toEqual(["f5-factor-v-leiden-vte"]);
	});

	it("returns no insights when no registered model requirements are met", () => {
		const insights = interpretAvailableModels([
			observation("rs123", "AA"),
			observation("rs999", "CC"),
		]);

		expect(insights).toEqual([]);
	});

	it("does not interpret Factor V Leiden when rs6025 has conflicting genotype observations", () => {
		const insights = interpretAvailableModels([
			observation("rs6025", "AG"),

			observation("rs6025", "GG"),
		]);

		expect(insights.some((insight) => insight.model.id === "f5-factor-v-leiden-vte")).toBe(
			false,
		);
	});

	it("does not interpret APOE when one required locus has conflicting genotype observations", () => {
		const insights = interpretAvailableModels([
			observation("rs429358", "CT"),

			observation("rs429358", "TT"),

			observation("rs7412", "CC"),
		]);

		expect(insights.some((insight) => insight.model.id === "apoe-common-diplotype-v1")).toBe(
			false,
		);
	});

	it("keeps unrelated models available when a different locus is conflicted", () => {
		const insights = interpretAvailableModels([
			observation("rs6025", "AG"),

			observation("rs6025", "GG"),

			observation("rs429358", "CT"),

			observation("rs7412", "CC"),
		]);

		expect(insights.some((insight) => insight.model.id === "f5-factor-v-leiden-vte")).toBe(
			false,
		);

		expect(insights.some((insight) => insight.model.id === "apoe-common-diplotype-v1")).toBe(
			true,
		);
	});

	it("still interprets concordant duplicate genotype observations", () => {
		const insights = interpretAvailableModels([
			observation("rs6025", "AG"),

			observation("rs6025", "AG"),
		]);

		expect(insights.some((insight) => insight.model.id === "f5-factor-v-leiden-vte")).toBe(
			true,
		);
	});
});

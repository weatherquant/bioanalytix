import { describe, expect, it } from "vitest";

import { createGenotypeObservation } from "../observations/createObservation";
import {
	getInterpretationEngine,
	requireInterpretationEngine,
} from "./interpretationEngineRegistry";
import { APOE_COMMON_DIPLOTYPE_MODEL, FACTOR_V_LEIDEN_MODEL } from "./modelRegistry";

function observation(rsid: string, genotype: string) {
	return createGenotypeObservation({
		rsid,
		genotype,
		sourceType: "consumer_raw_data",
		provider: "23andMe",
		parserVersion: "genetics-parser-v1",
	});
}

describe("interpretation engine registry", () => {
	it("registers the single-variant engine", () => {
		expect(getInterpretationEngine("single_variant")).toBeDefined();
	});

	it("registers the haplotype engine", () => {
		expect(getInterpretationEngine("haplotype")).toBeDefined();
	});

	it("fails closed for an unimplemented engine kind", () => {
		expect(() => requireInterpretationEngine("polygenic_score")).toThrow(
			"No interpretation engine registered",
		);
	});

	it("executes Factor V Leiden through the single-variant engine", () => {
		const engine = requireInterpretationEngine("single_variant");

		const observations = new Map([["rs6025", observation("rs6025", "AG")]]);

		const insight = engine(FACTOR_V_LEIDEN_MODEL, observations);

		expect(insight.model.id).toBe("f5-factor-v-leiden-vte");

		expect(insight.result.direction).toBe("higher");
	});

	it("executes APOE through the haplotype engine", () => {
		const engine = requireInterpretationEngine("haplotype");

		const observations = new Map([
			["rs429358", observation("rs429358", "CT")],
			["rs7412", observation("rs7412", "CC")],
		]);

		const insight = engine(APOE_COMMON_DIPLOTYPE_MODEL, observations);

		expect(insight.model.id).toBe("apoe-common-diplotype-v1");

		expect(insight.result.haplotype).toBe("e3/e4");
	});
});

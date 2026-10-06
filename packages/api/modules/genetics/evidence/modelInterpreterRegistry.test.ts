import { describe, expect, it } from "vitest";

import { createGenotypeObservation } from "../observations/createObservation";
import { getModelInterpreter, requireModelInterpreter } from "./modelInterpreterRegistry";
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

describe("model interpreter registry", () => {
	it("registers the Factor V Leiden interpreter", () => {
		expect(getModelInterpreter("f5-factor-v-leiden-vte")).toBeDefined();
	});

	it("registers the APOE interpreter", () => {
		expect(getModelInterpreter("apoe-common-diplotype-v1")).toBeDefined();
	});

	it("fails closed for an unknown model interpreter", () => {
		expect(() => requireModelInterpreter("unknown-model")).toThrow(
			"No model interpreter registered",
		);
	});

	it("executes the Factor V Leiden model", () => {
		const interpreter = requireModelInterpreter("f5-factor-v-leiden-vte");

		const observations = new Map([["rs6025", observation("rs6025", "AG")]]);

		const insight = interpreter(FACTOR_V_LEIDEN_MODEL, observations);

		expect(insight.model.id).toBe("f5-factor-v-leiden-vte");

		expect(insight.result.direction).toBe("higher");
	});

	it("executes the APOE model", () => {
		const interpreter = requireModelInterpreter("apoe-common-diplotype-v1");

		const observations = new Map([
			["rs429358", observation("rs429358", "CT")],
			["rs7412", observation("rs7412", "CC")],
		]);

		const insight = interpreter(APOE_COMMON_DIPLOTYPE_MODEL, observations);

		expect(insight.model.id).toBe("apoe-common-diplotype-v1");

		expect(insight.result.haplotype).toBe("e3/e4");
	});

	it("rejects an incompatible model passed to the Factor V Leiden interpreter", () => {
		const interpreter = requireModelInterpreter("f5-factor-v-leiden-vte");

		expect(() => interpreter(APOE_COMMON_DIPLOTYPE_MODEL, new Map())).toThrow(
			"Factor V Leiden interpreter received incompatible model",
		);
	});

	it("rejects an incompatible model passed to the APOE interpreter", () => {
		const interpreter = requireModelInterpreter("apoe-common-diplotype-v1");

		expect(() => interpreter(FACTOR_V_LEIDEN_MODEL, new Map())).toThrow(
			"APOE interpreter received incompatible model",
		);
	});
});

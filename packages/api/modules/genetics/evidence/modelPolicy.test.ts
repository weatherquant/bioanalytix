import { describe, expect, it } from "vitest";

import { createGenotypeObservation } from "../observations/createObservation";
import { interpretApoe } from "./apoeInterpretation";
import { interpretFactorVLeiden } from "./factorVLeidenInterpretation";
import {
	assertMayModifyFinancialParameters,
	assertMayUseAbsoluteRisk,
	assertMayUseInLongevityModel,
	requireModelPolicy,
} from "./modelPolicyGuards";

function factorVObservation(genotype: string) {
	return createGenotypeObservation({
		rsid: "rs6025",
		genotype,
		sourceType: "consumer_raw_data",
		provider: "23andMe",
		parserVersion: "genetics-parser-v1",
	});
}

function apoeObservation(rsid: "rs429358" | "rs7412", genotype: string) {
	return createGenotypeObservation({
		rsid,
		genotype,
		sourceType: "consumer_raw_data",
		provider: "23andMe",
		parserVersion: "genetics-parser-v1",
	});
}

describe("genetics model governance policy", () => {
	it("has a policy for Factor V Leiden", () => {
		const policy = requireModelPolicy("f5-factor-v-leiden-vte");

		expect(policy.permissions.calculateResult).toBe(true);

		expect(policy.permissions.generatePlanningExposures).toBe(true);
	});

	it("has a policy for APOE", () => {
		const policy = requireModelPolicy("apoe-common-diplotype-v1");

		expect(policy.permissions.calculateResult).toBe(true);

		expect(policy.permissions.calculateAbsoluteRisk).toBe(false);
	});

	it("blocks Factor V Leiden from direct longevity adjustment", () => {
		const insight = interpretFactorVLeiden(factorVObservation("AG"));

		expect(() => assertMayUseInLongevityModel(insight)).toThrow();
	});

	it("blocks APOE from direct longevity adjustment", () => {
		const insight = interpretApoe(
			apoeObservation("rs429358", "CT"),
			apoeObservation("rs7412", "CC"),
		);

		expect(() => assertMayUseInLongevityModel(insight)).toThrow();
	});

	it("blocks APOE personal absolute-risk calculation", () => {
		const insight = interpretApoe(
			apoeObservation("rs429358", "CT"),
			apoeObservation("rs7412", "CC"),
		);

		expect(() => assertMayUseAbsoluteRisk(insight)).toThrow();
	});
	it("blocks Factor V Leiden from silently changing financial parameters", () => {
		const insight = interpretFactorVLeiden(factorVObservation("AG"));

		expect(() => assertMayModifyFinancialParameters(insight)).toThrow();
	});

	it("fails closed for an unknown model", () => {
		expect(() => requireModelPolicy("unknown-model")).toThrow("No governance policy exists");
	});

	it("records explicit licensing provenance for approved models", () => {
		const factorVPolicy = requireModelPolicy("f5-factor-v-leiden-vte");

		const apoePolicy = requireModelPolicy("apoe-common-diplotype-v1");

		expect(factorVPolicy.licensing.status).toBe("permitted");

		expect(apoePolicy.licensing.status).toBe("permitted");
	});
});

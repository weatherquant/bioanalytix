import { describe, expect, it } from "vitest";

import { createGenotypeObservation } from "../observations/createObservation";
import { interpretApoe } from "./apoeInterpretation";
import { interpretFactorVLeiden } from "./factorVLeidenInterpretation";
import {
	assertApprovedForRelease,
	assertMayCalculate,
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
	it("has an implemented Factor V Leiden policy", () => {
		const policy = requireModelPolicy("f5-factor-v-leiden-vte");

		expect(policy.lifecycle.implementation).toBe("implemented");

		expect(policy.permissions.calculateResult).toBe(true);

		expect(policy.permissions.generatePlanningExposures).toBe(true);
	});

	it("has an implemented APOE policy", () => {
		const policy = requireModelPolicy("apoe-common-diplotype-v1");

		expect(policy.lifecycle.implementation).toBe("implemented");

		expect(policy.permissions.calculateResult).toBe(true);

		expect(policy.permissions.calculateAbsoluteRisk).toBe(false);
	});

	it("allows implemented development models to calculate for validation", () => {
		expect(() => assertMayCalculate("f5-factor-v-leiden-vte")).not.toThrow();

		expect(() => assertMayCalculate("apoe-common-diplotype-v1")).not.toThrow();
	});

	it("records Factor V Leiden scientific review as pending", () => {
		const policy = requireModelPolicy("f5-factor-v-leiden-vte");

		expect(policy.review.status).toBe("pending");

		expect(policy.lifecycle.release).toBe("development");
	});

	it("records APOE scientific review as pending", () => {
		const policy = requireModelPolicy("apoe-common-diplotype-v1");

		expect(policy.review.status).toBe("pending");

		expect(policy.lifecycle.release).toBe("development");
	});

	it("does not treat development implementations as production-approved", () => {
		expect(() => assertApprovedForRelease("f5-factor-v-leiden-vte")).toThrow(
			"has not received scientific approval",
		);

		expect(() => assertApprovedForRelease("apoe-common-diplotype-v1")).toThrow(
			"has not received scientific approval",
		);
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

	it("does not make an unnecessary proprietary-licensing assertion for the reference models", () => {
		const factorVPolicy = requireModelPolicy("f5-factor-v-leiden-vte");

		const apoePolicy = requireModelPolicy("apoe-common-diplotype-v1");

		expect(factorVPolicy.licensing.status).toBe("not_applicable");

		expect(apoePolicy.licensing.status).toBe("not_applicable");
	});
});

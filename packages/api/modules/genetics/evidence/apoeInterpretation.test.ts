import { describe, expect, it } from "vitest";

import { classifyApoeDiplotype, interpretApoe } from "./apoeInterpretation";

describe("APOE diplotype classification", () => {
	it("classifies e2/e2", () => {
		expect(classifyApoeDiplotype("TT", "TT")).toEqual({
			status: "resolved",
			diplotype: "e2/e2",
		});
	});

	it("classifies e2/e3", () => {
		expect(classifyApoeDiplotype("TT", "CT")).toEqual({
			status: "resolved",
			diplotype: "e2/e3",
		});
	});

	it("classifies e3/e3", () => {
		expect(classifyApoeDiplotype("TT", "CC")).toEqual({
			status: "resolved",
			diplotype: "e3/e3",
		});
	});

	it("classifies e3/e4", () => {
		expect(classifyApoeDiplotype("CT", "CC")).toEqual({
			status: "resolved",
			diplotype: "e3/e4",
		});
	});

	it("classifies e4/e4", () => {
		expect(classifyApoeDiplotype("CC", "CC")).toEqual({
			status: "resolved",
			diplotype: "e4/e4",
		});
	});

	it("does not infer APOE from one SNP", () => {
		expect(classifyApoeDiplotype("CC", undefined).status).toBe("unresolved");
	});

	it("flags unphased CT/CT as ambiguous", () => {
		expect(classifyApoeDiplotype("CT", "CT").status).toBe("ambiguous");
	});

	it("does not describe e3/e3 as low risk", () => {
		const result = interpretApoe("TT", "CC");

		expect(result.result.direction).toBe("reference");
	});

	it("identifies e3/e4 as higher susceptibility", () => {
		const result = interpretApoe("CT", "CC");

		expect(result.result.direction).toBe("higher");
	});

	it("identifies e4/e4 as higher susceptibility", () => {
		const result = interpretApoe("CC", "CC");

		expect(result.result.direction).toBe("higher");
	});

	it("does not turn APOE into an absolute disease probability", () => {
		const result = interpretApoe("CC", "CC");

		expect(result.result.absoluteRisk).toBeUndefined();
	});

	it("marks consumer APOE observations as unconfirmed", () => {
		const result = interpretApoe("CT", "CC");

		expect(result.input.confirmationStatus).toBe("unconfirmed");
	});
});

import { describe, expect, it } from "vitest";

import {
	classifyFactorVLeidenGenotype,
	interpretFactorVLeiden,
} from "./factorVLeidenInterpretation";

describe("Factor V Leiden genotype classification", () => {
	it("classifies GG as non-carrier", () => {
		expect(classifyFactorVLeidenGenotype("GG")).toBe("non_carrier");
	});

	it("classifies AG as heterozygous", () => {
		expect(classifyFactorVLeidenGenotype("AG")).toBe("heterozygous");
	});

	it("classifies GA as heterozygous", () => {
		expect(classifyFactorVLeidenGenotype("GA")).toBe("heterozygous");
	});

	it("classifies AA as homozygous", () => {
		expect(classifyFactorVLeidenGenotype("AA")).toBe("homozygous");
	});

	it("returns unresolved for missing data", () => {
		expect(classifyFactorVLeidenGenotype(undefined)).toBe("unresolved");
	});

	it("does not call a non-carrier low risk", () => {
		const result = interpretFactorVLeiden("GG");

		expect(result.result.direction).toBe("reference");
	});

	it("marks consumer genotype results as unconfirmed", () => {
		const result = interpretFactorVLeiden("AG");

		expect(result.input.confirmationStatus).toBe("unconfirmed");
	});
});

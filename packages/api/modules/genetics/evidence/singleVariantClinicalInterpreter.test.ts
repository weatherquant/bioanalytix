import { describe, expect, it } from "vitest";

import { classifySingleClinicalVariant } from "./singleVariantClinicalInterpreter";

describe("singleVariantClinicalInterpreter", () => {
	it("classifies the reference genotype", () => {
		expect(classifySingleClinicalVariant("GG", "G", "A")).toBe("reference");
	});

	it("classifies a heterozygous variant", () => {
		expect(classifySingleClinicalVariant("AG", "G", "A")).toBe("heterozygous_variant");
	});

	it("normalizes heterozygous allele order", () => {
		expect(classifySingleClinicalVariant("GA", "G", "A")).toBe("heterozygous_variant");
	});

	it("classifies a homozygous variant", () => {
		expect(classifySingleClinicalVariant("AA", "G", "A")).toBe("homozygous_variant");
	});

	it("supports reverse-strand genomic allele definitions", () => {
		expect(classifySingleClinicalVariant("CT", "C", "T")).toBe("heterozygous_variant");
	});

	it("returns unresolved for unusable genotype data", () => {
		expect(classifySingleClinicalVariant("--", "G", "A")).toBe("unresolved");
	});
});

import { describe, expect, it } from "vitest";

import { createGenotypeObservation } from "./createObservation";
import { validateGenotypeObservation } from "./validateObservation";

describe("createGenotypeObservation", () => {
	it("creates explicit provenance for consumer raw data", () => {
		const observation = createGenotypeObservation({
			rsid: "RS6025",
			genotype: "ag",
			sourceType: "consumer_raw_data",
			provider: "23andMe",
			parserVersion: "genetics-parser-v1",
		});

		expect(observation.rsid).toBe("rs6025");

		expect(observation.genotype).toBe("AG");

		expect(observation.callStatus).toBe("called");

		expect(observation.source.type).toBe("consumer_raw_data");

		expect(observation.confirmationStatus).toBe("unconfirmed");

		expect(observation.provenance.parserVersion).toBe("genetics-parser-v1");
	});

	it("marks malformed genotype input as invalid", () => {
		const observation = createGenotypeObservation({
			rsid: "rs6025",
			genotype: "XYZ",
			sourceType: "consumer_raw_data",
			parserVersion: "genetics-parser-v1",
		});

		expect(observation.callStatus).toBe("invalid");

		expect(observation.genotype).toBeUndefined();
	});

	it("does not silently sanitize a malformed genotype", () => {
		const observation = createGenotypeObservation({
			rsid: "rs6025",
			genotype: "A-G",
			sourceType: "consumer_raw_data",
			parserVersion: "genetics-parser-v1",
		});

		expect(observation.callStatus).toBe("invalid");

		expect(observation.genotype).toBeUndefined();
	});

	it("records unknown genome build and strand orientation as warnings", () => {
		const observation = createGenotypeObservation({
			rsid: "rs6025",
			genotype: "AG",
			sourceType: "consumer_raw_data",
			parserVersion: "genetics-parser-v1",
		});

		const validation = validateGenotypeObservation(observation);

		expect(validation.warnings).toContain("Genome build is unknown.");

		expect(validation.warnings).toContain("Strand orientation is unknown.");
	});

	it("does not infer clinical confirmation from a clinical source", () => {
		const observation = createGenotypeObservation({
			rsid: "rs6025",
			genotype: "AG",
			sourceType: "clinical_test",
			provider: "Example Laboratory",
			parserVersion: "clinical-import-v1",
		});

		expect(observation.confirmationStatus).toBe("unconfirmed");
	});

	it("records confirmation only when explicitly provided", () => {
		const observation = createGenotypeObservation({
			rsid: "rs6025",
			genotype: "AG",
			sourceType: "clinical_test",
			provider: "Example Laboratory",
			confirmationStatus: "confirmed",
			parserVersion: "clinical-import-v1",
		});

		expect(observation.confirmationStatus).toBe("confirmed");
	});

	it("marks an absent genotype as missing", () => {
		const observation = createGenotypeObservation({
			rsid: "rs6025",
			sourceType: "consumer_raw_data",
			parserVersion: "genetics-parser-v1",
		});

		expect(observation.callStatus).toBe("missing");

		expect(observation.genotype).toBeUndefined();
	});
});

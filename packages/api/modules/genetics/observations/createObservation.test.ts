import { describe, expect, it } from "vitest";

import { createGenotypeObservation } from "./createObservation";
import { assessInterpretationEligibility } from "./interpretationEligibility";
import { validateGenotypeObservation } from "./validateObservation";

describe("genotype observation provenance", () => {
	it("creates a consumer observation with explicit provenance", () => {
		const observation = createGenotypeObservation({
			rsid: "rs6025",
			genotype: "AG",
			sourceType: "consumer_raw_data",
			provider: "23andMe",
			parserVersion: "genetics-parser-v1",
		});

		expect(observation.rsid).toBe("rs6025");

		expect(observation.genotype).toBe("AG");

		expect(observation.callStatus).toBe("called");

		expect(observation.confirmationStatus).toBe("unconfirmed");

		expect(observation.genomeBuild).toBe("unknown");
	});

	it("marks malformed genotype calls invalid", () => {
		const observation = createGenotypeObservation({
			rsid: "rs6025",
			genotype: "XYZ",
			sourceType: "consumer_raw_data",
			parserVersion: "genetics-parser-v1",
		});

		expect(observation.callStatus).toBe("invalid");

		expect(validateGenotypeObservation(observation).valid).toBe(false);
	});

	it("records unknown build and strand as warnings", () => {
		const observation = createGenotypeObservation({
			rsid: "rs6025",
			genotype: "AG",
			sourceType: "consumer_raw_data",
			parserVersion: "genetics-parser-v1",
		});

		const result = validateGenotypeObservation(observation);

		expect(result.valid).toBe(true);

		expect(result.warnings.length).toBeGreaterThan(0);
	});

	it("rejects interpretation when rsID does not match the model", () => {
		const observation = createGenotypeObservation({
			rsid: "rs429358",
			genotype: "CT",
			sourceType: "consumer_raw_data",
			parserVersion: "genetics-parser-v1",
		});

		const result = assessInterpretationEligibility(observation, "rs6025");

		expect(result.eligible).toBe(false);
	});

	it("allows an otherwise valid observation while preserving provenance warnings", () => {
		const observation = createGenotypeObservation({
			rsid: "rs6025",
			genotype: "AG",
			sourceType: "consumer_raw_data",
			parserVersion: "genetics-parser-v1",
		});

		const result = assessInterpretationEligibility(observation, "rs6025");

		expect(result.eligible).toBe(true);

		expect(result.warnings.length).toBeGreaterThan(0);
	});
});

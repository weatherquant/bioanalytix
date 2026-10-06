import { describe, expect, it } from "vitest";

import { FACTOR_V_LEIDEN_MODEL } from "../evidence/modelRegistry";
import { createGenotypeObservation } from "./createObservation";
import { assessModelObservationEligibility } from "./interpretationEligibility";

function consumerObservation(
	overrides: Partial<Parameters<typeof createGenotypeObservation>[0]> = {},
) {
	return createGenotypeObservation({
		rsid: "rs6025",
		genotype: "AG",
		sourceType: "consumer_raw_data",
		provider: "23andMe",
		fileFormat: "23andMe raw genotype data",
		genomeBuild: "unknown",
		strandOrientation: "unknown",
		confirmationStatus: "unconfirmed",
		parserVersion: "23andme-parser-v1",
		...overrides,
	});
}

describe("model-aware interpretation eligibility", () => {
	it("allows FVL analytical interpretation with unknown build and strand when the model permits them", () => {
		const observation = consumerObservation();

		const result = assessModelObservationEligibility(
			observation,
			"rs6025",
			FACTOR_V_LEIDEN_MODEL,
		);

		expect(result.eligible).toBe(true);
	});

	it("preserves non-blocking observation validation warnings", () => {
		const observation = consumerObservation();

		const result = assessModelObservationEligibility(
			observation,
			"rs6025",
			FACTOR_V_LEIDEN_MODEL,
		);

		expect(result.eligible).toBe(true);

		expect(result.warnings.length).toBeGreaterThan(0);
	});

	it("does not treat unconfirmed consumer raw data as an analytical failure", () => {
		const observation = consumerObservation({
			confirmationStatus: "unconfirmed",
		});

		const result = assessModelObservationEligibility(
			observation,
			"rs6025",
			FACTOR_V_LEIDEN_MODEL,
		);

		expect(result.eligible).toBe(true);

		expect(result.reasons).toEqual([]);
	});

	it("fails analytical eligibility when the observation is for the wrong locus", () => {
		const observation = consumerObservation({
			rsid: "rs12345",
		});

		const result = assessModelObservationEligibility(
			observation,
			"rs6025",
			FACTOR_V_LEIDEN_MODEL,
		);

		expect(result.eligible).toBe(false);

		expect(result.reasons.some((reason) => reason.includes("Expected rs6025"))).toBe(true);
	});

	it("supports stricter genome-build requirements for future models", () => {
		const strictModel = {
			...FACTOR_V_LEIDEN_MODEL,

			id: "test-build-model",

			analyticalRequirements: {
				...FACTOR_V_LEIDEN_MODEL.analyticalRequirements,

				genomeBuild: ["GRCh37"] as const,
			},
		};

		const observation = consumerObservation({
			genomeBuild: "unknown",
		});

		const result = assessModelObservationEligibility(observation, "rs6025", strictModel);

		expect(result.eligible).toBe(false);

		expect(result.reasons.some((reason) => reason.includes("Genome build"))).toBe(true);
	});

	it("accepts observations that satisfy a stricter genome-build requirement", () => {
		const strictModel = {
			...FACTOR_V_LEIDEN_MODEL,

			id: "test-build-model",

			analyticalRequirements: {
				...FACTOR_V_LEIDEN_MODEL.analyticalRequirements,

				genomeBuild: ["GRCh37"] as const,
			},
		};

		const observation = consumerObservation({
			genomeBuild: "GRCh37",
		});

		const result = assessModelObservationEligibility(observation, "rs6025", strictModel);

		expect(result.eligible).toBe(true);
	});

	it("supports stricter strand requirements for future models", () => {
		const strictModel = {
			...FACTOR_V_LEIDEN_MODEL,

			id: "test-strand-model",

			analyticalRequirements: {
				...FACTOR_V_LEIDEN_MODEL.analyticalRequirements,

				strand: "forward" as const,
			},
		};

		const observation = consumerObservation({
			strandOrientation: "unknown",
		});

		const result = assessModelObservationEligibility(observation, "rs6025", strictModel);

		expect(result.eligible).toBe(false);

		expect(result.reasons.some((reason) => reason.includes("Strand orientation"))).toBe(true);
	});

	it("accepts observations that satisfy a stricter strand requirement", () => {
		const strictModel = {
			...FACTOR_V_LEIDEN_MODEL,

			id: "test-strand-model",

			analyticalRequirements: {
				...FACTOR_V_LEIDEN_MODEL.analyticalRequirements,

				strand: "forward" as const,
			},
		};

		const observation = consumerObservation({
			strandOrientation: "forward",
		});

		const result = assessModelObservationEligibility(observation, "rs6025", strictModel);

		expect(result.eligible).toBe(true);
	});
});

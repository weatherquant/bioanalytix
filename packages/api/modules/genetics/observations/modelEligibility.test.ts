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
	it("allows FVL analytical interpretation with unknown build and strand", () => {
		const observation = consumerObservation();

		const result = assessModelObservationEligibility(
			observation,
			"rs6025",
			FACTOR_V_LEIDEN_MODEL,
		);

		expect(result.eligible).toBe(true);
	});

	it("preserves uncertainty warnings for unknown provenance", () => {
		const observation = consumerObservation();

		const result = assessModelObservationEligibility(
			observation,
			"rs6025",
			FACTOR_V_LEIDEN_MODEL,
		);

		expect(result.warnings.length).toBeGreaterThan(0);

		expect(
			result.warnings.some((warning) => warning.toLowerCase().includes("confirmation")),
		).toBe(true);
	});

	it("allows consumer raw data for planning where the model explicitly permits it", () => {
		const observation = consumerObservation();

		const result = assessModelObservationEligibility(
			observation,
			"rs6025",
			FACTOR_V_LEIDEN_MODEL,
		);

		expect(result.eligible).toBe(true);

		expect(FACTOR_V_LEIDEN_MODEL.inputRequirements.planning.consumerRawDataPermitted).toBe(
			true,
		);

		expect(FACTOR_V_LEIDEN_MODEL.inputRequirements.planning.clinicalConfirmationRequired).toBe(
			false,
		);
	});

	it("still requires confirmation before clinical action", () => {
		expect(FACTOR_V_LEIDEN_MODEL.inputRequirements.clinical.confirmationRequired).toBe(true);

		expect(
			FACTOR_V_LEIDEN_MODEL.inputRequirements.clinical.medicalActionFromConsumerRawData,
		).toBe(false);
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

	it("supports stricter build requirements for future models", () => {
		const strictModel = {
			...FACTOR_V_LEIDEN_MODEL,
			id: "test-build-model",
			inputRequirements: {
				...FACTOR_V_LEIDEN_MODEL.inputRequirements,
				analytical: {
					...FACTOR_V_LEIDEN_MODEL.inputRequirements.analytical,
					genomeBuild: ["GRCh37"] as const,
				},
			},
		};

		const observation = consumerObservation({
			genomeBuild: "unknown",
		});

		const result = assessModelObservationEligibility(observation, "rs6025", strictModel);

		expect(result.eligible).toBe(false);
	});

	it("supports stricter strand requirements for future models", () => {
		const strictModel = {
			...FACTOR_V_LEIDEN_MODEL,
			id: "test-strand-model",
			inputRequirements: {
				...FACTOR_V_LEIDEN_MODEL.inputRequirements,
				analytical: {
					...FACTOR_V_LEIDEN_MODEL.inputRequirements.analytical,
					strand: "forward" as const,
				},
			},
		};

		const observation = consumerObservation({
			strandOrientation: "unknown",
		});

		const result = assessModelObservationEligibility(observation, "rs6025", strictModel);

		expect(result.eligible).toBe(false);
	});
});

import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import type { BiologicalInsight } from "./insight";
import { LACTASE_PERSISTENCE_EVIDENCE } from "./lactasePersistence";
import { assertMayCalculate } from "./modelPolicyGuards";
import { LACTASE_PERSISTENCE_MODEL } from "./modelRegistry";

export type LactasePersistenceState = "persistent" | "non_persistent" | "unresolved";

function normalizeGenotype(genotype: string | undefined): string | undefined {
	if (!genotype) {
		return undefined;
	}

	const normalized = genotype.toUpperCase().replace(/[^ACGT]/g, "");

	if (normalized.length !== 2) {
		return undefined;
	}

	return [...normalized].sort().join("");
}

export function classifyLactasePersistence(genotype: string | undefined): LactasePersistenceState {
	const normalized = normalizeGenotype(genotype);

	if (!normalized) {
		return "unresolved";
	}

	if (normalized === "CT" || normalized === "TT") {
		return "persistent";
	}

	if (normalized === "CC") {
		return "non_persistent";
	}

	return "unresolved";
}

export function interpretLactasePersistence(observation: GenotypeObservation): BiologicalInsight {
	assertMayCalculate(LACTASE_PERSISTENCE_MODEL.id);

	const eligibility = assessModelObservationEligibility(
		observation,
		"rs4988235",
		LACTASE_PERSISTENCE_MODEL,
	);

	const state = eligibility.eligible
		? classifyLactasePersistence(observation.genotype)
		: "unresolved";

	/*
	 * This is a phenotype/trait interpretation.
	 *
	 * "higher" and "lower" are not meaningful here,
	 * so an interpretable result is represented as
	 * reference-direction and the actual phenotype
	 * is retained in result.genotype.
	 */
	const direction = state === "unresolved" ? "indeterminate" : "reference";

	return {
		id: "mcm6-adult-lactase-persistence",

		domain: "nutrition_metabolism",

		title: "Adult lactose digestion tendency",

		model: {
			id: LACTASE_PERSISTENCE_MODEL.id,

			version: LACTASE_PERSISTENCE_MODEL.version,

			evidenceClass: LACTASE_PERSISTENCE_MODEL.evidenceClass,
		},

		result: {
			direction,
			genotype: state,
		},

		confidence: {
			evidenceStrength: "established",

			genotypeCoverage: eligibility.eligible && state !== "unresolved" ? 1 : 0,

			populationApplicability: "unknown",
		},

		input: {
			genomeBuild: observation.genomeBuild,

			source: observation.source.type,

			confirmationStatus: observation.confirmationStatus,
		},

		limitations: [
			...LACTASE_PERSISTENCE_EVIDENCE.limitations,

			...observation.limitations,

			...eligibility.reasons,

			...eligibility.warnings,
		],

		provenance: {
			evidenceIds: [LACTASE_PERSISTENCE_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

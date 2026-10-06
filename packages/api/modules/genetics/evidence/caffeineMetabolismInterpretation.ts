import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import { CAFFEINE_METABOLISM_EVIDENCE } from "./caffeineMetabolism";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";
import { CAFFEINE_METABOLISM_MODEL } from "./modelRegistry";

export type CaffeineMetabolismState = "faster" | "slower" | "unresolved";

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

export function classifyCaffeineMetabolism(genotype: string | undefined): CaffeineMetabolismState {
	const normalized = normalizeGenotype(genotype);

	if (!normalized) {
		return "unresolved";
	}

	if (normalized === "AA") {
		return "faster";
	}

	if (normalized === "AC" || normalized === "CC") {
		return "slower";
	}

	return "unresolved";
}

export function interpretCaffeineMetabolism(observation: GenotypeObservation): BiologicalInsight {
	assertMayCalculate(CAFFEINE_METABOLISM_MODEL.id);

	const eligibility = assessModelObservationEligibility(
		observation,
		"rs762551",
		CAFFEINE_METABOLISM_MODEL,
	);

	const state = eligibility.eligible
		? classifyCaffeineMetabolism(observation.genotype)
		: "unresolved";

	const direction = state === "unresolved" ? "indeterminate" : "reference";

	return {
		id: "cyp1a2-caffeine-metabolism",

		domain: "nutrition_metabolism",

		title: "Caffeine metabolism tendency",

		model: {
			id: CAFFEINE_METABOLISM_MODEL.id,

			version: CAFFEINE_METABOLISM_MODEL.version,

			evidenceClass: CAFFEINE_METABOLISM_MODEL.evidenceClass,
		},

		result: {
			direction,
			genotype: state,
		},

		confidence: {
			evidenceStrength: "strong",

			genotypeCoverage: eligibility.eligible && state !== "unresolved" ? 1 : 0,

			populationApplicability: "unknown",
		},

		input: {
			genomeBuild: observation.genomeBuild,

			source: observation.source.type,

			confirmationStatus: observation.confirmationStatus,
		},

		limitations: [
			...CAFFEINE_METABOLISM_EVIDENCE.limitations,

			...observation.limitations,

			...eligibility.reasons,

			...eligibility.warnings,
		],

		provenance: {
			evidenceIds: [CAFFEINE_METABOLISM_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

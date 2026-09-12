import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import { ALDH2_ALCOHOL_RESPONSE_EVIDENCE } from "./aldh2AlcoholResponse";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";
import { ALDH2_ALCOHOL_RESPONSE_MODEL } from "./modelRegistry";

export type Aldh2AlcoholResponseState =
	| "typical_clearance"
	| "reduced_clearance"
	| "markedly_reduced_clearance"
	| "unresolved";

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

export function classifyAldh2AlcoholResponse(
	genotype: string | undefined,
): Aldh2AlcoholResponseState {
	const normalized = normalizeGenotype(genotype);

	if (!normalized) {
		return "unresolved";
	}

	if (normalized === "GG") {
		return "typical_clearance";
	}

	if (normalized === "AG") {
		return "reduced_clearance";
	}

	if (normalized === "AA") {
		return "markedly_reduced_clearance";
	}

	return "unresolved";
}

export function interpretAldh2AlcoholResponse(observation: GenotypeObservation): BiologicalInsight {
	assertMayCalculate(ALDH2_ALCOHOL_RESPONSE_MODEL.id);

	const eligibility = assessModelObservationEligibility(
		observation,
		"rs671",
		ALDH2_ALCOHOL_RESPONSE_MODEL,
	);

	const state = eligibility.eligible
		? classifyAldh2AlcoholResponse(observation.genotype)
		: "unresolved";

	const direction = state === "unresolved" ? "indeterminate" : "reference";

	return {
		id: "aldh2-acetaldehyde-clearance",

		domain: "nutrition_metabolism",

		title: "Alcohol response and acetaldehyde clearance",

		model: {
			id: ALDH2_ALCOHOL_RESPONSE_MODEL.id,

			version: ALDH2_ALCOHOL_RESPONSE_MODEL.version,

			evidenceClass: ALDH2_ALCOHOL_RESPONSE_MODEL.evidenceClass,
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
			...ALDH2_ALCOHOL_RESPONSE_EVIDENCE.limitations,

			...observation.limitations,

			...eligibility.reasons,

			...eligibility.warnings,
		],

		provenance: {
			evidenceIds: [ALDH2_ALCOHOL_RESPONSE_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

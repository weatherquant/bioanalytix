import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import type { BiologicalInsight } from "./insight";
import { LRRK2_G2019S_EVIDENCE } from "./lrrk2Parkinson";
import { assertMayCalculate } from "./modelPolicyGuards";
import { LRRK2_PARKINSON_MODEL } from "./modelRegistry";

export type Lrrk2ParkinsonState =
	| "reference"
	| "heterozygous_g2019s"
	| "homozygous_g2019s"
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

export function classifyLrrk2Parkinson(genotype: string | undefined): Lrrk2ParkinsonState {
	const normalized = normalizeGenotype(genotype);

	if (!normalized) {
		return "unresolved";
	}

	if (normalized === "GG") {
		return "reference";
	}

	if (normalized === "AG") {
		return "heterozygous_g2019s";
	}

	if (normalized === "AA") {
		return "homozygous_g2019s";
	}

	return "unresolved";
}

export function interpretLrrk2Parkinson(observation: GenotypeObservation): BiologicalInsight {
	assertMayCalculate(LRRK2_PARKINSON_MODEL.id);

	const eligibility = assessModelObservationEligibility(
		observation,
		"rs34637584",
		LRRK2_PARKINSON_MODEL,
	);

	const state = eligibility.eligible
		? classifyLrrk2Parkinson(observation.genotype)
		: "unresolved";

	const direction =
		state === "unresolved" ? "indeterminate" : state === "reference" ? "reference" : "higher";

	return {
		id: "lrrk2-g2019s-parkinson-susceptibility",

		domain: "neurological",

		title: "LRRK2-related Parkinson disease susceptibility",

		model: {
			id: LRRK2_PARKINSON_MODEL.id,

			version: LRRK2_PARKINSON_MODEL.version,

			evidenceClass: LRRK2_PARKINSON_MODEL.evidenceClass,
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
			...LRRK2_G2019S_EVIDENCE.limitations,

			...observation.limitations,

			...eligibility.reasons,

			...eligibility.warnings,
		],

		provenance: {
			evidenceIds: [LRRK2_G2019S_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

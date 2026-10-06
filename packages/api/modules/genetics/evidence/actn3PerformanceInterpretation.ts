import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import { ACTN3_PERFORMANCE_EVIDENCE } from "./actn3Performance";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";
import { ACTN3_PERFORMANCE_MODEL } from "./modelRegistry";

export type Actn3PerformanceState = "rr" | "rx" | "xx" | "unresolved";

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

export function classifyActn3Performance(genotype: string | undefined): Actn3PerformanceState {
	const normalized = normalizeGenotype(genotype);

	if (!normalized) {
		return "unresolved";
	}

	if (normalized === "CC") {
		return "rr";
	}

	if (normalized === "CT") {
		return "rx";
	}

	if (normalized === "TT") {
		return "xx";
	}

	return "unresolved";
}

export function interpretActn3Performance(observation: GenotypeObservation): BiologicalInsight {
	assertMayCalculate(ACTN3_PERFORMANCE_MODEL.id);

	const eligibility = assessModelObservationEligibility(
		observation,
		"rs1815739",
		ACTN3_PERFORMANCE_MODEL,
	);

	const state = eligibility.eligible
		? classifyActn3Performance(observation.genotype)
		: "unresolved";

	const direction = state === "unresolved" ? "indeterminate" : "reference";

	return {
		id: "actn3-muscle-performance",

		domain: "physical_performance",

		title: "Muscle performance tendency",

		model: {
			id: ACTN3_PERFORMANCE_MODEL.id,

			version: ACTN3_PERFORMANCE_MODEL.version,

			evidenceClass: ACTN3_PERFORMANCE_MODEL.evidenceClass,
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
			...ACTN3_PERFORMANCE_EVIDENCE.limitations,

			...observation.limitations,

			...eligibility.reasons,

			...eligibility.warnings,
		],

		provenance: {
			evidenceIds: [ACTN3_PERFORMANCE_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

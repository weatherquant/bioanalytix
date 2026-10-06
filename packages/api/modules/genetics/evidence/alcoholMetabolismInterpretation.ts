import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import { ADH1B_ALCOHOL_METABOLISM_EVIDENCE } from "./alcoholMetabolism";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";
import { ADH1B_ALCOHOL_METABOLISM_MODEL } from "./modelRegistry";

export type AlcoholMetabolismState = "faster" | "intermediate" | "common" | "unresolved";

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

export function classifyAlcoholMetabolism(genotype: string | undefined): AlcoholMetabolismState {
	const normalized = normalizeGenotype(genotype);

	if (!normalized) {
		return "unresolved";
	}

	if (normalized === "AA") {
		return "faster";
	}

	if (normalized === "AG") {
		return "intermediate";
	}

	if (normalized === "GG") {
		return "common";
	}

	return "unresolved";
}

export function interpretAlcoholMetabolism(observation: GenotypeObservation): BiologicalInsight {
	assertMayCalculate(ADH1B_ALCOHOL_METABOLISM_MODEL.id);

	const eligibility = assessModelObservationEligibility(
		observation,
		"rs1229984",
		ADH1B_ALCOHOL_METABOLISM_MODEL,
	);

	const state = eligibility.eligible
		? classifyAlcoholMetabolism(observation.genotype)
		: "unresolved";

	const direction = state === "unresolved" ? "indeterminate" : "reference";

	return {
		id: "adh1b-alcohol-metabolism",

		domain: "nutrition_metabolism",

		title: "Alcohol metabolism tendency",

		model: {
			id: ADH1B_ALCOHOL_METABOLISM_MODEL.id,

			version: ADH1B_ALCOHOL_METABOLISM_MODEL.version,

			evidenceClass: ADH1B_ALCOHOL_METABOLISM_MODEL.evidenceClass,
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
			...ADH1B_ALCOHOL_METABOLISM_EVIDENCE.limitations,

			...observation.limitations,

			...eligibility.reasons,

			...eligibility.warnings,
		],

		provenance: {
			evidenceIds: [ADH1B_ALCOHOL_METABOLISM_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

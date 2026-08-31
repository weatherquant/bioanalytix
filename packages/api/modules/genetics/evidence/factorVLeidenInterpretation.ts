import { assessInterpretationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import { FACTOR_V_LEIDEN_EVIDENCE } from "./factorVLeiden";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";

export type FactorVLeidenGenotypeState =
	| "non_carrier"
	| "heterozygous"
	| "homozygous"
	| "unresolved";

export function classifyFactorVLeidenGenotype(
	genotype: string | undefined,
): FactorVLeidenGenotypeState {
	if (!genotype) {
		return "unresolved";
	}

	const normalized = genotype.toUpperCase().replace(/[^ACGT]/g, "");

	if (normalized.length !== 2) {
		return "unresolved";
	}

	const aCount = [...normalized].filter((allele) => allele === "A").length;

	if (aCount === 0) {
		return "non_carrier";
	}

	if (aCount === 1) {
		return "heterozygous";
	}

	if (aCount === 2) {
		return "homozygous";
	}

	return "unresolved";
}

export function interpretFactorVLeiden(observation: GenotypeObservation): BiologicalInsight {
	assertMayCalculate(FACTOR_V_LEIDEN_EVIDENCE.id);

	const eligibility = assessInterpretationEligibility(observation, "rs6025");

	const state = eligibility.eligible
		? classifyFactorVLeidenGenotype(observation.genotype)
		: "unresolved";

	const direction =
		state === "heterozygous" || state === "homozygous"
			? "higher"
			: state === "non_carrier"
				? "reference"
				: "indeterminate";

	return {
		id: "factor-v-leiden-vte",

		domain: "thrombosis",

		title: "Factor V Leiden and venous thrombosis susceptibility",

		model: {
			id: FACTOR_V_LEIDEN_EVIDENCE.id,
			version: FACTOR_V_LEIDEN_EVIDENCE.version,
			evidenceClass: FACTOR_V_LEIDEN_EVIDENCE.evidenceClass,
		},

		result: {
			direction,
			genotype: observation.genotype,
		},

		confidence: {
			evidenceStrength: FACTOR_V_LEIDEN_EVIDENCE.evidenceStrength,

			genotypeCoverage: eligibility.eligible && state !== "unresolved" ? 1 : 0,

			populationApplicability: "unknown",
		},

		input: {
			genomeBuild: observation.genomeBuild,

			source: observation.source.type,

			confirmationStatus: observation.confirmationStatus,
		},

		limitations: [
			...FACTOR_V_LEIDEN_EVIDENCE.limitations,
			...observation.limitations,
			...eligibility.reasons,
			...eligibility.warnings,
		],

		provenance: {
			evidenceIds: [FACTOR_V_LEIDEN_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

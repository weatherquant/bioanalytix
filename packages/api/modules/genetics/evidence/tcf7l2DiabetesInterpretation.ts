import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";
import { TCF7L2_DIABETES_MODEL } from "./modelRegistry";
import { TCF7L2_DIABETES_EVIDENCE } from "./tcf7l2Diabetes";

export type Tcf7l2DiabetesState =
	| "reference"
	| "one_risk_allele"
	| "two_risk_alleles"
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

export function classifyTcf7l2Diabetes(genotype: string | undefined): Tcf7l2DiabetesState {
	const normalized = normalizeGenotype(genotype);

	if (!normalized) {
		return "unresolved";
	}

	if (normalized === "CC") {
		return "reference";
	}

	if (normalized === "CT") {
		return "one_risk_allele";
	}

	if (normalized === "TT") {
		return "two_risk_alleles";
	}

	return "unresolved";
}

export function interpretTcf7l2Diabetes(observation: GenotypeObservation): BiologicalInsight {
	assertMayCalculate(TCF7L2_DIABETES_MODEL.id);

	const eligibility = assessModelObservationEligibility(
		observation,
		"rs7903146",
		TCF7L2_DIABETES_MODEL,
	);

	const state = eligibility.eligible
		? classifyTcf7l2Diabetes(observation.genotype)
		: "unresolved";

	const direction =
		state === "unresolved" ? "indeterminate" : state === "reference" ? "reference" : "higher";

	return {
		id: "tcf7l2-type-2-diabetes-susceptibility",

		domain: "metabolic",

		title: "Type 2 diabetes susceptibility",

		model: {
			id: TCF7L2_DIABETES_MODEL.id,

			version: TCF7L2_DIABETES_MODEL.version,

			evidenceClass: TCF7L2_DIABETES_MODEL.evidenceClass,
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
			...TCF7L2_DIABETES_EVIDENCE.limitations,

			...observation.limitations,

			...eligibility.reasons,

			...eligibility.warnings,
		],

		provenance: {
			evidenceIds: [TCF7L2_DIABETES_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

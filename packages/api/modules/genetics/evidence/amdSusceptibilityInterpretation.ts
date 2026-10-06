import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import { ARMS2_AMD_EVIDENCE, CFH_AMD_EVIDENCE } from "./amdSusceptibility";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";
import { AMD_SUSCEPTIBILITY_MODEL } from "./modelRegistry";

export type AmdSusceptibilityState =
	| "reference"
	| "one_risk_allele"
	| "multiple_risk_alleles"
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

function countAllele(genotype: string, allele: string): number {
	return [...genotype].filter((value) => value === allele).length;
}

export function classifyAmdSusceptibility(
	rs1061170: string | undefined,
	rs10490924: string | undefined,
): AmdSusceptibilityState {
	const cfh = normalizeGenotype(rs1061170);

	const arms2 = normalizeGenotype(rs10490924);

	if (!cfh || !arms2) {
		return "unresolved";
	}

	/*
	 * CFH rs1061170:
	 * C is the established risk allele.
	 *
	 * ARMS2 rs10490924:
	 * T is the established risk allele.
	 */
	const riskAlleleCount = countAllele(cfh, "C") + countAllele(arms2, "T");

	if (riskAlleleCount === 0) {
		return "reference";
	}

	if (riskAlleleCount === 1) {
		return "one_risk_allele";
	}

	return "multiple_risk_alleles";
}

export function interpretAmdSusceptibility(
	cfhObservation: GenotypeObservation,
	arms2Observation: GenotypeObservation,
): BiologicalInsight {
	assertMayCalculate(AMD_SUSCEPTIBILITY_MODEL.id);

	const cfhEligibility = assessModelObservationEligibility(
		cfhObservation,
		"rs1061170",
		AMD_SUSCEPTIBILITY_MODEL,
	);

	const arms2Eligibility = assessModelObservationEligibility(
		arms2Observation,
		"rs10490924",
		AMD_SUSCEPTIBILITY_MODEL,
	);

	const eligible = cfhEligibility.eligible && arms2Eligibility.eligible;

	const state = eligible
		? classifyAmdSusceptibility(cfhObservation.genotype, arms2Observation.genotype)
		: "unresolved";

	const direction =
		state === "unresolved" ? "indeterminate" : state === "reference" ? "reference" : "higher";

	const sameGenomeBuild = cfhObservation.genomeBuild === arms2Observation.genomeBuild;

	const sameSource = cfhObservation.source.type === arms2Observation.source.type;

	const bothConfirmed =
		cfhObservation.confirmationStatus === "confirmed" &&
		arms2Observation.confirmationStatus === "confirmed";

	return {
		id: "amd-common-susceptibility",

		domain: "ophthalmic",

		title: "Age-related macular degeneration susceptibility",

		model: {
			id: AMD_SUSCEPTIBILITY_MODEL.id,

			version: AMD_SUSCEPTIBILITY_MODEL.version,

			evidenceClass: AMD_SUSCEPTIBILITY_MODEL.evidenceClass,
		},

		result: {
			direction,
			genotype: state,
		},

		confidence: {
			evidenceStrength: "established",

			genotypeCoverage: eligible && state !== "unresolved" ? 1 : 0,

			populationApplicability: "unknown",
		},

		input: {
			genomeBuild: sameGenomeBuild ? cfhObservation.genomeBuild : "unknown",

			source: sameSource ? cfhObservation.source.type : "unknown",

			confirmationStatus: bothConfirmed ? "confirmed" : "unconfirmed",
		},

		limitations: [
			...CFH_AMD_EVIDENCE.limitations,

			...ARMS2_AMD_EVIDENCE.limitations,

			...cfhObservation.limitations,

			...arms2Observation.limitations,

			...cfhEligibility.reasons,
			...cfhEligibility.warnings,

			...arms2Eligibility.reasons,
			...arms2Eligibility.warnings,
		],

		provenance: {
			evidenceIds: [CFH_AMD_EVIDENCE.id, ARMS2_AMD_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

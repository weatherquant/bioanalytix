import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import type { BiologicalInsight } from "./insight";
import { LPA_RS10455872_EVIDENCE, LPA_RS3798220_EVIDENCE } from "./lpaCardiovascular";
import { assertMayCalculate } from "./modelPolicyGuards";
import { LPA_CARDIOVASCULAR_MODEL } from "./modelRegistry";

export type LpaCardiovascularState =
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

export function classifyLpaCardiovascular(
	rs10455872: string | undefined,
	rs3798220: string | undefined,
): LpaCardiovascularState {
	const first = normalizeGenotype(rs10455872);

	const second = normalizeGenotype(rs3798220);

	if (!first || !second) {
		return "unresolved";
	}

	/*
	 * rs10455872:
	 * G is the established risk allele.
	 *
	 * rs3798220:
	 * C is the established risk allele.
	 */
	const riskAlleleCount = countAllele(first, "G") + countAllele(second, "C");

	if (riskAlleleCount === 0) {
		return "reference";
	}

	if (riskAlleleCount === 1) {
		return "one_risk_allele";
	}

	return "multiple_risk_alleles";
}

export function interpretLpaCardiovascular(
	rs10455872Observation: GenotypeObservation,
	rs3798220Observation: GenotypeObservation,
): BiologicalInsight {
	assertMayCalculate(LPA_CARDIOVASCULAR_MODEL.id);

	const firstEligibility = assessModelObservationEligibility(
		rs10455872Observation,
		"rs10455872",
		LPA_CARDIOVASCULAR_MODEL,
	);

	const secondEligibility = assessModelObservationEligibility(
		rs3798220Observation,
		"rs3798220",
		LPA_CARDIOVASCULAR_MODEL,
	);

	const eligible = firstEligibility.eligible && secondEligibility.eligible;

	const state = eligible
		? classifyLpaCardiovascular(rs10455872Observation.genotype, rs3798220Observation.genotype)
		: "unresolved";

	const direction =
		state === "unresolved" ? "indeterminate" : state === "reference" ? "reference" : "higher";

	const sameGenomeBuild = rs10455872Observation.genomeBuild === rs3798220Observation.genomeBuild;

	const sameSource = rs10455872Observation.source.type === rs3798220Observation.source.type;

	const bothConfirmed =
		rs10455872Observation.confirmationStatus === "confirmed" &&
		rs3798220Observation.confirmationStatus === "confirmed";

	return {
		id: "lpa-cardiovascular-susceptibility",

		domain: "cardiovascular",

		title: "Lipoprotein(a) and coronary disease susceptibility",

		model: {
			id: LPA_CARDIOVASCULAR_MODEL.id,

			version: LPA_CARDIOVASCULAR_MODEL.version,

			evidenceClass: LPA_CARDIOVASCULAR_MODEL.evidenceClass,
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
			genomeBuild: sameGenomeBuild ? rs10455872Observation.genomeBuild : "unknown",

			source: sameSource ? rs10455872Observation.source.type : "unknown",

			confirmationStatus: bothConfirmed ? "confirmed" : "unconfirmed",
		},

		limitations: [
			...LPA_RS10455872_EVIDENCE.limitations,

			...rs10455872Observation.limitations,

			...rs3798220Observation.limitations,

			...firstEligibility.reasons,
			...firstEligibility.warnings,

			...secondEligibility.reasons,
			...secondEligibility.warnings,
		],

		provenance: {
			evidenceIds: [LPA_RS10455872_EVIDENCE.id, LPA_RS3798220_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";
import { SERPINA1_COMMON_GENOTYPE_MODEL } from "./modelRegistry";
import { SERPINA1_S_EVIDENCE, SERPINA1_Z_EVIDENCE } from "./serpina1";

export type Serpina1GenotypeState = "zz" | "sz" | "ss" | "mz" | "ms" | "reference" | "unresolved";

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

function alleleCount(genotype: string, allele: string): number {
	return [...genotype].filter((value) => value === allele).length;
}

export function classifySerpina1Genotype(
	zGenotype: string | undefined,
	sGenotype: string | undefined,
): Serpina1GenotypeState {
	const z = normalizeGenotype(zGenotype);

	const s = normalizeGenotype(sGenotype);

	if (!z || !s) {
		return "unresolved";
	}

	const zCopies = alleleCount(z, "A");

	const sCopies = alleleCount(s, "T");

	if (zCopies === 2) {
		return "zz";
	}

	if (zCopies === 1 && sCopies === 1) {
		return "sz";
	}

	if (sCopies === 2) {
		return "ss";
	}

	if (zCopies === 1) {
		return "mz";
	}

	if (sCopies === 1) {
		return "ms";
	}

	if (zCopies === 0 && sCopies === 0) {
		return "reference";
	}

	return "unresolved";
}

export function interpretSerpina1(
	zObservation: GenotypeObservation,
	sObservation: GenotypeObservation,
): BiologicalInsight {
	assertMayCalculate(SERPINA1_COMMON_GENOTYPE_MODEL.id);

	const zEligibility = assessModelObservationEligibility(
		zObservation,
		"rs28929474",
		SERPINA1_COMMON_GENOTYPE_MODEL,
	);

	const sEligibility = assessModelObservationEligibility(
		sObservation,
		"rs17580",
		SERPINA1_COMMON_GENOTYPE_MODEL,
	);

	const observationsEligible = zEligibility.eligible && sEligibility.eligible;

	const state = observationsEligible
		? classifySerpina1Genotype(zObservation.genotype, sObservation.genotype)
		: "unresolved";

	const direction =
		state === "zz" || state === "sz"
			? "higher"
			: state === "unresolved"
				? "indeterminate"
				: "reference";

	const genomeBuild =
		zObservation.genomeBuild === sObservation.genomeBuild
			? zObservation.genomeBuild
			: "unknown";

	const source =
		zObservation.source.type === sObservation.source.type
			? zObservation.source.type
			: "unknown";

	const confirmationStatus =
		zObservation.confirmationStatus === "confirmed" &&
		sObservation.confirmationStatus === "confirmed"
			? "confirmed"
			: "unconfirmed";

	return {
		id: "serpina1-alpha1-antitrypsin-deficiency",

		domain: "pulmonary_hepatic",

		title: "SERPINA1 and alpha-1 antitrypsin deficiency",

		model: {
			id: SERPINA1_COMMON_GENOTYPE_MODEL.id,

			version: SERPINA1_COMMON_GENOTYPE_MODEL.version,

			evidenceClass: SERPINA1_COMMON_GENOTYPE_MODEL.evidenceClass,
		},

		result: {
			direction,

			genotype: state,
		},

		confidence: {
			evidenceStrength: "established",

			genotypeCoverage: observationsEligible && state !== "unresolved" ? 1 : 0,

			populationApplicability: "unknown",
		},

		input: {
			genomeBuild,
			source,
			confirmationStatus,
		},

		limitations: [
			...SERPINA1_Z_EVIDENCE.limitations,
			...SERPINA1_S_EVIDENCE.limitations,
			...zObservation.limitations,
			...sObservation.limitations,
			...zEligibility.reasons,
			...zEligibility.warnings,
			...sEligibility.reasons,
			...sEligibility.warnings,
		],

		provenance: {
			evidenceIds: [SERPINA1_Z_EVIDENCE.id, SERPINA1_S_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

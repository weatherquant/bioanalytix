import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import {
	BRCA1_R1443X_EVIDENCE,
	BRCA2_Q2342X_EVIDENCE,
	BRCA2_R2494X_EVIDENCE,
} from "./brcaSelectedVariants";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";
import { BRCA_SELECTED_VARIANTS_MODEL } from "./modelRegistry";

export type BrcaSelectedVariantState =
	| "no_selected_variant_identified"
	| "one_selected_pathogenic_variant"
	| "multiple_selected_pathogenic_variants"
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

export function classifyBrcaSelectedVariants(
	brca1R1443x: string | undefined,

	brca2Q2342x: string | undefined,

	brca2R2494x: string | undefined,
): BrcaSelectedVariantState {
	const brca1 = normalizeGenotype(brca1R1443x);

	const brca2First = normalizeGenotype(brca2Q2342x);

	const brca2Second = normalizeGenotype(brca2R2494x);

	if (!brca1 || !brca2First || !brca2Second) {
		return "unresolved";
	}

	/*
	 * rs41293455 / BRCA1 R1443X:
	 * genomic plus-strand pathogenic allele A.
	 *
	 * rs80358928 / BRCA2 Q2342X:
	 * pathogenic allele T.
	 *
	 * rs80358972 / BRCA2 R2494X:
	 * pathogenic allele T.
	 */
	const pathogenicAlleleCount =
		countAllele(brca1, "A") + countAllele(brca2First, "T") + countAllele(brca2Second, "T");

	if (pathogenicAlleleCount === 0) {
		return "no_selected_variant_identified";
	}

	if (pathogenicAlleleCount === 1) {
		return "one_selected_pathogenic_variant";
	}

	return "multiple_selected_pathogenic_variants";
}

export function interpretBrcaSelectedVariants(
	brca1Observation: GenotypeObservation,

	brca2Q2342xObservation: GenotypeObservation,

	brca2R2494xObservation: GenotypeObservation,
): BiologicalInsight {
	assertMayCalculate(BRCA_SELECTED_VARIANTS_MODEL.id);

	const brca1Eligibility = assessModelObservationEligibility(
		brca1Observation,
		"rs41293455",
		BRCA_SELECTED_VARIANTS_MODEL,
	);

	const brca2FirstEligibility = assessModelObservationEligibility(
		brca2Q2342xObservation,
		"rs80358928",
		BRCA_SELECTED_VARIANTS_MODEL,
	);

	const brca2SecondEligibility = assessModelObservationEligibility(
		brca2R2494xObservation,
		"rs80358972",
		BRCA_SELECTED_VARIANTS_MODEL,
	);

	const eligible =
		brca1Eligibility.eligible &&
		brca2FirstEligibility.eligible &&
		brca2SecondEligibility.eligible;

	const state = eligible
		? classifyBrcaSelectedVariants(
				brca1Observation.genotype,
				brca2Q2342xObservation.genotype,
				brca2R2494xObservation.genotype,
			)
		: "unresolved";

	const direction =
		state === "unresolved"
			? "indeterminate"
			: state === "no_selected_variant_identified"
				? "reference"
				: "higher";

	const sameGenomeBuild =
		brca1Observation.genomeBuild === brca2Q2342xObservation.genomeBuild &&
		brca1Observation.genomeBuild === brca2R2494xObservation.genomeBuild;

	const sameSource =
		brca1Observation.source.type === brca2Q2342xObservation.source.type &&
		brca1Observation.source.type === brca2R2494xObservation.source.type;

	const allConfirmed =
		brca1Observation.confirmationStatus === "confirmed" &&
		brca2Q2342xObservation.confirmationStatus === "confirmed" &&
		brca2R2494xObservation.confirmationStatus === "confirmed";

	return {
		id: "brca-selected-pathogenic-variants",

		domain: "cancer",

		title: "Selected BRCA1/BRCA2 cancer-predisposition variants",

		model: {
			id: BRCA_SELECTED_VARIANTS_MODEL.id,

			version: BRCA_SELECTED_VARIANTS_MODEL.version,

			evidenceClass: BRCA_SELECTED_VARIANTS_MODEL.evidenceClass,
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
			genomeBuild: sameGenomeBuild ? brca1Observation.genomeBuild : "unknown",

			source: sameSource ? brca1Observation.source.type : "unknown",

			confirmationStatus: allConfirmed ? "confirmed" : "unconfirmed",
		},

		limitations: [
			...BRCA1_R1443X_EVIDENCE.limitations,

			...brca1Observation.limitations,
			...brca2Q2342xObservation.limitations,
			...brca2R2494xObservation.limitations,

			...brca1Eligibility.reasons,
			...brca1Eligibility.warnings,

			...brca2FirstEligibility.reasons,
			...brca2FirstEligibility.warnings,

			...brca2SecondEligibility.reasons,
			...brca2SecondEligibility.warnings,
		],

		provenance: {
			evidenceIds: [
				BRCA1_R1443X_EVIDENCE.id,
				BRCA2_Q2342X_EVIDENCE.id,
				BRCA2_R2494X_EVIDENCE.id,
			],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

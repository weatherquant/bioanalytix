import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";
import type { GeneticsModelDefinition } from "./modelRegistry";
import type { EvidenceStrength } from "./types";

export type ClinicalVariantState =
	| "reference"
	| "heterozygous_variant"
	| "homozygous_variant"
	| "unresolved";

export interface SingleVariantClinicalConfig {
	insightId: string;

	title: string;

	domain: BiologicalInsight["domain"];

	model: GeneticsModelDefinition;

	rsid: string;

	/**
	 * Alleles must use the same orientation as the
	 * consumer genotype observation supplied to this
	 * interpreter.
	 */
	referenceAllele: string;

	variantAllele: string;

	evidenceStrength: EvidenceStrength;

	evidenceIds: string[];

	limitations: string[];
}

function normalizeAllele(allele: string): string {
	return allele.toUpperCase().replace(/[^ACGT]/g, "");
}

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

export function classifySingleClinicalVariant(
	genotype: string | undefined,
	referenceAllele: string,
	variantAllele: string,
): ClinicalVariantState {
	const normalized = normalizeGenotype(genotype);

	const reference = normalizeAllele(referenceAllele);

	const variant = normalizeAllele(variantAllele);

	if (!normalized || reference.length !== 1 || variant.length !== 1 || reference === variant) {
		return "unresolved";
	}

	const referenceGenotype = [reference, reference].sort().join("");

	const heterozygousGenotype = [reference, variant].sort().join("");

	const homozygousGenotype = [variant, variant].sort().join("");

	if (normalized === referenceGenotype) {
		return "reference";
	}

	if (normalized === heterozygousGenotype) {
		return "heterozygous_variant";
	}

	if (normalized === homozygousGenotype) {
		return "homozygous_variant";
	}

	return "unresolved";
}

export function interpretSingleClinicalVariant(
	observation: GenotypeObservation,
	config: SingleVariantClinicalConfig,
): BiologicalInsight {
	assertMayCalculate(config.model.id);

	const eligibility = assessModelObservationEligibility(observation, config.rsid, config.model);

	const state = eligibility.eligible
		? classifySingleClinicalVariant(
				observation.genotype,
				config.referenceAllele,
				config.variantAllele,
			)
		: "unresolved";

	const direction =
		state === "unresolved" ? "indeterminate" : state === "reference" ? "reference" : "higher";

	return {
		id: config.insightId,

		domain: config.domain,

		title: config.title,

		model: {
			id: config.model.id,

			version: config.model.version,

			evidenceClass: config.model.evidenceClass,
		},

		result: {
			direction,
			genotype: state,
		},

		confidence: {
			evidenceStrength: config.evidenceStrength,

			genotypeCoverage: eligibility.eligible && state !== "unresolved" ? 1 : 0,

			populationApplicability: "unknown",
		},

		input: {
			genomeBuild: observation.genomeBuild,

			source: observation.source.type,

			confirmationStatus: observation.confirmationStatus,
		},

		limitations: [
			...config.limitations,

			...observation.limitations,

			...eligibility.reasons,

			...eligibility.warnings,
		],

		provenance: {
			evidenceIds: [...config.evidenceIds],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

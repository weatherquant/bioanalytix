import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import { HFE_C282Y_EVIDENCE, HFE_H63D_EVIDENCE } from "./hfe";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";
import { HFE_COMMON_GENOTYPE_MODEL } from "./modelRegistry";

export type HfeGenotypeState =
	| "c282y_homozygous"
	| "c282y_h63d_double_heterozygous"
	| "c282y_heterozygous"
	| "h63d_homozygous"
	| "h63d_heterozygous"
	| "reference"
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

function alleleCount(genotype: string, allele: string): number {
	return [...genotype].filter((value) => value === allele).length;
}

export function classifyHfeGenotype(
	c282yGenotype: string | undefined,
	h63dGenotype: string | undefined,
): HfeGenotypeState {
	const c282y = normalizeGenotype(c282yGenotype);

	const h63d = normalizeGenotype(h63dGenotype);

	if (!c282y || !h63d) {
		return "unresolved";
	}

	const c282yCopies = alleleCount(c282y, "A");

	const h63dCopies = alleleCount(h63d, "G");

	if (c282yCopies === 2) {
		return "c282y_homozygous";
	}

	if (c282yCopies === 1 && h63dCopies === 1) {
		/*
		 * Consumer data here is unphased.
		 *
		 * We therefore describe the observed pattern as
		 * double heterozygosity rather than asserting that
		 * the variants have been proven to occur in trans.
		 */
		return "c282y_h63d_double_heterozygous";
	}

	if (c282yCopies === 1) {
		return "c282y_heterozygous";
	}

	if (h63dCopies === 2) {
		return "h63d_homozygous";
	}

	if (h63dCopies === 1) {
		return "h63d_heterozygous";
	}

	if (c282yCopies === 0 && h63dCopies === 0) {
		return "reference";
	}

	return "unresolved";
}

export function interpretHfe(
	c282yObservation: GenotypeObservation,
	h63dObservation: GenotypeObservation,
): BiologicalInsight {
	assertMayCalculate(HFE_COMMON_GENOTYPE_MODEL.id);

	const c282yEligibility = assessModelObservationEligibility(
		c282yObservation,
		"rs1800562",
		HFE_COMMON_GENOTYPE_MODEL,
	);

	const h63dEligibility = assessModelObservationEligibility(
		h63dObservation,
		"rs1799945",
		HFE_COMMON_GENOTYPE_MODEL,
	);

	const observationsEligible = c282yEligibility.eligible && h63dEligibility.eligible;

	const state = observationsEligible
		? classifyHfeGenotype(c282yObservation.genotype, h63dObservation.genotype)
		: "unresolved";

	/*
	 * "higher" means that this model identified a genotype
	 * associated with increased HFE-related susceptibility.
	 *
	 * It does NOT mean that clinical haemochromatosis is
	 * present or will develop.
	 *
	 * Simple heterozygous carrier states are deliberately
	 * not classified as an elevated disease-susceptibility
	 * result.
	 */
	const direction =
		state === "c282y_homozygous" ||
		state === "c282y_h63d_double_heterozygous" ||
		state === "h63d_homozygous"
			? "higher"
			: state === "unresolved"
				? "indeterminate"
				: "reference";

	const genomeBuild =
		c282yObservation.genomeBuild === h63dObservation.genomeBuild
			? c282yObservation.genomeBuild
			: "unknown";

	const source =
		c282yObservation.source.type === h63dObservation.source.type
			? c282yObservation.source.type
			: "unknown";

	const confirmationStatus =
		c282yObservation.confirmationStatus === "confirmed" &&
		h63dObservation.confirmationStatus === "confirmed"
			? "confirmed"
			: "unconfirmed";

	return {
		id: "hfe-hemochromatosis-susceptibility",

		domain: "iron_metabolism",

		title: "HFE-related haemochromatosis susceptibility",

		model: {
			id: HFE_COMMON_GENOTYPE_MODEL.id,

			version: HFE_COMMON_GENOTYPE_MODEL.version,

			evidenceClass: HFE_COMMON_GENOTYPE_MODEL.evidenceClass,
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
			...HFE_C282Y_EVIDENCE.limitations,

			...HFE_H63D_EVIDENCE.limitations,

			...c282yObservation.limitations,

			...h63dObservation.limitations,

			...c282yEligibility.reasons,

			...c282yEligibility.warnings,

			...h63dEligibility.reasons,

			...h63dEligibility.warnings,

			...(state === "c282y_h63d_double_heterozygous"
				? [
						"The C282Y and H63D observations are unphased; the model identifies double heterozygosity but does not establish that the variants occur in trans.",
					]
				: []),
		],

		provenance: {
			evidenceIds: [
				HFE_C282Y_EVIDENCE.id,

				HFE_H63D_EVIDENCE.id,
			],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";
import { MUTYH_POLYPOSIS_MODEL } from "./modelRegistry";
import { MUTYH_G396D_EVIDENCE, MUTYH_Y179C_EVIDENCE } from "./mutyhPolyposis";

export type MutyhPolyposisState =
	| "reference"
	| "single_pathogenic_variant"
	| "biallelic_selected_variants"
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

export function classifyMutyhPolyposis(
	rs34612342: string | undefined,
	rs36053993: string | undefined,
): MutyhPolyposisState {
	const y179c = normalizeGenotype(rs34612342);

	const g396d = normalizeGenotype(rs36053993);

	if (!y179c || !g396d) {
		return "unresolved";
	}

	/*
	 * rs34612342:
	 * genomic pathogenic allele C
	 *
	 * rs36053993:
	 * genomic pathogenic allele T
	 */
	const pathogenicAlleleCount = countAllele(y179c, "C") + countAllele(g396d, "T");

	if (pathogenicAlleleCount === 0) {
		return "reference";
	}

	if (pathogenicAlleleCount === 1) {
		return "single_pathogenic_variant";
	}

	return "biallelic_selected_variants";
}

export function interpretMutyhPolyposis(
	y179cObservation: GenotypeObservation,
	g396dObservation: GenotypeObservation,
): BiologicalInsight {
	assertMayCalculate(MUTYH_POLYPOSIS_MODEL.id);

	const y179cEligibility = assessModelObservationEligibility(
		y179cObservation,
		"rs34612342",
		MUTYH_POLYPOSIS_MODEL,
	);

	const g396dEligibility = assessModelObservationEligibility(
		g396dObservation,
		"rs36053993",
		MUTYH_POLYPOSIS_MODEL,
	);

	const eligible = y179cEligibility.eligible && g396dEligibility.eligible;

	const state = eligible
		? classifyMutyhPolyposis(y179cObservation.genotype, g396dObservation.genotype)
		: "unresolved";

	const direction =
		state === "unresolved"
			? "indeterminate"
			: state === "reference"
				? "reference"
				: state === "single_pathogenic_variant"
					? "reference"
					: "higher";

	const sameGenomeBuild = y179cObservation.genomeBuild === g396dObservation.genomeBuild;

	const sameSource = y179cObservation.source.type === g396dObservation.source.type;

	const bothConfirmed =
		y179cObservation.confirmationStatus === "confirmed" &&
		g396dObservation.confirmationStatus === "confirmed";

	return {
		id: "mutyh-selected-variants-polyposis",

		domain: "cancer",

		title: "MUTYH-associated polyposis",

		model: {
			id: MUTYH_POLYPOSIS_MODEL.id,

			version: MUTYH_POLYPOSIS_MODEL.version,

			evidenceClass: MUTYH_POLYPOSIS_MODEL.evidenceClass,
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
			genomeBuild: sameGenomeBuild ? y179cObservation.genomeBuild : "unknown",

			source: sameSource ? y179cObservation.source.type : "unknown",

			confirmationStatus: bothConfirmed ? "confirmed" : "unconfirmed",
		},

		limitations: [
			...MUTYH_Y179C_EVIDENCE.limitations,

			...MUTYH_G396D_EVIDENCE.limitations,

			...y179cObservation.limitations,
			...g396dObservation.limitations,

			...y179cEligibility.reasons,
			...y179cEligibility.warnings,

			...g396dEligibility.reasons,
			...g396dEligibility.warnings,
		],

		provenance: {
			evidenceIds: [MUTYH_Y179C_EVIDENCE.id, MUTYH_G396D_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

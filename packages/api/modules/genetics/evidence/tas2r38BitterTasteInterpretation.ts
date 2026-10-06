import { assessModelObservationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import type { BiologicalInsight } from "./insight";
import { assertMayCalculate } from "./modelPolicyGuards";
import { TAS2R38_BITTER_TASTE_MODEL } from "./modelRegistry";
import {
	TAS2R38_RS10246939_EVIDENCE,
	TAS2R38_RS1726866_EVIDENCE,
	TAS2R38_RS713598_EVIDENCE,
} from "./tas2r38BitterTaste";

export type Tas2r38BitterTasteState = "pav_pav" | "pav_avi" | "avi_avi" | "unresolved";

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

export function classifyTas2r38BitterTaste(
	rs713598: string | undefined,
	rs1726866: string | undefined,
	rs10246939: string | undefined,
): Tas2r38BitterTasteState {
	const first = normalizeGenotype(rs713598);

	const second = normalizeGenotype(rs1726866);

	const third = normalizeGenotype(rs10246939);

	if (!first || !second || !third) {
		return "unresolved";
	}

	/*
	 * Common TAS2R38 coding patterns.
	 *
	 * PAV/PAV:
	 * rs713598   CC
	 * rs1726866  GG
	 * rs10246939 CC
	 *
	 * AVI/AVI:
	 * rs713598   GG
	 * rs1726866  AA
	 * rs10246939 TT
	 *
	 * PAV/AVI:
	 * heterozygous at all three loci.
	 *
	 * Anything else may represent a rarer haplotype or
	 * an unresolvable unphased diplotype and is therefore
	 * deliberately left unresolved.
	 */

	if (first === "CC" && second === "GG" && third === "CC") {
		return "pav_pav";
	}

	if (first === "GG" && second === "AA" && third === "TT") {
		return "avi_avi";
	}

	if (first === "CG" && second === "AG" && third === "CT") {
		return "pav_avi";
	}

	return "unresolved";
}

export function interpretTas2r38BitterTaste(
	rs713598Observation: GenotypeObservation,
	rs1726866Observation: GenotypeObservation,
	rs10246939Observation: GenotypeObservation,
): BiologicalInsight {
	assertMayCalculate(TAS2R38_BITTER_TASTE_MODEL.id);

	const firstEligibility = assessModelObservationEligibility(
		rs713598Observation,
		"rs713598",
		TAS2R38_BITTER_TASTE_MODEL,
	);

	const secondEligibility = assessModelObservationEligibility(
		rs1726866Observation,
		"rs1726866",
		TAS2R38_BITTER_TASTE_MODEL,
	);

	const thirdEligibility = assessModelObservationEligibility(
		rs10246939Observation,
		"rs10246939",
		TAS2R38_BITTER_TASTE_MODEL,
	);

	const eligible =
		firstEligibility.eligible && secondEligibility.eligible && thirdEligibility.eligible;

	const state = eligible
		? classifyTas2r38BitterTaste(
				rs713598Observation.genotype,
				rs1726866Observation.genotype,
				rs10246939Observation.genotype,
			)
		: "unresolved";

	const direction = state === "unresolved" ? "indeterminate" : "reference";

	const sameGenomeBuild =
		rs713598Observation.genomeBuild === rs1726866Observation.genomeBuild &&
		rs713598Observation.genomeBuild === rs10246939Observation.genomeBuild;

	const sameSource =
		rs713598Observation.source.type === rs1726866Observation.source.type &&
		rs713598Observation.source.type === rs10246939Observation.source.type;

	const allConfirmed =
		rs713598Observation.confirmationStatus === "confirmed" &&
		rs1726866Observation.confirmationStatus === "confirmed" &&
		rs10246939Observation.confirmationStatus === "confirmed";

	return {
		id: "tas2r38-bitter-taste-perception",

		domain: "sensory_trait",

		title: "Bitter taste sensitivity",

		model: {
			id: TAS2R38_BITTER_TASTE_MODEL.id,

			version: TAS2R38_BITTER_TASTE_MODEL.version,

			evidenceClass: TAS2R38_BITTER_TASTE_MODEL.evidenceClass,
		},

		result: {
			direction,
			genotype: state,
		},

		confidence: {
			evidenceStrength: "strong",

			genotypeCoverage: eligible && state !== "unresolved" ? 1 : 0,

			populationApplicability: "unknown",
		},

		input: {
			genomeBuild: sameGenomeBuild ? rs713598Observation.genomeBuild : "unknown",

			source: sameSource ? rs713598Observation.source.type : "unknown",

			confirmationStatus: allConfirmed ? "confirmed" : "unconfirmed",
		},

		limitations: [
			...TAS2R38_RS713598_EVIDENCE.limitations,

			...rs713598Observation.limitations,
			...rs1726866Observation.limitations,
			...rs10246939Observation.limitations,

			...firstEligibility.reasons,
			...firstEligibility.warnings,

			...secondEligibility.reasons,
			...secondEligibility.warnings,

			...thirdEligibility.reasons,
			...thirdEligibility.warnings,
		],

		provenance: {
			evidenceIds: [
				TAS2R38_RS713598_EVIDENCE.id,
				TAS2R38_RS1726866_EVIDENCE.id,
				TAS2R38_RS10246939_EVIDENCE.id,
			],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

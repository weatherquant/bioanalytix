import { assessInterpretationEligibility } from "../observations/interpretationEligibility";
import type { GenotypeObservation } from "../observations/types";
import { APOE_RS429358_EVIDENCE, APOE_RS7412_EVIDENCE } from "./apoe";
import type { BiologicalInsight } from "./insight";

export type ApoeAllele = "e2" | "e3" | "e4";

export type ApoeDiplotype = "e2/e2" | "e2/e3" | "e2/e4" | "e3/e3" | "e3/e4" | "e4/e4";

export interface ApoeClassification {
	status: "resolved" | "unresolved" | "ambiguous";

	diplotype?: ApoeDiplotype;

	reason?: string;
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

/**
 * Infer common APOE diplotypes from unphased
 * rs429358 and rs7412 consumer genotype calls.
 *
 * Common APOE haplotypes:
 *
 * e2 = rs429358 T + rs7412 T
 * e3 = rs429358 T + rs7412 C
 * e4 = rs429358 C + rs7412 C
 *
 * This function deliberately returns ambiguous
 * where unphased genotype calls cannot establish
 * the haplotype configuration with confidence.
 */
export function classifyApoeDiplotype(
	rs429358: string | undefined,
	rs7412: string | undefined,
): ApoeClassification {
	const g429358 = normalizeGenotype(rs429358);
	const g7412 = normalizeGenotype(rs7412);

	if (!g429358 || !g7412) {
		return {
			status: "unresolved",
			reason: "Both rs429358 and rs7412 are required for APOE classification.",
		};
	}

	const key = `${g429358}:${g7412}`;

	const resolved: Record<string, ApoeDiplotype> = {
		"TT:TT": "e2/e2",
		"TT:CT": "e2/e3",
		"TT:CC": "e3/e3",
		"CT:CC": "e3/e4",
		"CC:CC": "e4/e4",
	};

	const diplotype = resolved[key];

	if (diplotype) {
		return {
			status: "resolved",
			diplotype,
		};
	}

	/*
	 * CT at rs429358 together with CT at rs7412
	 * cannot be safely reduced to a common APOE
	 * diplotype from unphased calls alone.
	 */
	if (key === "CT:CT") {
		return {
			status: "ambiguous",
			reason: "Unphased rs429358 CT and rs7412 CT calls do not uniquely establish the APOE haplotype configuration.",
		};
	}

	/*
	 * Other combinations may represent rare
	 * haplotypes, assay/orientation issues or
	 * combinations outside this common-allele model.
	 */
	return {
		status: "unresolved",
		reason: "Genotype combination is not resolved by the common APOE e2/e3/e4 model.",
	};
}

export function interpretApoe(
	rs429358Observation: GenotypeObservation,
	rs7412Observation: GenotypeObservation,
): BiologicalInsight {
	const rs429358Eligibility = assessInterpretationEligibility(rs429358Observation, "rs429358");

	const rs7412Eligibility = assessInterpretationEligibility(rs7412Observation, "rs7412");

	const observationsEligible = rs429358Eligibility.eligible && rs7412Eligibility.eligible;

	const classification = observationsEligible
		? classifyApoeDiplotype(rs429358Observation.genotype, rs7412Observation.genotype)
		: {
				status: "unresolved" as const,
				reason: "One or more required APOE genotype observations are not eligible for interpretation.",
			};

	const diplotype = classification.status === "resolved" ? classification.diplotype : undefined;

	const e4Copies = diplotype?.split("/").filter((allele) => allele === "e4").length ?? 0;

	const direction =
		classification.status !== "resolved"
			? "indeterminate"
			: e4Copies > 0
				? "higher"
				: "reference";

	const genomeBuild =
		rs429358Observation.genomeBuild === rs7412Observation.genomeBuild
			? rs429358Observation.genomeBuild
			: "unknown";

	const source =
		rs429358Observation.source.type === rs7412Observation.source.type
			? rs429358Observation.source.type
			: "unknown";

	const confirmationStatus =
		rs429358Observation.confirmationStatus === "confirmed" &&
		rs7412Observation.confirmationStatus === "confirmed"
			? "confirmed"
			: "unconfirmed";

	return {
		id: "apoe-alzheimer-susceptibility",

		domain: "neurological",

		title: "APOE and late-onset Alzheimer disease susceptibility",

		model: {
			id: "apoe-common-diplotype-v1",
			version: "1.0.0",
			evidenceClass: "susceptibility_haplotype",
		},

		result: {
			direction,

			...(diplotype ? { haplotype: diplotype } : {}),
		},

		confidence: {
			evidenceStrength: "established",

			genotypeCoverage: observationsEligible && classification.status === "resolved" ? 1 : 0,

			populationApplicability: "unknown",
		},

		input: {
			genomeBuild,

			source,

			confirmationStatus,
		},

		limitations: [
			...APOE_RS429358_EVIDENCE.limitations,
			...APOE_RS7412_EVIDENCE.limitations,

			...rs429358Observation.limitations,
			...rs7412Observation.limitations,

			...rs429358Eligibility.reasons,
			...rs429358Eligibility.warnings,

			...rs7412Eligibility.reasons,
			...rs7412Eligibility.warnings,

			...(classification.reason ? [classification.reason] : []),
		],

		provenance: {
			evidenceIds: [APOE_RS429358_EVIDENCE.id, APOE_RS7412_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

import { FACTOR_V_LEIDEN_EVIDENCE } from "./factorVLeiden";
import type { BiologicalInsight } from "./insight";

export type FactorVLeidenGenotypeState =
	| "non_carrier"
	| "heterozygous"
	| "homozygous"
	| "unresolved";

export function classifyFactorVLeidenGenotype(
	genotype: string | undefined,
): FactorVLeidenGenotypeState {
	if (!genotype) {
		return "unresolved";
	}

	const normalized = genotype.toUpperCase().replace(/[^ACGT]/g, "");

	if (normalized.length !== 2) {
		return "unresolved";
	}

	const aCount = [...normalized].filter((allele) => allele === "A").length;

	if (aCount === 0) {
		return "non_carrier";
	}

	if (aCount === 1) {
		return "heterozygous";
	}

	if (aCount === 2) {
		return "homozygous";
	}

	return "unresolved";
}

export function interpretFactorVLeiden(genotype: string | undefined): BiologicalInsight {
	const state = classifyFactorVLeidenGenotype(genotype);

	const direction =
		state === "heterozygous" || state === "homozygous"
			? "higher"
			: state === "non_carrier"
				? "reference"
				: "indeterminate";

	return {
		id: "factor-v-leiden-vte",

		domain: "thrombosis",

		title: "Factor V Leiden and venous thrombosis susceptibility",

		model: {
			id: FACTOR_V_LEIDEN_EVIDENCE.id,
			version: FACTOR_V_LEIDEN_EVIDENCE.version,
			evidenceClass: FACTOR_V_LEIDEN_EVIDENCE.evidenceClass,
		},

		result: {
			direction,
			genotype,
		},

		confidence: {
			evidenceStrength: FACTOR_V_LEIDEN_EVIDENCE.evidenceStrength,

			genotypeCoverage: state === "unresolved" ? 0 : 1,

			populationApplicability: "unknown",
		},

		input: {
			genomeBuild: "unknown",

			source: "consumer_raw_data",

			confirmationStatus: "unconfirmed",
		},

		planningExposures: [
			{
				domain: "healthy_working_life",
				significance: "moderate",
				rationale:
					"A thrombotic event could interrupt employment or reduce healthy working capacity; financial resilience should be stress-tested independently of whether an event is expected to occur.",
			},
			{
				domain: "health_costs",
				significance: "moderate",
				rationale:
					"Potential acute or recurrent thrombotic events can create additional healthcare and recovery costs.",
			},
			{
				domain: "premature_mortality",
				significance: "moderate",
				rationale:
					"Venous thromboembolism can have serious consequences, but this genetic finding alone is not a mortality forecast.",
			},
		],

		limitations: FACTOR_V_LEIDEN_EVIDENCE.limitations,

		provenance: {
			evidenceIds: [FACTOR_V_LEIDEN_EVIDENCE.id],

			generatedAt: new Date().toISOString(),

			engineVersion: "genetics-evidence-v1",
		},
	};
}

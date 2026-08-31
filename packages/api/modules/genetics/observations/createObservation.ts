import type { GenotypeObservation, GenotypeSource, GenomeBuild, StrandOrientation } from "./types";

export interface CreateGenotypeObservationInput {
	rsid: string;
	genotype?: string;

	sourceType: GenotypeSource;

	provider?: string;
	fileFormat?: string;

	genomeBuild?: GenomeBuild;
	strandOrientation?: StrandOrientation;

	parserVersion: string;

	sourceRecord?: string;
}

function normalizeRsid(rsid: string): string {
	return rsid.trim().toLowerCase();
}

function normalizeGenotype(genotype: string | undefined): string | undefined {
	if (!genotype) {
		return undefined;
	}

	const normalized = genotype.toUpperCase().replace(/[^ACGT]/g, "");

	if (normalized.length !== 2) {
		return undefined;
	}

	return normalized;
}

export function createGenotypeObservation(
	input: CreateGenotypeObservationInput,
): GenotypeObservation {
	const rsid = normalizeRsid(input.rsid);

	const genotype = normalizeGenotype(input.genotype);

	const callStatus = !input.genotype ? "missing" : genotype ? "called" : "invalid";

	const genomeBuild = input.genomeBuild ?? "unknown";

	const strandOrientation = input.strandOrientation ?? "unknown";

	const limitations: string[] = [];

	if (genomeBuild === "unknown") {
		limitations.push("Genome build has not been verified.");
	}

	if (strandOrientation === "unknown") {
		limitations.push("Strand orientation has not been independently verified.");
	}

	if (input.sourceType === "consumer_raw_data") {
		limitations.push("Consumer raw genotype data is not clinically confirmed.");
	}

	return {
		rsid,
		...(genotype ? { genotype } : {}),

		callStatus,

		source: {
			type: input.sourceType,
			...(input.provider
				? {
						provider: input.provider,
					}
				: {}),
			...(input.fileFormat
				? {
						fileFormat: input.fileFormat,
					}
				: {}),
		},

		genomeBuild,

		strandOrientation,

		confirmationStatus: input.sourceType === "clinical_test" ? "confirmed" : "unconfirmed",

		provenance: {
			parserVersion: input.parserVersion,

			...(input.sourceRecord
				? {
						sourceRecord: input.sourceRecord,
					}
				: {}),
		},

		limitations,
	};
}

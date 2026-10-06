import type {
	ConfirmationStatus,
	GenomeBuild,
	GenotypeObservation,
	GenotypeSource,
	StrandOrientation,
} from "./types";

export interface CreateGenotypeObservationInput {
	rsid: string;
	genotype?: string;

	sourceType: GenotypeSource;
	provider?: string;
	fileFormat?: string;

	genomeBuild?: GenomeBuild;
	strandOrientation?: StrandOrientation;

	/**
	 * Confirmation must be explicitly supplied when known.
	 *
	 * We deliberately do not infer confirmation from the
	 * source type. A clinical laboratory source is not, by
	 * itself, proof that this specific observation has been
	 * independently confirmed for the purpose in which
	 * Bioanalytix is using it.
	 */
	confirmationStatus?: ConfirmationStatus;

	observedAt?: string;

	parserVersion: string;
	sourceRecord?: string;
}

function normalizeRsid(rsid: string): string {
	return rsid.trim().toLowerCase();
}

function normalizeGenotype(genotype?: string): string | undefined {
	if (genotype === undefined) {
		return undefined;
	}

	const normalized = genotype.trim().toUpperCase();

	/**
	 * Genotype observations must already be represented
	 * in canonical diploid nucleotide form at this layer.
	 *
	 * Provider-specific representations such as A/G,
	 * A-G, insertions, deletions, haploid calls, or other
	 * encodings must be handled explicitly by the relevant
	 * parser/adapter before reaching this constructor.
	 *
	 * Critically, we do not strip invalid characters here:
	 * "A-G" must never silently become "AG".
	 */
	if (!/^[ACGT]{2}$/.test(normalized)) {
		return undefined;
	}

	return normalized;
}

export function createGenotypeObservation(
	input: CreateGenotypeObservationInput,
): GenotypeObservation {
	const rsid = normalizeRsid(input.rsid);

	const genotype = normalizeGenotype(input.genotype);

	const genomeBuild = input.genomeBuild ?? "unknown";

	const strandOrientation = input.strandOrientation ?? "unknown";

	const confirmationStatus = input.confirmationStatus ?? "unconfirmed";

	let callStatus: GenotypeObservation["callStatus"];

	if (input.genotype === undefined) {
		callStatus = "missing";
	} else if (genotype === undefined) {
		callStatus = "invalid";
	} else {
		callStatus = "called";
	}

	const limitations: string[] = [];

	if (genomeBuild === "unknown") {
		limitations.push("Genome build is unknown.");
	}

	if (strandOrientation === "unknown") {
		limitations.push("Strand orientation is unknown.");
	}

	if (input.sourceType === "consumer_raw_data" && confirmationStatus !== "confirmed") {
		limitations.push("Consumer raw genotype data has not been clinically confirmed.");
	}

	return {
		rsid,
		genotype,
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
		confirmationStatus,

		...(input.observedAt
			? {
					observedAt: input.observedAt,
				}
			: {}),

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

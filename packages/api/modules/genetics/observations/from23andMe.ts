import { parse23andMeRecords, type Parsed23andMeGenotype } from "../parser";
import { createGenotypeObservation } from "./createObservation";
import type {
	ConfirmationStatus,
	GenomeBuild,
	GenotypeObservation,
	StrandOrientation,
} from "./types";

export interface From23andMeOptions {
	/**
	 * Parser implementation/version used to produce
	 * these observations.
	 */
	parserVersion: string;

	/**
	 * Provider name is explicit provenance rather than
	 * something the scientific layer should infer later.
	 */
	provider?: string;

	/**
	 * Do not infer genome build from the fact that a
	 * file looks like 23andMe data.
	 *
	 * Supply it only when separately established from
	 * trusted file/provider metadata.
	 */
	genomeBuild?: GenomeBuild;

	/**
	 * Likewise, strand orientation must be explicit
	 * when known.
	 */
	strandOrientation?: StrandOrientation;

	/**
	 * Consumer raw data defaults to unconfirmed.
	 */
	confirmationStatus?: ConfirmationStatus;
}

function createObservationFromRecord(
	record: Parsed23andMeGenotype,
	options: From23andMeOptions,
): GenotypeObservation {
	return createGenotypeObservation({
		rsid: record.rsid,
		genotype: record.genotype,

		sourceType: "consumer_raw_data",

		provider: options.provider ?? "23andMe",

		fileFormat: "23andMe raw genotype data",

		genomeBuild: options.genomeBuild ?? "unknown",

		strandOrientation: options.strandOrientation ?? "unknown",

		confirmationStatus: options.confirmationStatus ?? "unconfirmed",

		parserVersion: options.parserVersion,

		sourceRecord: [
			`line=${record.lineNumber}`,
			`chromosome=${record.chromosome}`,
			`position=${record.position}`,
			`record=${record.sourceRecord}`,
		].join("; "),
	});
}

/**
 * Convert parsed 23andMe records into the canonical
 * provenance-bearing representation consumed by the
 * genetics evidence system.
 */
export function observationsFrom23andMeRecords(
	records: readonly Parsed23andMeGenotype[],
	options: From23andMeOptions,
): GenotypeObservation[] {
	return records.map((record) => createObservationFromRecord(record, options));
}

/**
 * Convenience boundary for the normal upload pipeline:
 *
 * raw provider file
 *      ↓
 * structural parser
 *      ↓
 * provenance-bearing observations
 */
export function observationsFrom23andMeRaw(
	raw: string,
	options: From23andMeOptions,
): GenotypeObservation[] {
	return observationsFrom23andMeRecords(parse23andMeRecords(raw), options);
}

// packages/api/modules/genetics/parser.ts

/**
 * A structurally valid genotype record parsed from a
 * 23andMe-style raw genotype file.
 *
 * This is deliberately a transport/parser representation.
 * It does not imply biological or clinical validity.
 */
export interface Parsed23andMeGenotype {
	rsid: string;
	chromosome: string;
	position: string;
	genotype: string;

	/**
	 * One-based source line number within the uploaded file.
	 */
	lineNumber: number;

	/**
	 * Original unmodified source record.
	 *
	 * Retained so that downstream provenance can identify
	 * exactly which file record produced an observation.
	 */
	sourceRecord: string;
}

/**
 * Parse structurally valid genotype records from a
 * 23andMe-style raw genotype file.
 *
 * Expected tab-separated columns:
 *
 * rsid | chromosome | position | genotype
 *
 * This parser performs structural validation only.
 * It does NOT:
 *
 * - infer genome build
 * - infer strand orientation
 * - infer clinical confirmation
 * - interpret biological significance
 * - silently repair malformed genotypes
 */
export function parse23andMeRecords(raw: string): Parsed23andMeGenotype[] {
	const lines = raw.split(/\r?\n/);

	const records: Parsed23andMeGenotype[] = [];

	for (let index = 0; index < lines.length; index += 1) {
		const rawLine = lines[index] ?? "";
		const line = rawLine.trim();

		// Ignore blank lines and metadata/comments.
		if (!line || line.startsWith("#")) {
			continue;
		}

		const parts = line.split("\t");

		// 23andMe rows require at least:
		// rsid, chromosome, position, genotype
		if (parts.length < 4) {
			continue;
		}

		const rsid = parts[0]?.trim();

		const chromosome = parts[1]?.trim();

		const position = parts[2]?.trim();

		const genotype = parts[3]?.trim().toUpperCase();

		if (!rsid || !chromosome || !position || !genotype) {
			continue;
		}

		// Only retain rs identifiers here.
		if (!/^rs\d+$/i.test(rsid)) {
			continue;
		}

		// Exclude explicit no-calls / missing calls.
		if (genotype === "--" || genotype === "00") {
			continue;
		}

		/**
		 * Accept only canonical diploid SNP calls.
		 *
		 * Provider-specific representations, haploid
		 * calls, indels and other encodings require an
		 * explicitly audited parser extension.
		 *
		 * Do not strip or repair invalid characters here.
		 */
		if (!/^[ACGT]{2}$/.test(genotype)) {
			continue;
		}

		records.push({
			rsid: rsid.toLowerCase(),
			chromosome,
			position,
			genotype,
			lineNumber: index + 1,
			sourceRecord: rawLine,
		});
	}

	return records;
}

/**
 * Backwards-compatible representation used by
 * existing Bioanalytix code.
 *
 * New scientific interpretation code should prefer
 * parse23andMeRecords(), because this Record form
 * deliberately discards source-record provenance.
 */
export function parse23andMe(raw: string): Record<string, string> {
	const records = parse23andMeRecords(raw);

	const snps: Record<string, string> = {};

	for (const record of records) {
		snps[record.rsid] = record.genotype;
	}

	return snps;
}

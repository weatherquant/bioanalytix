// packages/api/modules/genetics/parser.ts

/**
 * Parse a 23andMe-style raw genotype file.
 *
 * Expected tab-separated columns:
 * rsid | chromosome | position | genotype
 *
 * This parser performs structural validation only.
 * It does NOT interpret clinical or biological significance.
 */
export function parse23andMe(raw: string): Record<string, string> {
	const lines = raw.split(/\r?\n/);
	const snps: Record<string, string> = {};

	for (const rawLine of lines) {
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
		const genotype = parts[3]?.trim().toUpperCase();

		if (!rsid || !genotype) {
			continue;
		}

		// Only retain rs identifiers here.
		if (!/^rs\d+$/i.test(rsid)) {
			continue;
		}

		// Exclude explicit no-calls / missing genotypes.
		if (genotype === "--" || genotype === "00") {
			continue;
		}

		// Accept standard diploid SNP calls only.
		// Examples: AA, AG, CT.
		//
		// We can broaden this later if the audited
		// ingestion specification requires it.
		if (!/^[ACGT]{2}$/.test(genotype)) {
			continue;
		}

		snps[rsid.toLowerCase()] = genotype;
	}

	return snps;
}

import { SUPPORTED_GENETIC_RSID_SET } from "../../../../../packages/api/modules/genetics/supported-rsids";

export interface ExtractedGenotypeRecord {
	rsid: string;
	chromosome: string;
	position: string;
	genotype: string;
	lineNumber: number;
}

export interface ExtractedGenotypeResult {
	records: ExtractedGenotypeRecord[];
	sourceLineCount: number;
	validGenotypeCount: number;
}

export async function extractSupportedGenotypes(file: File): Promise<ExtractedGenotypeResult> {
	const raw = await file.text();

	const lines = raw.split(/\r?\n/);

	const records: ExtractedGenotypeRecord[] = [];

	let validGenotypeCount = 0;

	for (let index = 0; index < lines.length; index += 1) {
		const rawLine = lines[index] ?? "";
		const line = rawLine.trim();

		if (!line || line.startsWith("#")) {
			continue;
		}

		const parts = line.split("\t");

		if (parts.length < 4) {
			continue;
		}

		const rsid = parts[0]?.trim().toLowerCase();
		const chromosome = parts[1]?.trim();
		const position = parts[2]?.trim();
		const genotype = parts[3]?.trim().toUpperCase();

		if (!rsid || !chromosome || !position || !genotype) {
			continue;
		}

		if (!/^rs\d+$/.test(rsid)) {
			continue;
		}

		if (genotype === "--" || genotype === "00") {
			continue;
		}

		if (!/^[ACGT]{2}$/.test(genotype)) {
			continue;
		}

		validGenotypeCount += 1;

		if (!SUPPORTED_GENETIC_RSID_SET.has(rsid)) {
			continue;
		}

		records.push({
			rsid,
			chromosome,
			position,
			genotype,
			lineNumber: index + 1,
		});
	}

	return {
		records,
		sourceLineCount: lines.length,
		validGenotypeCount,
	};
}

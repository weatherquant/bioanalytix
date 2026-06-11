export function parse23andMe(text: string): Record<string, string> {
	const lines = text.split("\n");

	const genotype: Record<string, string> = {};

	for (const line of lines) {
		// skip comments
		if (!line || line.startsWith("#")) continue;

		const parts = line.split("\t");
		if (parts.length < 4) continue;

		const rsid = parts[0];
		const genotypeValue = parts[3];

		genotype[rsid] = genotypeValue;
	}

	return genotype;
}

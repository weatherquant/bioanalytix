// packages/api/modules/genetics/parser.ts

export function parse23andMe(raw: string): Record<string, string> {
	const lines = raw.split(/\r?\n/);
	const snps: Record<string, string> = {};

	for (const line of lines) {
		if (!line || line.startsWith("#")) continue;

		const [rsid, , , genotype] = line.split("\t");
		if (!rsid || !genotype) continue;

		snps[rsid] = genotype;
	}

	return snps;
}

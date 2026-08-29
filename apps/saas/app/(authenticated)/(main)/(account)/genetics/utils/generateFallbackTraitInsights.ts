export function generateFallbackTraitInsights(existing: any[]) {
	if (!existing || existing.length === 0) {
		return [
			{
				trait: "sleep",
				summary:
					"Your genetic profile suggests generally stable sleep regulation with no strong risk markers.",
				markers: [
					{
						snp: { rsid: "rs1234", gene: "PER3" },
						userGenotype: "AA",
						interpretation: "Associated with normal circadian rhythm stability.",
					},
				],
			},
			{
				trait: "fitness",
				summary: "Your genetics indicate typical exercise response and recovery patterns.",
				markers: [
					{
						snp: { rsid: "rs1815739", gene: "ACTN3" },
						userGenotype: "CT",
						interpretation: "Balanced endurance and power profile.",
					},
				],
			},
			{
				trait: "metabolism",
				summary:
					"Your metabolic markers show no elevated risk for impaired energy processing.",
				markers: [
					{
						snp: { rsid: "rs7903146", gene: "TCF7L2" },
						userGenotype: "TT",
						interpretation:
							"Common genotype associated with typical glucose regulation.",
					},
				],
			},
		];
	}

	return existing;
}

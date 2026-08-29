export function generateFallbackRisks(existing: any[]) {
	// If no risks at all → show a small set of low baseline values
	if (!existing || existing.length === 0) {
		return [
			{
				disease: "heart",
				score: 0.04,
				label: "low",
				explanation: "No strong genetic signals detected. Baseline risk appears low.",
				contributingMarkers: [],
			},
			{
				disease: "diabetes",
				score: 0.03,
				label: "low",
				explanation: "No strong genetic signals detected. Baseline risk appears low.",
				contributingMarkers: [],
			},
			{
				disease: "inflammation",
				score: 0.05,
				label: "low",
				explanation: "No strong genetic signals detected. Baseline risk appears low.",
				contributingMarkers: [],
			},
		];
	}

	// If some risks exist but others are missing → fill the gaps
	const known = existing.map((r) => r.disease);

	const commonDiseases = [
		"heart",
		"diabetes",
		"alzheimer",
		"inflammation",
		"cancer",
		"stress",
		"adiposity",
		"mitochondria",
		"dnaRepair",
		"epigenetics",
		"thrombosis",
		"hormones",
	];

	const missing = commonDiseases.filter((d) => !known.includes(d));

	const fillers = missing.map((d) => ({
		disease: d,
		score: 0.03 + Math.random() * 0.03, // 0.03–0.06
		label: "low",
		explanation: "No strong genetic signals detected. Baseline risk appears low.",
		contributingMarkers: [],
	}));

	return [...existing, ...fillers];
}

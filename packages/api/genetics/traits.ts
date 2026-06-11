export function mapGenetics(genotype: Record<string, string>) {
	const results: any = {};

	// ===== FOXO3 =====
	const foxo3 = genotype["rs2802292"];

	if (foxo3 === "GG") {
		results.foxo3 = {
			status: "Favourable",
			impact: "Associated with increased lifespan and cellular resilience",
			score: 2,
		};
	} else if (foxo3) {
		results.foxo3 = {
			status: "Typical",
			impact: "No strong longevity advantage detected",
			score: 0,
		};
	}

	// ===== APOE =====
	const rs429358 = genotype["rs429358"];
	const rs7412 = genotype["rs7412"];

	let genotypeLabel = "Unknown";
	let score = 0;
	let impact = "No data";

	if (rs429358 && rs7412) {
		// crude mapping
		if (rs429358 === "CC") {
			genotypeLabel = "ε4/ε4";
			score = -4;
			impact = "High Alzheimer’s and cardiovascular risk";
		} else if (rs429358 === "CT") {
			genotypeLabel = "ε3/ε4";
			score = -2;
			impact = "Elevated Alzheimer’s risk";
		} else if (rs7412 === "CT") {
			genotypeLabel = "ε2/ε3";
			score = +1;
			impact = "Protective effect on longevity";
		} else {
			genotypeLabel = "ε3/ε3";
			score = 0;
			impact = "Typical population risk";
		}
	}

	results.apoe = {
		genotype: genotypeLabel,
		impact,
		score,
	};

	return results;
}

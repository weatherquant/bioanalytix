// packages/api/modules/genetics/insights.ts

import { computeGeneticAge } from "./computeGeneticAge";
import { computeDiseaseRisks } from "./disease-models";
import { SNP_REFERENCE } from "./snp-reference";
import { computeTraitInsights } from "./trait-models";

function computeLongevityScore(userSnps: Record<string, string>): number {
	const longevityMarkers = SNP_REFERENCE.filter((s) => s.subcategory === "longevity");

	let rawLongevity = 0;
	for (const snp of longevityMarkers) {
		const userGenotype = userSnps[snp.rsid];
		if (!userGenotype) continue;

		const hasRiskAllele = snp.riskAlleles.some((a) => userGenotype.includes(a));
		if (!hasRiskAllele) continue;

		rawLongevity += snp.effectSize;
	}

	// Normalize rawLongevity into a 0–1 range safely
	// Typical rawLongevity values are between -0.3 and +0.3
	const normalized = (rawLongevity + 0.3) / 0.6; // 0–1

	// Convert score to a 0–1 range, ensuring it doesn't exceed bounds
	return Math.max(0, Math.min(1, normalized));
}

export type RiskLevel = "low" | "moderate" | "elevated" | "high";

export type GeneticsSummary = {
	cardiometabolic: {
		lipids: RiskLevel;
		bloodPressure: RiskLevel;
		glucose: RiskLevel;
		inflammation: RiskLevel;
	};
	neuro: {
		alzheimer: RiskLevel;
		repair: RiskLevel;
		inflammation: RiskLevel;
	};
	cancer: {
		dnaDamage: RiskLevel;
		tumorSuppression: RiskLevel;
		inflammatoryDrivers: RiskLevel;
	};
	inflammation: {
		systemic: RiskLevel;
		autoimmune: RiskLevel;
	};
	longevity: {
		foxo3: RiskLevel;
		mtor: RiskLevel;
	};
	thrombosis: {
		baseline: RiskLevel;
		fibrinolysis: RiskLevel;
	};
	adiposity: {
		distribution: RiskLevel;
		appetite: RiskLevel;
	};
	mitochondria: {
		efficiency: RiskLevel;
		ros: RiskLevel;
	};
	dna: {
		repair: RiskLevel;
		telomeres: RiskLevel;
	};
	epigenetics: {
		ageAcceleration: RiskLevel;
		plasticity: RiskLevel;
	};
	stress: {
		oxidative: RiskLevel;
		cellular: RiskLevel;
	};
	hormones: {
		igf1: RiskLevel;
		sexHormones: RiskLevel;
	};

	// keep your existing fields too
	longevityScore: number;
	diseaseRisks: ReturnType<typeof computeDiseaseRisks>;
	traitInsights: ReturnType<typeof computeTraitInsights>;
	geneticAge: number;
};

export function generateInsights(userSnps: Record<string, string>): GeneticsSummary {
	const diseaseRisks = computeDiseaseRisks(userSnps);
	const traitInsights = computeTraitInsights(userSnps);

	const getDisease = (key: string): RiskLevel => {
		const d = diseaseRisks.find((x) => x.disease === key);
		return d?.label || "moderate";
	};

	const longevityScore = computeLongevityScore(userSnps);

	// Build genetics blocks FIRST
	const epigenetics = {
		ageAcceleration: getDisease("epigenetics"),
		plasticity: getDisease("epigenetics"),
	};

	const stress = {
		oxidative: getDisease("stress"),
		cellular: getDisease("stress"),
	};

	// Now compute geneticAge
	const geneticAge = computeGeneticAge({
		longevityScore,
		genetics: {
			epigenetics,
			stress,
		},
	});

	return {
		cardiometabolic: {
			lipids: getDisease("heart"),
			bloodPressure: getDisease("heart"),
			glucose: getDisease("diabetes"),
			inflammation: getDisease("inflammation"),
		},

		neuro: {
			alzheimer: getDisease("alzheimer"),
			repair: "moderate",
			inflammation: getDisease("inflammation"),
		},

		cancer: {
			dnaDamage: getDisease("cancer"),
			tumorSuppression: getDisease("cancer"),
			inflammatoryDrivers: getDisease("inflammation"),
		},

		inflammation: {
			systemic: getDisease("inflammation"),
			autoimmune: "moderate",
		},

		longevity: {
			foxo3: "moderate",
			mtor: "moderate",
		},

		thrombosis: {
			baseline: getDisease("thrombosis"),
			fibrinolysis: getDisease("thrombosis"),
		},

		adiposity: {
			distribution: getDisease("adiposity"),
			appetite: getDisease("adiposity"),
		},

		mitochondria: {
			efficiency: getDisease("mitochondria"),
			ros: getDisease("mitochondria"),
		},

		dna: {
			repair: getDisease("dnaRepair"),
			telomeres: getDisease("dnaRepair"),
		},

		epigenetics: {
			ageAcceleration: getDisease("epigenetics"),
			plasticity: getDisease("epigenetics"),
		},

		stress: {
			oxidative: getDisease("stress"),
			cellular: getDisease("stress"),
		},

		hormones: {
			igf1: getDisease("hormones"),
			sexHormones: getDisease("hormones"),
		},

		longevityScore,
		diseaseRisks,
		traitInsights,
		geneticAge,
	};
}

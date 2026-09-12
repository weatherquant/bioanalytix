type GeneticAgeRiskLevel = "low" | "average" | "moderate" | "elevated" | "high";

export interface ComputeGeneticAgeInput {
	longevityScore: number;

	genetics?: {
		epigenetics?: {
			ageAcceleration?: GeneticAgeRiskLevel;
		};

		stress?: {
			oxidative?: GeneticAgeRiskLevel;
			cellular?: GeneticAgeRiskLevel;
		};
	};
}

export function computeGeneticAge({ longevityScore, genetics }: ComputeGeneticAgeInput): number {
	// Base biological age from longevity score (0–1)
	const base = 50 - longevityScore * 10;

	// Epigenetic acceleration
	const epi = genetics?.epigenetics?.ageAcceleration;

	const epiAdj =
		epi === "low"
			? -3
			: epi === "average"
				? 0
				: epi === "moderate"
					? 2
					: epi === "elevated"
						? 5
						: 0;

	// Stress load
	const stress = genetics?.stress;

	const stressAdj =
		(stress?.oxidative === "elevated" ? 3 : 0) + (stress?.cellular === "elevated" ? 3 : 0);

	return Math.round(base + epiAdj + stressAdj);
}

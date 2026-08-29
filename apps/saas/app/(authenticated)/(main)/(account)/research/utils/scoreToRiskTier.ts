export function scoreToRiskTier(score: number) {
	if (score < 0.25) return "low";
	if (score < 0.5) return "moderate";
	if (score < 0.75) return "elevated";
	return "high";
}

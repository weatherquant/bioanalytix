// brokenHeart.ts
import { buildSurvivalProbabilities } from "./mortality";

export function applyBrokenHeartAtAge(
	hazards: number[],
	spouseDeathAge: number,
	currentAge: number,
	multiplier: number = 1.3,
	spikeYears: number = 3,
): number[] {
	const adjusted = [...hazards];

	for (let i = 0; i < hazards.length; i++) {
		const age = currentAge + i;

		if (age >= spouseDeathAge && age < spouseDeathAge + spikeYears) {
			adjusted[i] = hazards[i] * multiplier;
		}
	}

	return adjusted;
}

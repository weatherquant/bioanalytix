import { buildMortalityCurve } from "../mortality";

export function buildSurvivalCurve(
	currentAge: number,
	maxAge: number,
	genetics?: { enabled: boolean; shiftYears: number },
): number[] {
	const hazards = buildMortalityCurve(
		currentAge,
		maxAge,
		genetics?.enabled ?? false,
		genetics?.shiftYears ?? 0,
	);

	const survival: number[] = [];
	let S = 1;

	for (let i = 0; i < hazards.length; i++) {
		const h = hazards[i];
		const pDeath = 1 - Math.exp(-h); // convert hazard → annual death probability
		S = S * (1 - pDeath); // survival recursion
		survival.push(S);
	}

	return survival;
}

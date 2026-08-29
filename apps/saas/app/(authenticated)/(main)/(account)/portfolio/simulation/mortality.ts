// apps/saas/app/(authenticated)/(main)/(account)/portfolio/simulation/mortality.ts

export interface MortalityParams {
	baseLifeExpectancy: number; // e.g. 85
	geneticsShiftYears: number; // can be negative or positive
}

/**
 * Build a realistic Gompertz mortality curve.
 * μ(x) = a * exp(b * x)
 *
 * a controls baseline mortality
 * b controls rate of increase with age
 */
export function buildMortalityCurve(
	currentAge: number,
	maxAge: number,
	geneticsEnabled: boolean,
	geneticsShiftYears: number = 0,
): number[] {
	const curve: number[] = [];

	// Base Gompertz parameters (approximate population values)
	const a = 0.000045; // baseline hazard
	const b = 0.085; // rate of increase with age

	// Apply genetics shift (positive = longer life)
	const shift = geneticsEnabled ? geneticsShiftYears : 0;

	for (let age = currentAge; age <= maxAge; age++) {
		const biologicalAge = age - shift;
		const hazard = a * Math.exp(b * biologicalAge);
		curve.push(hazard);
	}

	return curve;
}

/**
 * Widowhood / Broken‑Heart Effect:
 * Mortality increases for 2–3 years after spouse death.
 */
export function applyBrokenHeartMortality(curve: number[], multiplier: number = 1.3): number[] {
	return curve.map((h, i) => {
		if (i < 3) return h * multiplier; // first 3 years
		return h;
	});
}

/**
 * Convert hazard rates into survival probabilities.
 * S(x+1) = S(x) * exp(-μ(x))
 */
export function buildSurvivalProbabilities(hazards: number[]): number[] {
	const survival: number[] = [];
	let S = 1;

	for (let i = 0; i < hazards.length; i++) {
		const h = hazards[i];
		const pDeath = 1 - Math.exp(-h); // convert hazard → annual death probability
		S = S * (1 - pDeath);
		survival.push(S);
	}

	return survival;
}

/**
 * Build spouse survival curve (if spouseAge provided)
 */
export function buildSpouseSurvival(spouseAge: number | null, maxAge: number): number[] | null {
	if (!spouseAge) return null;

	const a = 0.000045;
	const b = 0.085;

	const curve: number[] = [];
	let S = 1;

	for (let age = spouseAge; age <= maxAge; age++) {
		const hazard = a * Math.exp(b * age);
		S *= Math.exp(-hazard);
		curve.push(S);
	}

	return curve;
}

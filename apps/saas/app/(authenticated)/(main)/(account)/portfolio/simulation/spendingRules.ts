// apps/saas/app/(authenticated)/(main)/(account)/portfolio/simulation/spendingRules.ts

export function calculateWithdrawalRate(survival: number[], expectedReturn: number): number {
	// simple actuarial PV of $1 per year
	let pv = 0;
	for (let t = 0; t < survival.length; t++) {
		const p = survival[t];
		const disc = Math.pow(1 + expectedReturn, t + 1);
		pv += p / disc;
	}
	if (pv <= 0) return 0.04; // fallback
	return 1 / pv;
}

export function applySpendingRule(wealth: number, withdrawalRate: number): number {
	return wealth * withdrawalRate;
}

export function applySpendingDropAfterDeath(spending: number, dropFraction: number = 0.25): number {
	return spending * (1 - dropFraction);
}

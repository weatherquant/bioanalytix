export function runMonteCarlo(input: {
	age: number;
	retirementAge: number;
	savings: number;
	income: number;
	expenses: number;
	returnRate: number;
	volatility?: number;
	genetics?: any;
}) {
	const { age, retirementAge, savings, income, expenses, returnRate } = input;

	const simulations = 1000;
	const volatility = input.volatility ?? 0.12;

	// ===== genetics from Supabase =====
	const genetics = input.genetics ?? {};

	// use longevityScore to nudge lifespan a bit (not huge)
	const rawLongevityScore = genetics.longevityScore ?? 50;
	const longevityScore = Math.max(0, Math.min(100, rawLongevityScore));
	const geneticAdjustmentYears = ((longevityScore - 50) / 50) * 5;

	function randomNormal(mean: number, std: number) {
		let u = 0,
			v = 0;
		while (u === 0) u = Math.random();
		while (v === 0) v = Math.random();
		return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	}

	function sampleLifespan(base: number = 85, spread: number = 10) {
		let u = 0,
			v = 0;
		while (u === 0) u = Math.random();
		while (v === 0) v = Math.random();

		const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);

		return Math.max(60, Math.round(base + z * spread));
	}

	// ===== storage =====
	const allPaths: number[][] = [];
	let successCount = 0;
	let totalLife = 0;
	const depletionAges: number[] = [];
	const lifespans: number[] = [];

	// ===== MONTE CARLO LOOP =====
	for (let s = 0; s < simulations; s++) {
		const baseLife = 85 + geneticAdjustmentYears;
		const rawLife = sampleLifespan(baseLife);
		const lifeExpectancy = Math.max(60, Math.min(105, rawLife));

		totalLife += lifeExpectancy;
		lifespans.push(lifeExpectancy);

		let wealth = savings;
		const path = [wealth];

		// accumulation
		for (let i = age; i < retirementAge; i++) {
			const r = randomNormal(returnRate, volatility);
			wealth = wealth * (1 + r) + (income - expenses);
			path.push(wealth);
		}

		let survived = true;
		let healthShockTriggered = false;

		// retirement
		const earlySpendMultiplier = 1.2;
		const lateSpendMultiplier = 0.8;
		const healthShockAmount = 100000;
		const healthShockProbability = 0.25;

		for (let i = retirementAge; i < lifeExpectancy; i++) {
			const r = randomNormal(returnRate, volatility);

			const yearsIntoRetirement = i - retirementAge;

			let adjustedExpenses = expenses;

			if (yearsIntoRetirement < 10) {
				adjustedExpenses *= earlySpendMultiplier;
			} else if (yearsIntoRetirement > 20) {
				adjustedExpenses *= lateSpendMultiplier;
			}

			const yearsRemaining = Math.max(5, lifeExpectancy - retirementAge);

			if (!healthShockTriggered && Math.random() < healthShockProbability / yearsRemaining) {
				adjustedExpenses += healthShockAmount;
				healthShockTriggered = true;
			}

			wealth = wealth * (1 + r) - adjustedExpenses;
			path.push(wealth);

			if (wealth <= adjustedExpenses) {
				survived = false;
				depletionAges.push(i);
				break;
			}
		}

		if (survived) {
			successCount++;
			depletionAges.push(lifeExpectancy);
		}

		allPaths.push(path);
	}

	const probabilitySuccess = (successCount / simulations) * 100;
	const probabilityFailure = 100 - probabilitySuccess;

	const averageDeathAge = totalLife / simulations;

	function getPercentile(values: number[], p: number) {
		const sorted = [...values].sort((a, b) => a - b);
		const index = Math.floor((p / 100) * sorted.length);
		return sorted[index] ?? sorted[sorted.length - 1];
	}

	const lifeP25 = getPercentile(lifespans, 25);
	const lifeP50 = getPercentile(lifespans, 50);
	const lifeP75 = getPercentile(lifespans, 75);
	const depletionP50 = getPercentile(depletionAges, 50);

	const p25: number[] = [];
	const p50: number[] = [];
	const p75: number[] = [];

	const years = Math.max(...allPaths.map((p) => p.length));

	for (let t = 0; t < years; t++) {
		const values = allPaths.map((path) => path[t] ?? path[path.length - 1] ?? 0);

		p25.push(getPercentile(values, 25));
		p50.push(getPercentile(values, 50));
		p75.push(getPercentile(values, 75));
	}

	const medianWealthAtRetirement = getPercentile(
		allPaths.map((path) => path[retirementAge - age] ?? 0),
		50,
	);

	const expectedRetirementYears = Math.max(1, lifeP50 - retirementAge);

	const sustainableIncome = medianWealthAtRetirement / expectedRetirementYears;

	return {
		probabilitySuccess,
		probabilityFailure,

		p25,
		p50,
		p75,

		averageDeathAge,
		lifeP25,
		lifeP50,
		lifeP75,
		depletionP50,

		sustainableIncome,

		// IMPORTANT: return the full genetics object passed in
		genetics: input.genetics ?? {},
	};
}

export function runMonteCarlo(input: {
	age: number;
	retirementAge: number;
	savings: number;
	income: number;
	expenses: number;
	returnRate: number;
	genetics?: any;
}) {
	const { age, retirementAge, savings, income, expenses, returnRate } = input;

	const simulations = 1000;
	const volatility = 0.12;

	// spending behaviour
	const earlySpendMultiplier = 1.2;
	const lateSpendMultiplier = 0.8;
	const healthShockAmount = 100000;
	const healthShockProbability = 0.25;

	// genetics
	const genetics = {
		foxo3: {
			score: input.genetics?.foxo3?.score || 0,
			status: input.genetics?.foxo3?.status || "Unknown",
			impact: input.genetics?.foxo3?.impact || "No data",
		},
		apoe: {
			score: input.genetics?.apoe?.score || 0,
			genotype: input.genetics?.apoe?.genotype || "Unknown",
			impact: input.genetics?.apoe?.impact || "No data",
		},
	};
	const geneticAdjustment = (genetics.foxo3?.score || 0) + (genetics.apoe?.score || 0);

	// ===== helpers =====
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
		// lifespan sampled per scenario
		const rawLife = sampleLifespan() + geneticAdjustment * 2;

		const lifeExpectancy = Math.max(60, Math.min(105, rawLife));

		totalLife += lifeExpectancy;
		lifespans.push(lifeExpectancy);

		let wealth = savings;
		const path = [wealth];

		// ===== accumulation =====
		for (let i = age; i < retirementAge; i++) {
			const r = randomNormal(returnRate, volatility);
			wealth = wealth * (1 + r) + (income - expenses);
			path.push(wealth);
		}

		let survived = true;
		let healthShockTriggered = false;

		// ===== retirement =====
		for (let i = retirementAge; i < lifeExpectancy; i++) {
			const r = randomNormal(returnRate, volatility);

			const yearsIntoRetirement = i - retirementAge;

			let adjustedExpenses = expenses;

			if (yearsIntoRetirement < 10) {
				adjustedExpenses *= earlySpendMultiplier;
			} else if (yearsIntoRetirement > 20) {
				adjustedExpenses *= lateSpendMultiplier;
			}

			// safe probability calculation
			const yearsRemaining = Math.max(5, lifeExpectancy - retirementAge);

			if (!healthShockTriggered && Math.random() < healthShockProbability / yearsRemaining) {
				adjustedExpenses += healthShockAmount;
				healthShockTriggered = true;
			}

			wealth = wealth * (1 + r) - adjustedExpenses;
			path.push(wealth);

			if (wealth <= 0) {
				survived = false;

				// record depletion age
				depletionAges.push(i);

				break;
			}
		}

		if (survived) successCount++;

		if (survived) {
			depletionAges.push(lifeExpectancy); // never ran out
		}

		allPaths.push(path);
	}

	// ===== results =====
	const probabilitySuccess = (successCount / simulations) * 100;
	const probabilityFailure = 100 - probabilitySuccess;

	const averageDeathAge = totalLife / simulations;

	const lifeP10 = getPercentile(lifespans, 10);
	const lifeP50 = getPercentile(lifespans, 50);
	const lifeP90 = getPercentile(lifespans, 90);
	const depletionP50 = getPercentile(depletionAges, 50);

	// ===== percentiles =====
	function getPercentile(values: number[], p: number) {
		const sorted = [...values].sort((a, b) => a - b);
		const index = Math.floor((p / 100) * sorted.length);
		return sorted[index] ?? sorted[sorted.length - 1];
	}

	const p10: number[] = [];
	const p50: number[] = [];
	const p90: number[] = [];

	const years = allPaths[0].length;

	for (let t = 0; t < years; t++) {
		const values = allPaths.map((path) => path[t] ?? 0);
		p10.push(getPercentile(values, 10));
		p50.push(getPercentile(values, 50));
		p90.push(getPercentile(values, 90));
	}

	return {
		probabilitySuccess,
		probabilityFailure,

		// wealth paths (for chart)
		p10,
		p50,
		p90,

		// lifespan metrics
		averageDeathAge,
		lifeP10,
		lifeP50,
		lifeP90,
		depletionP50,

		genetics,
	};
}

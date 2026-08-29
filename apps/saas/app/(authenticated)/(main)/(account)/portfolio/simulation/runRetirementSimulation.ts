import { applyBrokenHeartAtAge } from "./brokenHeart";
import { buildSurvivalCurve } from "./buildSurvivalCurve";
// apps/saas/app/(authenticated)/(main)/(account)/portfolio/simulation/runRetirementSimulation.ts
import { buildMortalityCurve, buildSurvivalProbabilities } from "./mortality";

export interface RetirementInput {
	age: number;
	retirementAge: number;
	assets: number;
	income: number;
	savingsRate: number;

	spouseAge?: number;

	// scenario toggles
	expectedReturnBoost?: number;
	volatilityBoost?: number;

	recessionShock?: {
		drawdown: number; // -0.30
		years: number; // 2
		recoveryYears: number; // 5
	};

	longTermGrowth?: {
		boost: number; // +0.015
		startAge: number; // 60
	};

	panicSell?: {
		threshold: number; // e.g. -0.20
		sellAllocation: number; // e.g. move to 20% growth
	};

	contributionIncrease?: {
		increaseRate: number; // e.g. +0.10 (10% more savings)
	};

	allocationShift?: {
		type: "static" | "glide" | "aggressive";
	};
}

export interface RetirementSummary {
	p25: number[];
	p50: number[];
	p75: number[];
	sustainableIncome: number;
	probabilityRuin: number;
	baselinePath: number[];
	recessionImpact?: { baseline: number[]; shocked: number[] };
	aggressiveGrowthPath?: number[];
	longTermGrowthPath?: number[];
	panicSellPath?: number[];
	contributionIncreasePath?: number[];

	survival: {
		you: number[];
		spouse?: number[];
		either?: number[];
		brokenHeart?: Record<number, number[]>;
	};
}

export interface RetirementResult {
	summary: RetirementSummary;
	debug: any;
}

// ===== Monte Carlo helper =====
function randomNormal(mean: number, std: number) {
	const u = Math.random();
	const v = Math.random();
	return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ===== Percentile helper =====
function percentile(values: number[], p: number) {
	const sorted = [...values].sort((a, b) => a - b);
	const idx = Math.floor((p / 100) * sorted.length);
	return sorted[idx];
}

export async function runRetirementSimulation(input: RetirementInput): Promise<RetirementResult> {
	const years = input.retirementAge - input.age;

	// Base assumptions
	let meanReturn = 0.05;
	let volatility = 0.1;
	const contribBase = input.income * input.savingsRate;

	// Scenario adjustments (global)
	meanReturn += input.expectedReturnBoost ?? 0;
	volatility += input.volatilityBoost ?? 0;

	// ===== Monte Carlo wealth simulation =====
	const simulations = 300; // narrow band, not too wide
	const wealthPaths: number[][] = [];

	for (let s = 0; s < simulations; s++) {
		let w = input.assets;
		const path: number[] = [];

		for (let year = 0; year <= years; year++) {
			path.push(w);

			// Determine return for this year
			let r = randomNormal(meanReturn, volatility);

			// Recession shock
			if (input.recessionShock) {
				if (year < input.recessionShock.years) {
					r = input.recessionShock.drawdown;
				} else if (year < input.recessionShock.years + input.recessionShock.recoveryYears) {
					r -= 0.02; // slower recovery
				}
			}

			// Long-term growth
			const currentAge = input.age + year;
			if (input.longTermGrowth && currentAge >= input.longTermGrowth.startAge) {
				r += input.longTermGrowth.boost;
			}

			// Panic-sell behaviour
			if (input.panicSell && r < input.panicSell.threshold) {
				// reduce allocation to growth
				r = r * input.panicSell.sellAllocation;
			}

			// Contribution increase
			let contrib = contribBase;
			if (input.contributionIncrease) {
				contrib =
					input.income * (input.savingsRate + input.contributionIncrease.increaseRate);
			}

			// Wealth update
			w = w * (1 + r) + contrib;
		}

		wealthPaths.push(path);
	}

	// ===== Percentiles =====
	const p25: number[] = [];
	const p50: number[] = [];
	const p75: number[] = [];

	for (let t = 0; t <= years; t++) {
		const values = wealthPaths.map((p) => p[t]);
		p25.push(percentile(values, 25));
		p50.push(percentile(values, 50));
		p75.push(percentile(values, 75));
	}

	// ===== Baseline deterministic path =====
	const baselinePath: number[] = [];
	{
		let w = input.assets;
		for (let year = 0; year <= years; year++) {
			baselinePath.push(w);
			w = w * (1 + meanReturn) + contribBase;
		}
	}

	// ===== Recession shocked path =====
	let recessionPath: number[] | undefined = undefined;
	if (input.recessionShock) {
		recessionPath = [];
		let w = input.assets;
		for (let year = 0; year <= years; year++) {
			recessionPath.push(w);

			let r = meanReturn;
			if (year < input.recessionShock.years) {
				r = input.recessionShock.drawdown;
			} else if (year < input.recessionShock.years + input.recessionShock.recoveryYears) {
				r -= 0.02;
			}

			w = w * (1 + r) + contribBase;
		}
	}

	// ===== Aggressive deterministic path =====
	let aggressivePath: number[] | undefined = undefined;
	if (input.expectedReturnBoost || input.volatilityBoost) {
		aggressivePath = [];
		let w = input.assets;
		const r = meanReturn + (input.expectedReturnBoost ?? 0);
		for (let year = 0; year <= years; year++) {
			aggressivePath.push(w);
			w = w * (1 + r) + contribBase;
		}
	}

	// ===== Long-term deterministic path =====
	let longTermPath: number[] | undefined = undefined;
	if (input.longTermGrowth) {
		longTermPath = [];
		let w = input.assets;
		for (let year = 0; year <= years; year++) {
			const currentAge = input.age + year;
			let r = meanReturn;
			if (currentAge >= input.longTermGrowth.startAge) {
				r += input.longTermGrowth.boost;
			}
			longTermPath.push(w);
			w = w * (1 + r) + contribBase;
		}
	}

	// ===== Panic-sell deterministic path =====
	let panicSellPath: number[] | undefined = undefined;
	if (input.panicSell) {
		panicSellPath = [];
		let w = input.assets;
		for (let year = 0; year <= years; year++) {
			let r = meanReturn;
			if (r < input.panicSell.threshold) {
				r = r * input.panicSell.sellAllocation;
			}
			panicSellPath.push(w);
			w = w * (1 + r) + contribBase;
		}
	}

	// ===== Contribution increase deterministic path =====
	let contribIncreasePath: number[] | undefined = undefined;
	if (input.contributionIncrease) {
		contribIncreasePath = [];
		let w = input.assets;
		const contrib =
			input.income * (input.savingsRate + input.contributionIncrease.increaseRate);
		for (let year = 0; year <= years; year++) {
			contribIncreasePath.push(w);
			w = w * (1 + meanReturn) + contrib;
		}
	}

	// ===== Deterministic survival (Gompertz-based) =====
	const maxAge = input.retirementAge + 35; // e.g. model out to ~age 100
	const hazardCurve = buildMortalityCurve(
		input.age,
		maxAge,
		false, // geneticsEnabled (wire later if you want)
		0, // geneticsShiftYears
	);
	const survivalCurve = buildSurvivalProbabilities(hazardCurve);

	// Slice survival to match the simulation horizon (age → retirementAge)
	// Full survival curve from current age → maxAge
	const survivalYou: number[] = survivalCurve;

	// ===== Spouse survival (if spouseAge exists) =====
	let spouseSurvival: number[] | undefined = undefined;
	let eitherSurvival: number[] | undefined = undefined;

	if (input.spouseAge) {
		const spouseHazard = buildMortalityCurve(input.spouseAge, maxAge, false, 0);
		const spouseCurve = buildSurvivalProbabilities(spouseHazard);

		spouseSurvival = spouseCurve;

		// Joint survival: probability at least one is alive
		eitherSurvival = survivalYou.map((youProb, i) => {
			const spouseProb = spouseSurvival![i];
			return 1 - (1 - youProb) * (1 - spouseProb);
		});
	}

	// ===== Broken-heart survival curves =====
	let brokenHeartSurvival: Record<number, number[]> | undefined = undefined;

	if (input.spouseAge) {
		brokenHeartSurvival = {};

		for (let deathAge = input.spouseAge; deathAge <= maxAge; deathAge++) {
			const hazardsBH = applyBrokenHeartAtAge(
				hazardCurve,
				deathAge,
				input.age,
				1.3, // multiplier
				3, // spike duration (years)
			);

			brokenHeartSurvival[deathAge] = buildSurvivalProbabilities(hazardsBH).slice(
				0,
				years + 1,
			);
		}
	}

	const sustainableIncome = p50[p50.length - 1] * 0.04;

	// ===== Allocation vs Sustainable Income Curve =====
	// We compute sustainable income for allocations 0% → 100% in 5% steps
	const allocationIncomeCurve = {
		baseline: [] as number[],
		recession: [] as number[],
		aggressive: [] as number[],
		longTerm: [] as number[],
		panicSell: [] as number[],
		contributionIncrease: [] as number[],
	};

	for (let alloc = 0; alloc <= 1; alloc += 0.05) {
		const expectedReturn = 0.02 + alloc * 0.06; // same formula used in your UI
		const sustainable = input.assets * expectedReturn * 0.04;

		allocationIncomeCurve.baseline.push(sustainable);

		if (recessionPath) {
			allocationIncomeCurve.recession.push(sustainable * 0.9);
		}
		if (aggressivePath) {
			allocationIncomeCurve.aggressive.push(sustainable * 1.1);
		}
		if (longTermPath) {
			allocationIncomeCurve.longTerm.push(sustainable * 1.05);
		}
		if (panicSellPath) {
			allocationIncomeCurve.panicSell.push(sustainable * 0.85);
		}
		if (contribIncreasePath) {
			allocationIncomeCurve.contributionIncrease.push(sustainable * 1.15);
		}
	}

	const summary: RetirementSummary = {
		p25,
		p50,
		p75,
		sustainableIncome,
		probabilityRuin: 0,
		baselinePath,
		recessionImpact: recessionPath
			? { baseline: baselinePath, shocked: recessionPath }
			: undefined,
		aggressiveGrowthPath: aggressivePath,
		longTermGrowthPath: longTermPath,
		panicSellPath,
		contributionIncreasePath: contribIncreasePath,
		allocationIncomeCurve,
		survival: {
			you: survivalYou,
			spouse: spouseSurvival,
			either: eitherSurvival,
			brokenHeart: brokenHeartSurvival,
		},
	};

	return {
		summary,
		debug: { wealthPaths },
	};
}

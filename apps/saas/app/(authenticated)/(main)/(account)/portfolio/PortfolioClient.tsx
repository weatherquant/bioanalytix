"use client";

import { useState, useEffect } from "react";

import AllocationDistressChart from "./components/AllocationDistressChart";
import AllocationIncomeChart from "./components/AllocationIncomeChart";
import BrokenHeartChart from "./components/BrokenHeartChart";
import JointSurvivalChart from "./components/JointSurvivalChart";
import ProjectedWealthChart from "./components/ProjectedWealthChart";
import RuinProbabilityChart from "./components/RuinProbabilityChart";
import SurvivalCurveChart from "./components/SurvivalCurveChart";
import { runRetirementSimulation } from "./simulation/runRetirementSimulation";

export default function PortfolioClient({ financial, genetics, spouse }) {
	// ===== BASIC DERIVED VALUES =====
	const age = financial.age; // ← define age FIRST
	const spouseAge = spouse?.age ?? null; // ← optional spouse age

	// ===== USER CONTROLS =====
	const [growthAllocation, setGrowthAllocation] = useState(0.6);
	const [aggressiveMode, setAggressiveMode] = useState(false);
	const [recessionShock, setRecessionShock] = useState(false);
	const [longTermGrowth, setLongTermGrowth] = useState(false);

	// ===== BROKEN HEART SELECTOR (must come AFTER age is defined) =====
	const [brokenHeartAge, setBrokenHeartAge] = useState(spouseAge ?? age);

	// ===== SIMULATION OUTPUT =====
	const [summary, setSummary] = useState(null);

	// ===== MAP FINANCIAL PROFILE → HYBRID ENGINE INPUT =====
	function mapFinancialToInput(weight: number) {
		return {
			age: financial.age,
			retirementAge: financial.retirement_age,
			assets: financial.assets,
			income: financial.income,
			savingsRate: financial.savings_rate / 100, // if stored as %
			spouseAge: spouse?.age ?? undefined,
		};
	}

	// ===== MAIN SIMULATION =====
	useEffect(() => {
		let cancelled = false;

		async function run() {
			const input = mapFinancialToInput(growthAllocation);

			// aggressive mode: higher returns + higher volatility
			if (aggressiveMode) {
				input.expectedReturnBoost = 0.02; // +2% return
				input.volatilityBoost = 0.03; // +3% volatility
			}

			// recession shock: immediate drawdown + slow recovery
			if (recessionShock) {
				input.recessionShock = {
					drawdown: -0.3, // -30%
					years: 2,
					recoveryYears: 3,
				};
			}

			// long-term growth advantage: compounding boost after age 60
			if (longTermGrowth) {
				input.longTermGrowth = {
					boost: 0.015, // +1.5% return
					startAge: 60,
				};
			}

			const { summary } = await runRetirementSimulation(input);

			if (!cancelled) {
				setSummary(summary);
			}
		}

		run();

		return () => {
			cancelled = true;
		};
	}, [growthAllocation, aggressiveMode, recessionShock, longTermGrowth]);

	if (!summary) {
		return <div className="p-6">Running simulation…</div>;
	}

	console.log("Spouse prop:", spouse);
	console.log("Survival object:", summary.survival);
	console.log("BrokenHeart field:", summary.survival?.brokenHeart);

	// ===== CHART HELPERS =====
	function scaleX(i, total, width = 300) {
		return (i / total) * width;
	}

	function scaleY(value, min, max, height = 200) {
		return height - ((value - min) / (max - min)) * (height - 20);
	}

	// Extend survival curve to age 100
	const survivalExtended = summary.survival.you;

	return (
		<div className="p-6 space-y-6">
			{/* ===== TITLE ===== */}
			<div>
				<h1 className="text-2xl font-bold">Portfolio Scenario Explorer</h1>
				<p className="text-sm text-muted-foreground">
					Explore how allocation, market shocks, and long‑term growth assumptions shape
					your retirement outcomes.
				</p>
			</div>

			{/* ===== CONTROLS ===== */}
			<div className="gap-6 flex flex-wrap items-center">
				<div>
					<label className="font-medium">
						Growth Allocation: {Math.round(growthAllocation * 100)}%
					</label>
					<input
						type="range"
						min={0}
						max={1}
						step={0.05}
						value={growthAllocation}
						onChange={(e) => setGrowthAllocation(parseFloat(e.target.value))}
						className="w-40"
					/>
				</div>

				<label className="gap-2 text-sm flex items-center">
					<input
						type="checkbox"
						checked={aggressiveMode}
						onChange={(e) => setAggressiveMode(e.target.checked)}
					/>
					Aggressive Growth
				</label>

				<label className="gap-2 text-sm flex items-center">
					<input
						type="checkbox"
						checked={recessionShock}
						onChange={(e) => setRecessionShock(e.target.checked)}
					/>
					Recession Shock
				</label>

				<label className="gap-2 text-sm flex items-center">
					<input
						type="checkbox"
						checked={longTermGrowth}
						onChange={(e) => setLongTermGrowth(e.target.checked)}
					/>
					Long‑Term Growth
				</label>
			</div>

			{/* ===== METRICS (compact) ===== */}
			<div className="gap-8 flex items-center">
				{/* Sustainable Income Highlight */}
				<div className="px-4 py-2 bg-emerald-50 border-emerald-200 rounded-md border">
					<p className="text-xs text-emerald-700">Sustainable Income</p>
					<p className="text-xl font-bold text-emerald-900">
						${Math.round(summary.sustainableIncome).toLocaleString()}
					</p>
				</div>

				{/* Tiny stats */}
				<div className="gap-6 text-sm flex items-center text-muted-foreground">
					<div>
						<span className="font-medium text-gray-700">Return:</span>{" "}
						{((0.02 + growthAllocation * 0.06) * 100).toFixed(1)}%
					</div>
					<div>
						<span className="font-medium text-gray-700">Volatility:</span>{" "}
						{((0.05 + growthAllocation * 0.1) * 100).toFixed(1)}%
					</div>
				</div>
			</div>

			{/* ===== CHART GRID ===== */}
			<div className="md:grid-cols-2 gap-8 grid grid-cols-1">
				{/* Wealth Projection */}
				<div>
					<h2 className="font-semibold mb-1">Projected Wealth Range</h2>
					<p className="text-xs mb-2 text-muted-foreground">
						Percentile outcomes under simulated market paths.
					</p>
					<ProjectedWealthChart
						p25={summary.p25}
						p50={summary.p50}
						p75={summary.p75}
						baseline={summary.baselinePath}
						recession={summary.recessionImpact}
						aggressive={summary.aggressiveGrowthPath}
						longTerm={summary.longTermGrowthPath}
						panicSell={summary.panicSellPath}
						contributionIncrease={summary.contributionIncreasePath}
						startAge={age}
					/>
				</div>

				{/* Allocation vs Financial Distress */}
				<div>
					<h2 className="font-semibold mb-1">Allocation vs Financial Distress Risk</h2>
					<p className="text-xs mb-2 text-muted-foreground">
						Years of income remaining under different growth/defensive mixes.
					</p>
					<div className="min-h-[320px]">
						<AllocationDistressChart
							financial={{
								age: financial.age,
								retirementAge: financial.retirement_age,
								assets: financial.assets,
								income: financial.income,
							}}
							lifeExpect={90} // later: wire to genetics
						/>
					</div>
				</div>

				{/* Survival Curve */}
				<div>
					<h2 className="font-semibold mb-1">Survival Probability</h2>
					<p className="text-xs mb-2 text-muted-foreground">
						Probability you are alive at each future age.
					</p>
					<SurvivalCurveChart survival={survivalExtended} startAge={age} />
				</div>

				{/* Joint Survival */}
				{summary.survival?.spouse && (
					<div>
						<h2 className="font-semibold mb-1">Joint Survival Probability</h2>
						<p className="text-xs mb-2 text-muted-foreground">
							Probability at least one of you is alive.
						</p>
						<JointSurvivalChart
							you={summary.survival.you}
							spouse={summary.survival.spouse}
							either={summary.survival.either}
							startAge={age}
						/>
					</div>
				)}

				{/* Broken Heart Selector */}
				{summary.survival?.brokenHeart && (
					<div className="mb-4">
						<label className="text-xs text-muted-foreground">Spouse death age</label>
						<select
							className="rounded p-1 text-sm border"
							value={brokenHeartAge}
							onChange={(e) => setBrokenHeartAge(Number(e.target.value))}
						>
							{Object.keys(summary.survival.brokenHeart).map((ageKey) => (
								<option key={ageKey} value={ageKey}>
									{ageKey}
								</option>
							))}
						</select>
					</div>
				)}

				{/* Broken Heart Survival */}
				{summary.survival?.brokenHeart && (
					<div>
						<h2 className="font-semibold mb-1">Broken-Heart Survival Effect</h2>
						<p className="text-xs mb-2 text-muted-foreground">
							How your survival probability changes if your spouse dies at a given
							age.
						</p>

						<BrokenHeartChart
							normal={summary.survival.you}
							brokenHeart={summary.survival.brokenHeart[brokenHeartAge]}
							startAge={age}
						/>
					</div>
				)}

				{/* Allocation vs Sustainable Income */}
				<div>
					<h2 className="font-semibold mb-1">Allocation vs Sustainable Income</h2>
					<p className="text-xs mb-2 text-muted-foreground">
						Expected sustainable income under different growth/defensive mixes.
					</p>
					<div className="min-h-[320px]">
						<AllocationIncomeChart
							financial={{
								age: financial.age,
								retirementAge: financial.retirement_age,
								assets: financial.assets,
								income: financial.income,
							}}
							lifeExpect={90} // or pull from genetics later
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

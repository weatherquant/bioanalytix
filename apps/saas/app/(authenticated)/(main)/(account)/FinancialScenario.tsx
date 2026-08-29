"use client";

import { toast } from "@repo/ui";
import { Progress } from "@repo/ui/components/progress";
import { useState, useEffect, useMemo } from "react";

import { LongevityGauge } from "@/app/(authenticated)/(main)/(account)/genetics/components/LongevityGauge";
import { createClient } from "@/utils/supabase/client";

export default function FinancialScenario({ name }: { name?: string }) {
	const supabase = createClient();

	const [age, setAge] = useState(40);
	const [gender, setGender] = useState<"male" | "female">("male");
	const [retirementAge, setRetirementAge] = useState(65);
	const [savings, setSavings] = useState(200000);
	const [income, setIncome] = useState(100000);
	const [expenses, setExpenses] = useState(90000);
	const returnRate = 0.05;

	const [result, setResult] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [genetics, setGenetics] = useState<any>(null);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [baselineResult, setBaselineResult] = useState<any>(null);

	function debounce(fn: (...args: any[]) => void, delay: number) {
		let timer: any;
		return (...args: any[]) => {
			clearTimeout(timer);
			timer = setTimeout(() => fn(...args), delay);
		};
	}

	async function saveFinancialProfile() {
		const res = await fetch("/api/financial-profile", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				age,
				income,
				assets: savings,
				savings_rate: ((income - expenses) / income) * 100,
				retirement_age: retirementAge,
				gender,
				country: "AU",
			}),
		});

		if (res.ok) {
			toast({
				title: "Financial profile saved",
				description: "Your details have been updated successfully.",
			});
		} else {
			toast({
				title: "Save failed",
				description: "Please try again.",
				variant: "destructive",
			});
		}
	}

	async function runSimulation() {
		setLoading(true);

		const res = await fetch("/api/simulate", {
			method: "POST",
			body: JSON.stringify({
				age,
				gender,
				retirementAge,
				savings,
				income,
				expenses,
				returnRate,
				genetics,
			}),
		});

		const data = await res.json();
		setResult(data);

		if (!baselineResult && retirementAge === 65 && expenses === 60000) {
			setBaselineResult(data);
		}

		setLoading(false);
	}
	const completeness = useMemo(() => {
		let score = 0;
		if (age) score += 20;
		if (income) score += 20;
		if (savings) score += 20;
		if (expenses) score += 20;
		if (retirementAge) score += 20;
		return score;
	}, [age, income, savings, expenses, retirementAge]);

	useEffect(() => {
		const t = setTimeout(runSimulation, 400);
		return () => clearTimeout(t);
	}, [age, retirementAge, savings, income, expenses, genetics]);

	useEffect(() => {
		runSimulation();
	}, []);

	// ===== LOAD GENETICS PROFILE =====
	useEffect(() => {
		async function loadGenetics() {
			const res = await fetch("/api/genetic-profile", {
				method: "GET",
				credentials: "include",
			});

			const json = await res.json();
			setGenetics(json?.data || null);
		}

		loadGenetics();
	}, []);

	let improvementText = null;

	if (
		baselineResult &&
		result &&
		baselineResult.probabilityFailure !== undefined &&
		result.probabilityFailure !== undefined
	) {
		const before = baselineResult.probabilityFailure;
		const after = result.probabilityFailure;

		if (before !== after) {
			if (after < before) {
				improvementText = `Risk reduced from ${before.toFixed(1)}% → ${after.toFixed(1)}% ✅`;
			} else {
				improvementText = `Risk increased from ${before.toFixed(1)}% → ${after.toFixed(1)}% ⚠️`;
			}
		}
	}

	return (
		<div>
			{/* ===== HEADER ===== */}
			<div className="mb-6">
				<div className="flex items-start justify-between">
					<div>
						<h1 className="text-xl font-bold">
							{!result
								? `Welcome ${name || ""}`
								: result.probabilityFailure > 80
									? `${name || "You"}, your plan is at high risk 🚨`
									: result.probabilityFailure > 30
										? `${name || "You"}, you may outlive your wealth ⚠️`
										: `${name || "You"}, your plan appears sustainable based on current assumptions ✅`}
						</h1>

						<p className="text-sm text-gray-600 mt-1">
							{!result ? (
								"Running your personalised simulation..."
							) : result.probabilityFailure <= 30 ? (
								"Your current plan is broadly sustainable."
							) : (
								<>
									{result.depletionP50 && result.lifeP50
										? `You may run out around age ${Math.round(
												result.depletionP50,
											)}, while living to ~${Math.round(result.lifeP50)}. `
										: ""}
									Delaying retirement or reducing spending could improve your
									outcome.
								</>
							)}
						</p>
					</div>

					{/* ===== SAVE BUTTON (TOP RIGHT) ===== */}
					{result && (
						<button
							onClick={saveFinancialProfile}
							className="px-4 py-2 bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 rounded-md transition"
						>
							Save Profile
						</button>
					)}
				</div>

				{/* Intervention indicators */}
				{!loading && (
					<div className="mt-2 space-y-1 text-xs">
						<div className="text-blue-600">
							{retirementAge !== 65 && (
								<div>Retirement shifted to age {retirementAge}</div>
							)}
							{expenses !== 100000 && <div>Spending adjusted from baseline</div>}
						</div>

						{improvementText && (
							<div className="text-green-600 font-medium">{improvementText}</div>
						)}
					</div>
				)}
			</div>

			{/* ===== GRID ===== */}
			<div className="gap-8 grid grid-cols-2">
				{/* ===== RESULTS ===== */}
				<div className="space-y-4 p-4 rounded border">
					<h3 className="text-lg font-bold">Forecast Results</h3>

					{loading && <div>Running simulation...</div>}

					{!loading && result && (
						<>
							{/* ===== CHART ===== */}
							<div>
								<h4 className="font-semibold">Projected Wealth Range</h4>

								<svg width="100%" height="260">
									{/* ===== AXES (shifted right) ===== */}
									<line x1="80" y1="200" x2="380" y2="200" stroke="#ccc" />
									<line x1="80" y1="0" x2="80" y2="200" stroke="#ccc" />

									{/* ===== Y-AXIS LABEL (moved left) ===== */}
									<text
										x="10"
										y="100"
										textAnchor="middle"
										fontSize="12"
										transform="rotate(-90 10 100)"
									>
										Wealth ($)
									</text>

									{/* ===== CHART CONTENT (shifted right by 80px) ===== */}
									<g transform="translate(80,0)">
										{/* ===== AGE LABELS ===== */}
										{result?.p50 &&
											result.p50.length > 0 &&
											(() => {
												const years = result.p50.length;
												const startAge = age;
												const step = Math.floor(years / 5) || 1;

												return Array.from({ length: 6 }).map((_, i) => {
													const idx = Math.min(i * step, years - 1);
													const x = (idx / years) * 300;

													return (
														<text
															key={i}
															x={x}
															y={215}
															textAnchor="middle"
															fontSize="11"
															fill="#666"
														>
															{startAge + idx}
														</text>
													);
												});
											})()}

										{/* X-axis label */}
										<text x="150" y="240" textAnchor="middle" fontSize="12">
											Age
										</text>

										{/* ===== MAIN CHART LOGIC ===== */}
										{(() => {
											const p25 = result.p25;
											const p50 = result.p50;
											const p75 = result.p75;

											const max = Math.max(...p75);
											const min = 0; // FORCE Y-AXIS TO START AT ZERO

											const scaleX = (i: number) => (i / p50.length) * 300;
											const scaleY = (v: number) =>
												200 - ((v - min) / (max - min)) * 180;

											/* ===== Y-AXIS TICKS (0 → max) ===== */
											const ticks = 5;
											const tickValues = Array.from({
												length: ticks + 1,
											}).map((_, i) => {
												const v = min + ((max - min) * i) / ticks;
												const y = scaleY(v);
												return { v, y };
											});

											/* ===== AREA BAND ===== */
											const area = [
												...p75.map(
													(v: number, i: number) =>
														`${scaleX(i)},${scaleY(v)}`,
												),
												...p25
													.slice()
													.reverse()
													.map((v: number, i: number, arr: number[]) => {
														const idx = arr.length - 1 - i;
														return `${scaleX(idx)},${scaleY(v)}`;
													}),
											].join(" ");

											/* ===== MEDIAN LINE ===== */
											const line = p50
												.map(
													(v: number, i: number) =>
														`${scaleX(i)},${scaleY(v)}`,
												)
												.join(" ");

											return (
												<>
													{/* ===== Y-AXIS TICK LABELS (aligned at x=70) ===== */}
													{tickValues.map((t, i) => (
														<text
															key={i}
															x={-10}
															y={t.y + 4}
															textAnchor="end"
															fontSize="11"
															fill="#666"
														>
															${Math.round(t.v).toLocaleString()}
														</text>
													))}

													{/* ===== UNCERTAINTY BAND ===== */}
													<polygon
														points={area}
														fill="lightblue"
														opacity="0.4"
													/>

													{/* ===== MEDIAN LINE ===== */}
													<polyline
														points={line}
														fill="none"
														stroke="#2563eb"
														strokeWidth="3"
													/>

													{/* ===== LIFE EXPECTANCY MARKER ===== */}
													{result.lifeP50 && (
														<>
															<line
																x1={scaleX(result.lifeP50 - age)}
																x2={scaleX(result.lifeP50 - age)}
																y1={0}
																y2={200}
																stroke="green"
																strokeDasharray="4"
															/>
															<text
																x={scaleX(result.lifeP50 - age)}
																y={190}
																fontSize="12"
																textAnchor="middle"
																fill="green"
															>
																Life Expectancy
															</text>
														</>
													)}

													{/* ===== HOVER ZONES ===== */}
													{p50.map((_: number, i: number) => (
														<rect
															key={i}
															x={scaleX(i) - 5}
															y={0}
															width={10}
															height={200}
															fill="transparent"
															onMouseEnter={() => setHoverIndex(i)}
															onMouseLeave={() => setHoverIndex(null)}
														/>
													))}

													{/* ===== DEPLETION MARKER ===== */}
													{result.depletionP50 && (
														<>
															<line
																x1={scaleX(
																	result.depletionP50 - age,
																)}
																x2={scaleX(
																	result.depletionP50 - age,
																)}
																y1={0}
																y2={200}
																stroke="red"
																strokeDasharray="4"
															/>
															<text
																x={scaleX(
																	result.depletionP50 - age,
																)}
																y={175}
																fontSize="12"
																textAnchor="middle"
																fill="red"
															>
																Depletion
															</text>
														</>
													)}

													{/* ===== TOOLTIP ===== */}
													{hoverIndex !== null && (
														<>
															<text
																x={scaleX(hoverIndex)}
																y={20}
																fontSize="12"
																textAnchor="middle"
																fill="black"
															>
																Age {age + hoverIndex} — $
																{Math.round(
																	p50[hoverIndex],
																).toLocaleString()}
															</text>

															<line
																x1={scaleX(hoverIndex)}
																x2={scaleX(hoverIndex)}
																y1={0}
																y2={200}
																stroke="#999"
																strokeDasharray="3"
															/>
														</>
													)}
												</>
											);
										})()}
									</g>
								</svg>
							</div>

							<div>
								<strong>Success Probability</strong>
								<div className="text-2xl font-bold text-green-600">
									{result.probabilitySuccess.toFixed(1)}%
								</div>
							</div>

							<div>
								<strong>Risk of Running Out</strong>
								<div className="text-2xl font-bold text-red-600">
									{result.probabilityFailure.toFixed(1)}%
								</div>
							</div>

							{/* ===== LIFESPAN ===== */}
							<div className="p-3 bg-blue-50 rounded">
								<div className="text-sm text-gray-600">Expected lifespan</div>
								<div className="text-2xl font-bold">
									{Math.round(result.averageDeathAge || 0)} years
								</div>

								<div className="text-sm mt-2 text-gray-700">
									Most outcomes fall between{" "}
									<strong>
										{result.lifeP25 ?? "--"} – {result.lifeP75 ?? "--"}
									</strong>
								</div>
							</div>

							{/* ===== GENETICS SUMMARY ===== */}
							{result.genetics && (
								<div className="mt-4 p-3 rounded space-y-3 border">
									<h4 className="font-semibold">Genetic Profile Summary</h4>

									{/* Longevity Score */}
									<div>
										<div className="text-sm text-gray-600">Longevity Score</div>
										<div className="text-xl font-bold">
											{result.genetics.longevityScore}
										</div>
										<Progress
											value={result.genetics.longevityScore}
											className="mt-1"
										/>
									</div>

									{/* Retirement Impact */}
									<div className="text-sm text-gray-700 space-y-1">
										<div>
											Suggested Retirement Age:{" "}
											<strong>
												{result.genetics.suggestedRetirementAge}
											</strong>
										</div>
										<div>
											Expected Retirement Duration:{" "}
											<strong>{result.genetics.retirementYears} years</strong>
										</div>
										<div>
											Risk Posture:{" "}
											<strong className="capitalize">
												{result.genetics.riskPosture}
											</strong>
										</div>
									</div>

									{/* Top Disease Risks */}
									<div>
										<div className="text-sm font-medium mb-1">
											Top Genetic Risks
										</div>
										<ul className="ml-4 text-sm list-disc">
											{result.genetics.diseaseRisks
												?.slice(0, 3)
												.map((risk: any) => (
													<li key={risk.disease}>
														<strong>{risk.disease}</strong>:{" "}
														{risk.label}
													</li>
												))}
										</ul>
									</div>

									{/* Top Trait Insights */}
									<div>
										<div className="text-sm font-medium mb-1">
											Trait Insights
										</div>
										<ul className="ml-4 text-sm list-disc">
											{result.genetics.traitInsights
												?.slice(0, 3)
												.map((trait: any) => (
													<li key={trait.trait}>
														<strong>{trait.trait}</strong>:{" "}
														{trait.summary}
													</li>
												))}
										</ul>
									</div>
								</div>
							)}

							{/* ===== GENETIC INSIGHTS ===== */}
							{result.genetics && (
								<div className="p-3 mt-4 rounded bg-purple-50 border">
									<h4 className="font-semibold">Genetic Impact</h4>

									<div className="text-sm mt-2 text-gray-700">
										{result.lifeP50 && (
											<div>
												Your genetic and personal factors suggest an
												expected lifespan of around{" "}
												<strong>{Math.round(result.lifeP50)}</strong> years.
											</div>
										)}

										{result.genetics?.foxo3?.score > 0 && (
											<div className="mt-2">
												Your FOXO3 profile is associated with increased
												longevity, meaning your retirement may last longer
												than average.
											</div>
										)}

										{result.genetics?.apoe?.score < 0 && (
											<div className="mt-2">
												Your APOE variant may increase the risk of
												later-life health expenses and variability in
												outcomes.
											</div>
										)}
									</div>
								</div>
							)}

							{/* ===== PLANNING IMPLICATIONS ===== */}
							{result.genetics && (
								<div className="p-3 mt-3 rounded bg-yellow-50 border">
									<h4 className="font-semibold">Planning Considerations</h4>

									<ul className="text-sm mt-2 text-gray-700 ml-4 space-y-1 list-disc">
										{result.lifeP50 > 75 && (
											<li>
												A longer lifespan may require stronger retirement
												reserves and careful withdrawal planning.
											</li>
										)}

										{result.genetics?.apoe?.score < 0 && (
											<li>
												Consider preparing for potential healthcare and
												aged-care costs later in life, including insurance
												options.
											</li>
										)}

										<li>
											Estate planning should account for uncertainty in
											lifespan and timing of wealth transfer.
										</li>
									</ul>
								</div>
							)}

							{/* ===== INTERPRETATION ===== */}
							<div className="p-3 rounded bg-gray-100">
								{result.probabilityFailure > 40 ? (
									<div className="text-red-600">
										⚠️ You may outlive your wealth
									</div>
								) : (
									<div className="text-green-600">
										✅ Your plan is sustainable
									</div>
								)}
							</div>

							{/* ===== GENETICS → FINANCIAL RISK LINK ===== */}
							{result.genetics && result.probabilityFailure > 40 && (
								<div className="p-3 mt-4 rounded bg-red-50 border">
									<h4 className="font-semibold">Why this risk exists</h4>

									<div className="text-sm mt-2 text-gray-700 space-y-2">
										{result.lifeP50 && result.depletionP50 && (
											<div>
												Your projected lifespan extends to around{" "}
												<strong>{Math.round(result.lifeP50)}</strong>, while
												financial depletion occurs around{" "}
												<strong>{Math.round(result.depletionP50)}</strong>.
											</div>
										)}

										{result.genetics?.foxo3?.score > 0 && (
											<div>
												Your FOXO3 profile is associated with increased
												longevity, which increases the likelihood of living
												into later retirement years — where financial
												shortfall becomes more likely.
											</div>
										)}

										{result.genetics?.apoe?.score < 0 && (
											<div>
												Your APOE profile introduces additional uncertainty
												in late-life health, which may increase spending and
												accelerate depletion in some scenarios.
											</div>
										)}

										<div>
											These factors combine to increase the probability that
											your lifespan exceeds your financial resources.
										</div>
									</div>
								</div>
							)}
						</>
					)}
				</div>

				{/* ===== INPUTS ===== */}
				<div className="space-y-4 p-4 rounded border">
					<Input label="Age" value={age} setValue={setAge} />
					<div className="space-y-2">
						<label className="text-sm font-medium">Gender</label>
						<select
							className="p-2 rounded w-32 border"
							value={gender}
							onChange={(e) => setGender(e.target.value as "male" | "female")}
						>
							<option value="male">Male</option>
							<option value="female">Female</option>
						</select>
					</div>

					<Input
						label="Retirement Age"
						value={retirementAge}
						setValue={setRetirementAge}
					/>
					<Input label="Savings" value={savings} setValue={setSavings} />
					<Input label="Income" value={income} setValue={setIncome} />
					<Input label="Expenses" value={expenses} setValue={setExpenses} />

					{/* ===== WHAT-IF CONTROLS ===== */}
					<div className="mt-6 p-3 rounded bg-gray-100">
						<h4 className="font-semibold">Test Changes</h4>

						{/* Retirement adjustment */}
						<div className="mt-2 text-sm">
							<label>Delay Retirement:</label>
							<select
								className="ml-2 p-1 border"
								onChange={(e) => setRetirementAge(65 + Number(e.target.value))}
							>
								<option value={0}>None</option>
								<option value={1}>+1 year</option>
								<option value={2}>+2 years</option>
								<option value={3}>+3 years</option>
							</select>
						</div>

						{/* Spending adjustment */}
						<div className="mt-2 text-sm">
							<label>Reduce Spending:</label>
							<select
								className="ml-2 p-1 border"
								onChange={(e) =>
									setExpenses(expenses * (1 - Number(e.target.value)))
								}
							>
								<option value={0}>None</option>
								<option value={0.05}>5%</option>
								<option value={0.1}>10%</option>
								<option value={0.15}>15%</option>
							</select>
						</div>

						{/* ===== GENETICS SUMMARY CARD ===== */}
						{result?.genetics && (
							<div className="p-4 rounded bg-purple-50 space-y-2 border">
								<h3 className="font-semibold">Genetic Profile</h3>

								{/* Longevity Score (0–100) */}
								<div className="text-sm flex justify-between">
									<span>Longevity Score</span>
									<span className="font-bold">
										{result.genetics.longevityScore ?? "—"}
									</span>
								</div>

								{/* Risk Level */}
								<div className="text-sm flex justify-between">
									<span>Risk Level</span>
									<span className="font-bold capitalize">
										{result.genetics.riskPosture ?? "—"}
									</span>
								</div>

								<a
									href="/genetics"
									className="text-xs mt-2 py-1 rounded bg-purple-600 text-white block text-center"
								>
									View Full Report
								</a>

								{/* ===== LONGEVITY GAUGE ===== */}
								<div className="mt-4 flex justify-center">
									<LongevityGauge
										score={(result.genetics.longevityScore ?? 0) / 100}
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function Input({ label, value, setValue }: any) {
	return (
		<div>
			<label className="text-sm block">{label}</label>
			<input
				type="number"
				value={value}
				onChange={(e) => setValue(Number(e.target.value))}
				className="p-2 w-full border"
			/>
		</div>
	);
}

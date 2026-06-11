"use client";

import { useState, useEffect } from "react";

export default function FinancialScenario({ name }: { name?: string }) {
	const [age, setAge] = useState(40);
	const [retirementAge, setRetirementAge] = useState(65);
	const [savings, setSavings] = useState(200000);
	const [income, setIncome] = useState(120000);
	const [expenses, setExpenses] = useState(60000);
	const returnRate = 0.05;

	const [result, setResult] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [genetics, setGenetics] = useState<any>(null);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [baselineResult, setBaselineResult] = useState<any>(null);

	async function runSimulation() {
		setLoading(true);

		const res = await fetch("/api/simulate", {
			method: "POST",
			body: JSON.stringify({
				age,
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

		// Save baseline ONLY once (first clean run)
		if (!baselineResult && retirementAge === 65 && expenses === 60000) {
			setBaselineResult(data);
		}
		setLoading(false);
	}

	useEffect(() => {
		const t = setTimeout(runSimulation, 400);
		return () => clearTimeout(t);
	}, [age, retirementAge, savings, income, expenses, genetics]);

	useEffect(() => {
		runSimulation();
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
				<h1 className="text-xl font-bold">
					{!result
						? `Welcome ${name || ""}`
						: result.probabilityFailure > 40
							? `${name || "You"}, you may outlive your wealth ⚠️`
							: `${name || "You"}, your plan is on track ✅`}
				</h1>

				<p className="text-sm text-gray-600 mt-1">
					{!result ? (
						"Running your personalised simulation..."
					) : result.probabilityFailure <= 40 ? (
						"Your current plan is broadly sustainable."
					) : (
						<>
							{result.depletionP50 && result.lifeP50
								? `You may run out around age ${Math.round(
										result.depletionP50,
									)}, while living to ~${Math.round(result.lifeP50)}. `
								: ""}
							Delaying retirement or reducing spending could improve your outcome.
						</>
					)}
				</p>

				{/* ✅ FIXED: moved OUTSIDE <p> */}
				{!loading && (
					<div className="mt-2 space-y-1 text-xs">
						{/* Intervention indicators */}
						<div className="text-blue-600">
							{retirementAge !== 65 && (
								<div>Retirement shifted to age {retirementAge}</div>
							)}
							{expenses !== 60000 && <div>Spending adjusted from baseline</div>}
						</div>

						{/* Improvement indicator */}
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
					<h3 className="text-lg font-bold">Monte Carlo Results</h3>

					{loading && <div>Running simulation...</div>}

					{!loading && result && (
						<>
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
										{result.lifeP10 ?? "--"} – {result.lifeP90 ?? "--"}
									</strong>
								</div>
							</div>

							{/* ===== GENETICS DISPLAY ===== */}
							{result.genetics && (
								<div className="mt-4 space-y-3">
									{/* FOXO3 */}
									<div className="p-3 rounded border">
										<div className="flex justify-between">
											<strong>FOXO3</strong>
											<span className="text-sm text-gray-500">
												{result.genetics?.foxo3?.status || "Not available"}
											</span>
										</div>

										<div className="text-sm mt-1 text-gray-600">
											{result.genetics?.foxo3?.impact || "Not available"}
										</div>
									</div>

									{/* APOE */}
									<div className="p-3 rounded border">
										<div className="flex justify-between">
											<strong>APOE</strong>
											<span className="text-sm text-gray-500">
												{result.genetics?.apoe?.genotype || "Not available"}
											</span>
										</div>

										<div className="text-sm mt-1 text-gray-600">
											{result.genetics?.apoe?.impact || "Not available"}
										</div>
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
										{result.lifeP50 > 90 && (
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

							{/* ===== CHART ===== */}
							<div>
								<h4 className="font-semibold">Projected Wealth Range</h4>

								<svg width="100%" height="260">
									{/* Axes */}
									<line x1="0" y1="200" x2="300" y2="200" stroke="#ccc" />
									<line x1="0" y1="0" x2="0" y2="200" stroke="#ccc" />

									{/* ===== AGE LABELS ===== */}
									{(() => {
										const years = result.p50.length;
										const startAge = age;
										const step = Math.floor(years / 5); // 5 labels

										return Array.from({ length: 6 }).map((_, i) => {
											const idx = i * step;
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

									{/* Labels */}
									<text x="150" y="240" textAnchor="middle" fontSize="12">
										Age / Time
									</text>

									<text x="120" y="40" textAnchor="start" fontSize="12">
										Wealth ($)
									</text>

									{(() => {
										const p10 = result.p10;
										const p50 = result.p50;
										const p90 = result.p90;

										const max = Math.max(...p90);
										const min = Math.min(...p10);

										const scaleX = (i: number) => (i / p50.length) * 300;
										const scaleY = (v: number) =>
											200 - ((v - min) / (max - min)) * 180;

										const area = [
											...p90.map(
												(v: number, i: number) =>
													`${scaleX(i)},${scaleY(v)}`,
											),
											...p10
												.slice()
												.reverse()
												.map((v: number, i: number, arr: number[]) => {
													const idx = arr.length - 1 - i;
													return `${scaleX(idx)},${scaleY(v)}`;
												}),
										].join(" ");

										const line = p50
											.map(
												(v: number, i: number) =>
													`${scaleX(i)},${scaleY(v)}`,
											)
											.join(" ");

										return (
											<>
												{/* Area (uncertainty band) */}
												<polygon
													points={area}
													fill="lightblue"
													opacity="0.4"
												/>

												{/* Median line */}
												<polyline
													points={line}
													fill="none"
													stroke="#2563eb"
													strokeWidth="3"
												/>

												{/* ===== EXPECTED LIFESPAN ===== */}
												{result.lifeP50 && (
													<line
														x1={scaleX(result.lifeP50 - age)}
														x2={scaleX(result.lifeP50 - age)}
														y1={0}
														y2={200}
														stroke="green"
														strokeDasharray="4"
													/>
												)}

												{result.lifeP50 && (
													<text
														x={scaleX(result.lifeP50 - age)}
														y={190}
														fontSize="12"
														textAnchor="middle"
														fill="green"
													>
														Life Expectancy
													</text>
												)}

												{/* ===== Hover zones ===== */}
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

												{/* ===== DEPLETION POINT ===== */}
												{result.depletionP50 && (
													<line
														x1={scaleX(result.depletionP50 - age)}
														x2={scaleX(result.depletionP50 - age)}
														y1={0}
														y2={200}
														stroke="red"
														strokeDasharray="4"
													/>
												)}

												{result.depletionP50 && (
													<text
														x={scaleX(result.depletionP50 - age)}
														y={175}
														fontSize="12"
														textAnchor="middle"
														fill="red"
													>
														Depletion
													</text>
												)}

												{/* ===== Tooltip ===== */}
												{hoverIndex !== null && (
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
												)}

												{hoverIndex !== null && (
													<line
														x1={scaleX(hoverIndex)}
														x2={scaleX(hoverIndex)}
														y1={0}
														y2={200}
														stroke="#999"
														strokeDasharray="3"
													/>
												)}
											</>
										);
									})()}
								</svg>
							</div>
						</>
					)}
				</div>

				{/* ===== INPUTS ===== */}
				<div className="space-y-4 p-4 rounded border">
					<Input label="Age" value={age} setValue={setAge} />
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
					</div>

					{/* DNA upload */}
					<input
						type="file"
						onChange={async (e) => {
							const file = e.target.files?.[0];
							if (!file) return;

							const text = await file.text();

							const res = await fetch("/api/upload-genetics", {
								method: "POST",
								body: JSON.stringify({ file: text }),
							});

							const data = await res.json();
							setGenetics(data.genetics);
						}}
					/>
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

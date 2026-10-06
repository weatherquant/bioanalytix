"use client";

import { ArrowRight, HeartPulse, Loader2, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import styles from "./LongevityPage.module.css";

interface JourneyPoint {
	age: number;
	projectionDate: string;
	flatSpending: number;
	ageAdjustedSpending: number;
	ageAdjustedWithCareSpending?: number;
	flatNetWorth: number;
	ageAdjustedNetWorth: number;
	ageAdjustedWithCareNetWorth?: number;
}

interface LongevityResult {
	simulationCount: number;

	strategy: {
		id: string;
		name: string;
	};

	retirement: {
		age: number;
		baseAnnualSpending: number;
	};

	journey: JourneyPoint[];

	laterLifeCare?: {
		startAge: number;
		annualCost: number;
		durationYears?: number;
	};

	questionsWorthExploring: string[];
	qualifications: string[];
}

interface LongevityResponse {
	status: "complete" | "missing_financial_state";
	result: LongevityResult | null;
}

type SpendingView = "flat" | "age_adjusted" | "care";

function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD",
		maximumFractionDigits: 0,
	}).format(value);
}

function formatCompactCurrency(value: number) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD",
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(value);
}

function spendingForView(point: JourneyPoint, view: SpendingView) {
	switch (view) {
		case "flat":
			return point.flatSpending;
		case "care":
			return point.ageAdjustedWithCareSpending ?? point.ageAdjustedSpending;
		default:
			return point.ageAdjustedSpending;
	}
}

function netWorthForView(point: JourneyPoint, view: SpendingView) {
	switch (view) {
		case "flat":
			return point.flatNetWorth;
		case "care":
			return point.ageAdjustedWithCareNetWorth ?? point.ageAdjustedNetWorth;
		default:
			return point.ageAdjustedNetWorth;
	}
}

function nearestPoint(journey: JourneyPoint[], age: number) {
	if (journey.length === 0) {
		return undefined;
	}

	return journey.reduce((nearest, point) =>
		Math.abs(point.age - age) < Math.abs(nearest.age - age) ? point : nearest,
	);
}

function JourneyChart({ journey, view }: { journey: JourneyPoint[]; view: SpendingView }) {
	const points = useMemo(() => {
		if (journey.length === 0) {
			return [];
		}

		const values = journey.map((point) => netWorthForView(point, view));
		const maximum = Math.max(...values, 1);
		const minimum = Math.min(...values, 0);
		const range = Math.max(maximum - minimum, 1);

		return journey.map((point, index) => {
			const value = netWorthForView(point, view);
			const x = journey.length === 1 ? 0 : (index / (journey.length - 1)) * 100;
			const y = 92 - ((value - minimum) / range) * 78;

			return {
				x,
				y,
				age: point.age,
				value,
			};
		});
	}, [journey, view]);

	const path = points
		.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
		.join(" ");

	const labelPoints = [
		journey[0],
		nearestPoint(journey, 75),
		nearestPoint(journey, 85),
		journey[journey.length - 1],
	].filter(
		(point, index, values): point is JourneyPoint =>
			Boolean(point) &&
			values.findIndex((candidate) => candidate?.age === point?.age) === index,
	);

	return (
		<div className={styles.chartWrap}>
			<div className={styles.chartHeader}>
				<div>
					<p className={styles.cardLabel}>Modelled resources</p>
					<p className={styles.chartTitle}>Median household wealth</p>
				</div>

				<p className={styles.chartNote}>Through the modelled retirement horizon</p>
			</div>

			<div className={styles.chart}>
				<svg
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
					className={styles.chartSvg}
					aria-label="Median household wealth through retirement"
				>
					<line x1="0" y1="92" x2="100" y2="92" className={styles.chartAxis} />
					<line x1="0" y1="53" x2="100" y2="53" className={styles.chartGrid} />
					<line x1="0" y1="14" x2="100" y2="14" className={styles.chartGrid} />

					{path ? <path d={path} className={styles.chartLine} /> : null}
				</svg>
			</div>

			<div className={styles.chartLabels}>
				{labelPoints.map((point) => (
					<div key={point.age} className={styles.chartLabel}>
						<span>Age {point.age}</span>
						<strong>{formatCompactCurrency(netWorthForView(point, view))}</strong>
					</div>
				))}
			</div>

			<p className={styles.qualification}>
				The chart shows median modelled household wealth across the supplied simulation
				paths. It is not a forecast or guaranteed future balance.
			</p>
		</div>
	);
}

export default function LongevityPage() {
	const [data, setData] = useState<LongevityResult | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [view, setView] = useState<SpendingView>("age_adjusted");

	const [careStartAge, setCareStartAge] = useState("90");
	const [careAnnualCost, setCareAnnualCost] = useState("50000");
	const [careDuration, setCareDuration] = useState("3");
	const [exploringCare, setExploringCare] = useState(false);
	const [careError, setCareError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadLongevity() {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/bioanalytix/longevity/spending-comparison", {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({}),
				});

				if (!response.ok) {
					throw new Error("Unable to load your longevity planning view.");
				}

				const result = (await response.json()) as LongevityResponse;

				if (result.status !== "complete" || !result.result) {
					throw new Error("Complete your financial profile before exploring longevity.");
				}

				if (!cancelled) {
					setData(result.result);
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "Unable to load your longevity planning view.",
					);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		void loadLongevity();

		return () => {
			cancelled = true;
		};
	}, []);

	async function exploreCareScenario() {
		const startAge = Number(careStartAge);
		const annualCost = Number(careAnnualCost.replace(/,/g, "").trim());
		const durationYears = Number(careDuration);

		if (!Number.isInteger(startAge) || startAge < 0 || startAge > 120) {
			setCareError("Enter a valid care start age.");
			return;
		}

		if (!Number.isFinite(annualCost) || annualCost < 0) {
			setCareError("Enter a valid annual care cost.");
			return;
		}

		if (!Number.isInteger(durationYears) || durationYears <= 0) {
			setCareError("Enter a care duration of at least one year.");
			return;
		}

		setExploringCare(true);
		setCareError(null);

		try {
			const response = await fetch("/api/bioanalytix/longevity/spending-comparison", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					laterLifeCare: {
						startAge,
						annualCost,
						durationYears,
					},
				}),
			});

			if (!response.ok) {
				throw new Error("Unable to explore this care scenario right now.");
			}

			const result = (await response.json()) as LongevityResponse;

			if (result.status !== "complete" || !result.result) {
				throw new Error(
					"We need a little more information before this scenario can be explored.",
				);
			}

			setData(result.result);
			setView("care");
		} catch (scenarioError) {
			setCareError(
				scenarioError instanceof Error
					? scenarioError.message
					: "Unable to explore this care scenario right now.",
			);
		} finally {
			setExploringCare(false);
		}
	}

	if (loading) {
		return (
			<div className={styles.loadingCard}>
				<Loader2 size={20} className={styles.spinner} />
				<p>Building your longevity planning view...</p>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className={styles.workspace}>
				<section className={styles.intro}>
					<div>
						<p className={styles.eyebrow}>Longevity</p>
						<h1 className={styles.title}>
							How might your financial life change as you age?
						</h1>
					</div>
				</section>

				<div className={styles.card}>
					<p>{error ?? "Unable to load your longevity planning view."}</p>
				</div>
			</div>
		);
	}

	const age75 = nearestPoint(data.journey, 75);
	const age85 = nearestPoint(data.journey, 85);

	const activeSpending = data.retirement.baseAnnualSpending;
	const laterSpending = age75?.ageAdjustedSpending;
	const advancedSpending = age85?.ageAdjustedSpending;

	return (
		<div className={styles.workspace}>
			<section className={styles.intro}>
				<div>
					<p className={styles.eyebrow}>Longevity</p>

					<h1 className={styles.title}>
						How might your financial life change as you age?
					</h1>

					<p className={styles.description}>
						Explore how retirement spending, household resources and later-life choices
						could interact over time.
					</p>
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.heroCard}>
					<p className={styles.cardLabel}>Your retirement starting point</p>

					<div className={styles.heroGrid}>
						<div>
							<p className={styles.metricLabel}>Retirement age</p>
							<p className={styles.heroValue}>{data.retirement.age}</p>
						</div>

						<div>
							<p className={styles.metricLabel}>Modelled sustainable spending</p>
							<p className={styles.heroValue}>
								{formatCurrency(data.retirement.baseAnnualSpending)}
								<span> p.a.</span>
							</p>
						</div>
					</div>

					<p className={styles.qualification}>
						Illustrative {data.strategy.name} strategy using {data.simulationCount}{" "}
						modelled paths. Sustainable spending is a model output under the current
						Plan assumptions, not a guaranteed income or recommendation.
					</p>
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionHeader}>
					<div>
						<p className={styles.eyebrow}>Your retirement journey</p>
						<h2 className={styles.sectionTitle}>
							Resources and spending through later life
						</h2>
						<p className={styles.sectionDescription}>
							See how different spending assumptions change the shape of the same
							retirement plan.
						</p>
					</div>
				</div>

				<div className={styles.card}>
					<div className={styles.viewSelector}>
						<button
							type="button"
							className={view === "flat" ? styles.viewActive : styles.viewButton}
							onClick={() => setView("flat")}
						>
							<span>Flat spending</span>
							<small>Same real spending through retirement</small>
						</button>

						<button
							type="button"
							className={
								view === "age_adjusted" ? styles.viewActive : styles.viewButton
							}
							onClick={() => setView("age_adjusted")}
						>
							<span>Age-adjusted</span>
							<small>Illustrative spending changes with age</small>
						</button>

						{data.laterLifeCare ? (
							<button
								type="button"
								className={view === "care" ? styles.viewActive : styles.viewButton}
								onClick={() => setView("care")}
							>
								<span>With later-life care</span>
								<small>Your explicit care scenario</small>
							</button>
						) : null}
					</div>

					<JourneyChart journey={data.journey} view={view} />
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionHeader}>
					<div>
						<p className={styles.eyebrow}>Illustrative spending</p>
						<h2 className={styles.sectionTitle}>
							Spending may change as retirement progresses
						</h2>
						<p className={styles.sectionDescription}>
							The age-adjusted view is a planning assumption, not a prediction of how
							you personally will spend.
						</p>
					</div>
				</div>

				<div className={styles.phaseGrid}>
					<div className={styles.phaseCard}>
						<p className={styles.phaseAge}>Retirement to 74</p>
						<h3>Active retirement</h3>
						<p className={styles.phasePercent}>100%</p>
						<p className={styles.phaseValue}>{formatCurrency(activeSpending)} p.a.</p>
						<p className={styles.phaseText}>
							The illustrative profile starts with your full base retirement spending.
						</p>
					</div>

					<div className={styles.phaseCard}>
						<p className={styles.phaseAge}>Age 75 to 84</p>
						<h3>Later retirement</h3>
						<p className={styles.phasePercent}>90%</p>
						<p className={styles.phaseValue}>
							{laterSpending === undefined
								? "—"
								: `${formatCurrency(laterSpending)} p.a.`}
						</p>
						<p className={styles.phaseText}>
							An illustrative reduction in general spending as retirement progresses.
						</p>
					</div>

					<div className={styles.phaseCard}>
						<p className={styles.phaseAge}>Age 85+</p>
						<h3>Advanced age</h3>
						<p className={styles.phasePercent}>80%</p>
						<p className={styles.phaseValue}>
							{advancedSpending === undefined
								? "—"
								: `${formatCurrency(advancedSpending)} p.a.`}
						</p>
						<p className={styles.phaseText}>
							Lower general spending can coexist with additional health or care costs.
						</p>
					</div>
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionHeader}>
					<div>
						<p className={styles.eyebrow}>Later-life care</p>
						<h2 className={styles.sectionTitle}>Explore, don't predict</h2>
						<p className={styles.sectionDescription}>
							Test a care-cost assumption to see how it could affect your financial
							journey. Bioanalytix does not predict whether you will need care.
						</p>
					</div>
				</div>

				<div className={styles.card}>
					<div className={styles.careIntro}>
						<HeartPulse size={20} />

						<div>
							<p className={styles.cardLabel}>Illustrative care scenario</p>
							<p className={styles.supportingText}>
								Choose the timing, annual cost and duration yourself. These values
								are scenario assumptions, not estimates derived from your DNA.
							</p>
						</div>
					</div>

					<div className={styles.careGrid}>
						<label className={styles.field}>
							<span>Start age</span>
							<input
								type="number"
								min="0"
								max="120"
								value={careStartAge}
								onChange={(event) => {
									setCareStartAge(event.target.value);
									setCareError(null);
								}}
							/>
						</label>

						<label className={styles.field}>
							<span>Annual cost</span>
							<div className={styles.currencyInput}>
								<span>$</span>
								<input
									type="text"
									inputMode="numeric"
									value={careAnnualCost}
									onChange={(event) => {
										setCareAnnualCost(event.target.value);
										setCareError(null);
									}}
								/>
							</div>
						</label>

						<label className={styles.field}>
							<span>Duration</span>
							<div className={styles.durationInput}>
								<input
									type="number"
									min="1"
									value={careDuration}
									onChange={(event) => {
										setCareDuration(event.target.value);
										setCareError(null);
									}}
								/>
								<span>years</span>
							</div>
						</label>
					</div>

					<button
						type="button"
						className={styles.exploreButton}
						onClick={() => void exploreCareScenario()}
						disabled={exploringCare}
					>
						{exploringCare ? (
							<>
								<Loader2 size={16} className={styles.spinner} />
								Exploring scenario...
							</>
						) : (
							<>
								Explore this scenario
								<ArrowRight size={16} />
							</>
						)}
					</button>

					{careError ? <p className={styles.error}>{careError}</p> : null}

					{data.laterLifeCare ? (
						<div className={styles.careResult}>
							<p className={styles.cardLabel}>Scenario being explored</p>
							<p>
								<strong>
									{formatCurrency(data.laterLifeCare.annualCost)} p.a.
								</strong>{" "}
								from age <strong>{data.laterLifeCare.startAge}</strong>
								{data.laterLifeCare.durationYears
									? ` for ${data.laterLifeCare.durationYears} years`
									: ""}
								.
							</p>
							<p className={styles.supportingText}>
								Select “With later-life care” above to compare its effect on the
								modelled journey.
							</p>
						</div>
					) : null}
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionHeader}>
					<div>
						<p className={styles.eyebrow}>Ask Bioanalytix</p>
						<h2 className={styles.sectionTitle}>Questions worth exploring</h2>
						<p className={styles.sectionDescription}>
							Use these as what-if questions rather than predictions about your
							future.
						</p>
					</div>
				</div>

				<div className={styles.questionsCard}>
					{data.questionsWorthExploring.map((question) => (
						<Link
							key={question}
							href={`/v2/plan?ask=${encodeURIComponent(question)}`}
							className={styles.question}
						>
							<MessageCircleQuestion size={16} />
							<span>{question}</span>
							<ArrowRight size={15} className={styles.questionArrow} />
						</Link>
					))}

					<Link href="/v2/plan" className={styles.primaryLink}>
						Ask Bioanalytix
						<ArrowRight size={17} />
					</Link>
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.card}>
					<p className={styles.cardLabel}>About this analysis</p>

					<div className={styles.qualifications}>
						{data.qualifications.map((qualification) => (
							<p key={qualification}>{qualification}</p>
						))}
					</div>
				</div>
			</section>

			<p className={styles.disclosure}>
				General information only. Bioanalytix provides illustrative financial planning
				analysis using your information and stated assumptions. It does not provide personal
				financial, medical, legal or tax advice.
			</p>
		</div>
	);
}

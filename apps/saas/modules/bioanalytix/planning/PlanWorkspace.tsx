"use client";

import {
	AlertCircle,
	Brain,
	Briefcase,
	Check,
	ChevronRight,
	Coins,
	Dna,
	HeartPulse,
	Landmark,
	Save,
	ShieldCheck,
	UsersRound,
	WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AskBioanalytix } from "./AskBioanalytix";

import styles from "./PlanWorkspace.module.css";

type PlanningDomain =
	| "healthy_working_life"
	| "health_costs"
	| "care_dependency"
	| "premature_mortality"
	| "longevity"
	| "income_interruption"
	| "estate"
	| "partner_dependency"
	| "insurance"
	| "family";

type PlanningQuestionSource =
	| "genetic_profile"
	| "household"
	| "estate"
	| "insurance"
	| "longevity"
	| "user";

type PlanningSignificance = "low" | "moderate" | "high";

type PlanningOutcome = "strong" | "comfortable" | "worth_reviewing" | "exposed";

type PlanningCoverage = "covered" | "review_recommended";

type PlanningArea =
	| "financial_resilience"
	| "income_work"
	| "protection"
	| "estate_family"
	| "longevity_later_life";

type PlanningReviewStatus = "to_review" | "reviewed";

interface PlanningAreaReview {
	area: PlanningArea;
	status: PlanningReviewStatus;
	reviewedAt?: string;
}

interface PlanningSummaryArea {
	area: PlanningArea;
	title: string;
	outcome: PlanningOutcome;
	coverage: PlanningCoverage;
	summary: string;
	question: string;
	geneticContext?: string;
	geneticsIncreasesAttention: boolean;
}

interface PlanningSummary {
	overallOutcome: PlanningOutcome;
	headline: string;
	summary: string;
	areas: PlanningSummaryArea[];
	priorities: PlanningSummaryArea[];
}

interface PlanningQuestion {
	id: string;
	source: PlanningQuestionSource;
	domain: PlanningDomain;
	title: string;
	question: string;
	rationale: string;
	significance: PlanningSignificance;
	selected: boolean;
	sourceInsightIds?: string[];
}

interface PlanAssumptions {
	incomeInterruptionMonths?: number;
	essentialSpendingIncreasePercent?: number;
	additionalAnnualHealthCosts?: number;
	healthCostDurationYears?: number;
	additionalAnnualCareCosts?: number;
	careCostDurationYears?: number;
	retirementYearsExtension?: number;
	retirementAgeToTest?: number;
	earlierDeathAge?: number;
	insuranceShortfall?: number;
}

interface SavedPlan {
	version: "1.0.0";
	planningProfileId?: string;
	questions: PlanningQuestion[];
	areaReviews?: PlanningAreaReview[];
	assumptions: PlanAssumptions;
	priorities: string[];
	estateObjective?: {
		targetAmount: number;
	};
	notes: string;
	lastSavedAt?: string;
}

interface PlanResponse {
	householdId: string;

	savedPlan: SavedPlan;

	suggestions: {
		baseline: PlanningQuestion[];
		genetic: PlanningQuestion[];
	};

	planningProfile: {
		id: string;
		version: string;
		geneticUploadId?: string | null;
		updatedAt: string;
	} | null;

	planningSummary: PlanningSummary | null;

	updatedAt: string | null;
}

interface FinancialScenarioSummary {
	totalScenarioCost: number;
	totalScenarioSupport: number;
	totalNetScenarioCashFlow: number;
	totalAdditionalUnfundedCashFlow: number;
	endingLiquidWealthImpact: number;
	endingNetWorthImpact: number;
	firstAdditionalUnfundedDate?: string;
}

interface FinancialScenarioResult {
	summary: FinancialScenarioSummary;
	years?: Array<{
		date?: string;
		baselineFundingPosition?: number;
		stressedFundingPosition?: number;
		stressedLiquidWealth?: number;
		stressedNetWorth?: number;
		stressedUnfundedCashFlow?: number;
		unfundedCashFlowImpact?: number;
		additionalUnfundedCashFlow?: number;
		reducedUnfundedCashFlow?: number;
		liquidWealthImpact?: number;
		netWorthImpact?: number;
	}>;
}

interface RetirementScenarioResult {
	question: string;
	baseline: {
		retirementAge: number;
		annualIncome: number;
	};
	alternative: {
		retirementAge: number;
		annualIncome: number;
	};
	difference: {
		annualAmount: number;
		direction: "higher" | "lower" | "same";
	};
	interpretation: string;
}

interface ProtectionAssessmentResult {
	personId: string;

	annualIncomeAtRisk: number;

	lifeInsuranceCover: number;

	incomeProtectionAnnualBenefit: number;

	totalHouseholdLiabilities: number;

	liquidAssets: number;

	financialAssets: number;

	hasFinancialDependants: boolean;

	assessment: "strong" | "comfortable" | "worth_reviewing" | "exposed";

	reasons: string[];
}

interface PlanScenarioResponse {
	status: "completed" | "needs_input" | "not_financial_scenario";

	questionId: string;

	mode:
		| "financial_scenario"
		| "projection_comparison"
		| "readiness_review"
		| "protection_assessment";

	missingInputs?: string[];

	result?: FinancialScenarioResult | RetirementScenarioResult | ProtectionAssessmentResult;
}

function isFinancialScenarioResult(
	result: PlanScenarioResponse["result"],
): result is FinancialScenarioResult {
	return Boolean(
		result &&
		"summary" in result &&
		result.summary &&
		typeof result.summary.totalScenarioCost === "number" &&
		typeof result.summary.endingNetWorthImpact === "number",
	);
}

function isRetirementScenarioResult(
	result: PlanScenarioResponse["result"],
): result is RetirementScenarioResult {
	return (
		result !== undefined &&
		"baseline" in result &&
		"alternative" in result &&
		"difference" in result
	);
}

function isProtectionAssessmentResult(
	result: PlanScenarioResponse["result"],
): result is ProtectionAssessmentResult {
	return (
		result !== undefined &&
		"assessment" in result &&
		"financialAssets" in result &&
		"totalHouseholdLiabilities" in result &&
		"lifeInsuranceCover" in result &&
		"annualIncomeAtRisk" in result &&
		"hasFinancialDependants" in result &&
		Array.isArray(result.reasons)
	);
}

const DEFAULT_PRIORITIES = [
	"Protect household income",
	"Preserve financial flexibility",
	"Protect partner or dependants",
	"Fund a longer life",
	"Prepare for health costs",
	"Keep estate arrangements current",
];

type ExplorationEventId =
	| "retire"
	| "longer_life"
	| "life_insurance"
	| "health_costs"
	| "stop_working";

interface ExplorationEvent {
	id: ExplorationEventId;
	domain: PlanningDomain;
	title: string;
	question: string;
	description: string;
	icon: typeof HeartPulse;
}

const EXPLORATION_EVENTS: ExplorationEvent[] = [
	{
		id: "retire",
		domain: "healthy_working_life",
		title: "When could I retire?",
		question: "What happens if I retire earlier?",
		description:
			"See how changing your retirement age affects the income your plan could support.",
		icon: Coins,
	},
	{
		id: "longer_life",
		domain: "longevity",
		title: "Plan for a longer life",
		question: "What if my retirement needs to last longer?",
		description: "Test whether your financial plan remains resilient over a longer retirement.",
		icon: HeartPulse,
	},
	{
		id: "life_insurance",
		domain: "premature_mortality",
		title: "Do I still need life insurance?",
		question: "Is my family already financially secure if something happens to me?",
		description:
			"Review whether your current financial position and existing protection still leave a meaningful gap.",
		icon: ShieldCheck,
	},
	{
		id: "health_costs",
		domain: "health_costs",
		title: "Higher health costs",
		question: "What if my health costs increase for a few years?",
		description:
			"See how a defined period of higher health spending affects your long-term plan.",
		icon: HeartPulse,
	},
	{
		id: "stop_working",
		domain: "healthy_working_life",
		title: "Stop working earlier",
		question: "What if I can't work as long as I planned?",
		description: "Test the effect of stopping work earlier than your current plan assumes.",
		icon: Briefcase,
	},
];

function iconForDomain(domain: PlanningDomain) {
	switch (domain) {
		case "longevity":
			return HeartPulse;

		case "estate":
			return Landmark;

		case "premature_mortality":
		case "partner_dependency":
			return ShieldCheck;
		case "insurance":
		case "family":
			return ShieldCheck;

		case "health_costs":
		case "care_dependency":
		case "healthy_working_life":
			return Brain;

		case "income_interruption":
		default:
			return WalletCards;
	}
}

function mergeQuestions(
	saved: PlanningQuestion[],
	suggestions: PlanningQuestion[],
): PlanningQuestion[] {
	const savedById = new Map(saved.map((question) => [question.id, question]));

	const merged = suggestions.map((suggestion) => {
		const existing = savedById.get(suggestion.id);

		return existing
			? {
					...suggestion,
					selected: existing.selected,
				}
			: suggestion;
	});

	for (const question of saved) {
		if (!merged.some((item) => item.id === question.id)) {
			merged.push(question);
		}
	}

	return merged;
}

function numberValue(value: string): number | undefined {
	if (!value.trim()) {
		return undefined;
	}

	const parsed = Number(value);

	return Number.isFinite(parsed) ? parsed : undefined;
}

function outcomeLabel(outcome: PlanningOutcome) {
	switch (outcome) {
		case "strong":
			return "Strong";

		case "comfortable":
			return "Comfortable";

		case "worth_reviewing":
			return "Worth reviewing";

		case "exposed":
			return "Exposed";
	}
}

function iconForPlanningArea(area: PlanningArea) {
	switch (area) {
		case "financial_resilience":
			return Coins;

		case "income_work":
			return Briefcase;

		case "protection":
			return ShieldCheck;

		case "estate_family":
			return UsersRound;

		case "longevity_later_life":
			return HeartPulse;
	}
}

function planningAreaClass(area: PlanningArea) {
	switch (area) {
		case "financial_resilience":
			return styles.planningCardFinancial;

		case "income_work":
			return styles.planningCardIncome;

		case "protection":
			return styles.planningCardProtection;

		case "estate_family":
			return styles.planningCardEstate;

		case "longevity_later_life":
			return styles.planningCardLongevity;
	}
}

function reviewHrefForPlanningArea(area: PlanningArea): string | null {
	switch (area) {
		case "financial_resilience":
		case "income_work":
			return "/v2/wealth";

		case "estate_family":
			return "/v2/estate";

		case "longevity_later_life":
			return "/v2/longevity";

		case "protection":
			return null;
	}
}

function outcomeClass(outcome: PlanningOutcome) {
	switch (outcome) {
		case "strong":
			return styles.outcomeStrong;

		case "comfortable":
			return styles.outcomeComfortable;

		case "worth_reviewing":
			return styles.outcomeReview;

		case "exposed":
			return styles.outcomeExposed;
	}
}

function formatReviewDate(value?: string) {
	if (!value) {
		return null;
	}

	return new Date(value).toLocaleDateString(undefined, {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD",
		maximumFractionDigits: 0,
	}).format(value);
}

export function PlanWorkspace() {
	const [loading, setLoading] = useState(true);

	const [saving, setSaving] = useState(false);

	const [error, setError] = useState<string | null>(null);

	const [savedMessage, setSavedMessage] = useState<string | null>(null);

	const [questions, setQuestions] = useState<PlanningQuestion[]>([]);

	const [geneticQuestionIds, setGeneticQuestionIds] = useState<Set<string>>(new Set());

	const [assumptions, setAssumptions] = useState<PlanAssumptions>({});

	const [priorities, setPriorities] = useState<string[]>([]);

	const [notes, setNotes] = useState("");

	const [planningProfileId, setPlanningProfileId] = useState<string | undefined>();

	const [planningSummary, setPlanningSummary] = useState<PlanningSummary | null>(null);

	const [areaReviews, setAreaReviews] = useState<PlanningAreaReview[]>([]);

	const [dirty, setDirty] = useState(false);

	const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

	const [estateObjective, setEstateObjective] = useState<SavedPlan["estateObjective"]>(undefined);

	const [scenarioRunningId, setScenarioRunningId] = useState<string | null>(null);

	const [scenarioResults, setScenarioResults] = useState<Record<string, PlanScenarioResponse>>(
		{},
	);

	const [activeEventId, setActiveEventId] = useState<ExplorationEventId | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadPlan() {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/bioanalytix/plan", {
					method: "GET",
					credentials: "include",
					cache: "no-store",
				});

				if (!response.ok) {
					throw new Error("Unable to load your plan.");
				}

				const data = (await response.json()) as PlanResponse;

				if (cancelled) {
					return;
				}

				const suggestions = [...data.suggestions.baseline, ...data.suggestions.genetic];

				setQuestions(mergeQuestions(data.savedPlan.questions, suggestions));

				setGeneticQuestionIds(
					new Set(data.suggestions.genetic.map((question) => question.id)),
				);

				setAssumptions(data.savedPlan.assumptions ?? {});

				setPriorities(data.savedPlan.priorities ?? []);

				setNotes(data.savedPlan.notes ?? "");

				setPlanningProfileId(data.planningProfile?.id);

				setPlanningSummary(data.planningSummary ?? null);

				setAreaReviews(data.savedPlan.areaReviews ?? []);

				setEstateObjective(data.savedPlan.estateObjective);

				setDirty(false);

				setLastSavedAt(data.updatedAt ?? data.savedPlan.lastSavedAt ?? null);
			} catch (loadError) {
				setError(
					loadError instanceof Error ? loadError.message : "Unable to load your plan.",
				);
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		void loadPlan();

		return () => {
			cancelled = true;
		};
	}, []);

	const selectedQuestions = useMemo(
		() => questions.filter((question) => question.selected),
		[questions],
	);

	const activeEvent = EXPLORATION_EVENTS.find((event) => event.id === activeEventId) ?? null;

	const activeQuestion = useMemo(() => {
		if (!activeEvent) {
			return null;
		}

		return questions.find((question) => question.domain === activeEvent.domain) ?? null;
	}, [activeEvent, questions]);

	const reviewedAreaIds = useMemo(
		() =>
			new Set(
				areaReviews
					.filter((review) => review.status === "reviewed")
					.map((review) => review.area),
			),
		[areaReviews],
	);

	const coveredCount =
		planningSummary?.areas.filter(
			(area) => area.coverage === "covered" || reviewedAreaIds.has(area.area),
		).length ?? 0;

	const coverageTotal = planningSummary?.areas.length ?? 0;

	const coveragePercent =
		coverageTotal > 0 ? Math.round((coveredCount / coverageTotal) * 100) : 0;

	function markDirty() {
		setDirty(true);
		setSavedMessage(null);
	}

	function numericInputValue(value: string): number | undefined {
if (value.trim() === "") {
return undefined;
}

const parsed = Number(value);

return Number.isFinite(parsed) ? parsed : undefined;
}

function updateAssumption<K extends keyof PlanAssumptions>(key: K, value: PlanAssumptions[K]) {
		setAssumptions((current) => ({
			...current,
			[key]: value,
		}));

		markDirty();
	}

	function toggleAreaReview(area: PlanningArea) {
		setAreaReviews((current) => {
			const existing = current.find((review) => review.area === area);

			const reviewed = existing?.status === "reviewed";

			const nextReview: PlanningAreaReview = reviewed
				? {
						area,
						status: "to_review",
					}
				: {
						area,
						status: "reviewed",
						reviewedAt: new Date().toISOString(),
					};

			return [...current.filter((review) => review.area !== area), nextReview];
		});

		markDirty();
	}

	function toggleQuestion(id: string) {
		setQuestions((current) =>
			current.map((question) =>
				question.id === id
					? {
							...question,
							selected: !question.selected,
						}
					: question,
			),
		);

		markDirty();
	}

	function togglePriority(priority: string) {
		setPriorities((current) =>
			current.includes(priority)
				? current.filter((item) => item !== priority)
				: [...current, priority],
		);

		markDirty();
	}

	async function saveAndRunScenario(question: PlanningQuestion) {
		setSaving(true);
		setScenarioRunningId(question.id);
		setError(null);
		setSavedMessage(null);

		const nextQuestions = questions.map((item) =>
			item.id === question.id
				? {
						...item,
						selected: true,
					}
				: item,
		);

		const payload: SavedPlan = {
			version: "1.0.0",
			planningProfileId,
			questions: nextQuestions,
			areaReviews,
			assumptions,
			estateObjective,
			priorities,
			notes,
		};

		try {
			const saveResponse = await fetch("/api/bioanalytix/plan", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!saveResponse.ok) {
				const result = await saveResponse.json().catch(() => null);

				throw new Error(
					result?.message ?? result?.error ?? "Unable to save your scenario assumptions.",
				);
			}

			const saved = await saveResponse.json();

			setQuestions(nextQuestions);
			setDirty(false);
			setLastSavedAt(saved.updatedAt ?? saved.plan?.lastSavedAt ?? new Date().toISOString());

			const scenarioResponse = await fetch("/api/bioanalytix/plan/scenario", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					questionId: question.id,
				}),
			});

			if (!scenarioResponse.ok) {
				const result = await scenarioResponse.json().catch(() => null);

				throw new Error(
					result?.message ?? result?.error ?? "Unable to explore this scenario.",
				);
			}

			const result = (await scenarioResponse.json()) as PlanScenarioResponse;

			setScenarioResults((current) => ({
				...current,
				[question.id]: result,
			}));
		} catch (scenarioError) {
			setError(
				scenarioError instanceof Error
					? scenarioError.message
					: "Unable to explore this scenario.",
			);
		} finally {
			setSaving(false);
			setScenarioRunningId(null);
		}
	}

	async function savePlan() {
		setSaving(true);
		setError(null);
		setSavedMessage(null);

		const payload: SavedPlan = {
			version: "1.0.0",

			planningProfileId,

			questions,

			areaReviews,

			assumptions,

			estateObjective,

			priorities,

			notes,
		};

		try {
			const response = await fetch("/api/bioanalytix/plan", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const result = await response.json().catch(() => null);

				throw new Error(result?.message ?? result?.error ?? "Unable to save your plan.");
			}

			const result = await response.json();

			const savedAt =
				result.updatedAt ?? result.plan?.lastSavedAt ?? new Date().toISOString();

			setLastSavedAt(savedAt);
			setSavedMessage("Your plan has been saved.");
			setDirty(false);
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : "Unable to save your plan.");
		} finally {
			setSaving(false);
		}
	}

	if (loading) {
		return (
			<div className={styles.loadingCard}>
				<div className={styles.loadingPulse} />
				<p>Loading your plan…</p>
			</div>
		);
	}

	return (
		<div className={styles.workspace}>
			<section className={styles.intro}>
				<div>
					<p className={styles.eyebrow}>Your Plan</p>

					<h2 className={styles.title}>What would you like to explore?</h2>

					<p className={styles.description}>
						Choose a situation that&apos;s on your mind. Bioanalytix will help you
						understand how it could affect your long-term financial plan.
					</p>
				</div>

				<div className={styles.status}>
					<div className={styles.statusLabel}>Plan status</div>

					<strong>{lastSavedAt ? "Saved" : "Ready to explore"}</strong>

					{lastSavedAt ? (
						<div className={styles.savedAt}>
							Last saved {new Date(lastSavedAt).toLocaleString()}
						</div>
					) : (
						<div className={styles.savedAt}>
							Your scenarios will be saved to your Plan.
						</div>
					)}
				</div>
			</section>

			<section className={styles.exploreSection}>
				<div className={styles.sectionHeading}>
					<div>
						<p className={styles.eyebrow}>Explore a scenario</p>

						<h2>What&apos;s on your mind?</h2>

						<p>
							Start with a real-life question. You only need to enter the assumptions
							relevant to that situation.
						</p>
					</div>
				</div>

				<div className={styles.eventGrid}>
					{EXPLORATION_EVENTS.map((event) => {
						const Icon = event.icon;
						const question =
							questions.find((candidate) => candidate.domain === event.domain) ??
							null;

						const isActive = activeEventId === event.id;

						return (
							<button
								key={event.id}
								type="button"
								className={`${styles.eventCard} ${
									isActive ? styles.eventCardActive : ""
								}`}
								onClick={() => setActiveEventId(isActive ? null : event.id)}
							>
								<span className={styles.eventIcon}>
									<Icon size={18} />
								</span>

								<span className={styles.eventContent}>
									<strong>{event.title}</strong>
									<span>{event.question}</span>
									<small>{event.description}</small>
								</span>

								<span className={styles.eventArrow}>{isActive ? "−" : "→"}</span>
							</button>
						);
					})}
				</div>

				{activeEvent && (
					<div className={styles.explorationPanel}>
						{activeQuestion ? (
							<>
								<div className={styles.explorationHeader}>
									<div>
										<p className={styles.eyebrow}>Explore the impact</p>

										<h3>{activeEvent.question}</h3>

										<p>
											{activeEventId === "life_insurance"
												? "Review what your recorded financial position says about your current protection."
												: "Change the simple assumptions below and see how they affect your financial plan."}
										</p>
									</div>
								</div>

								<div className={styles.scenarioInputs}>
									{activeEventId === "health_costs" && (
										<>
											<label className={styles.scenarioField}>
												<span>Additional health costs each year</span>

												<div className={styles.inputWithPrefix}>
													<span>$</span>
													<input
														type="number"
														min="0"
														step="1000"
														value={
															assumptions.additionalAnnualHealthCosts ??
															""
														}
														onChange={(event) =>
															updateAssumption(
																"additionalAnnualHealthCosts",
																numericInputValue(event.target.value),
															)
														}
														placeholder="10,000"
													/>
												</div>
											</label>

											<label className={styles.scenarioField}>
												<span>For how many years?</span>

												<input
													type="number"
													min="1"
													step="1"
													value={
														assumptions.healthCostDurationYears ?? ""
													}
													onChange={(event) =>
														updateAssumption(
															"healthCostDurationYears",
															numericInputValue(event.target.value),
														)
													}
													placeholder="5"
												/>
											</label>
										</>
									)}

									{activeEventId === "retire" && (
										<label className={styles.scenarioField}>
											<span>What age would you like to retire?</span>

											<input
												type="number"
												min="40"
												max="80"
												step="1"
												value={assumptions.retirementAgeToTest ?? ""}
												onChange={(event) =>
													updateAssumption(
														"retirementAgeToTest",
														numericInputValue(event.target.value),
													)
												}
												placeholder="60"
											/>

											<small>
												We'll compare this with the retirement age in your
												current plan.
											</small>
										</label>
									)}
									{activeEventId === "stop_working" && (
										<label className={styles.scenarioField}>
											<span>Age to stop working</span>

											<input
												type="number"
												min="40"
												max="80"
												step="1"
												value={assumptions.retirementAgeToTest ?? ""}
												onChange={(event) =>
													updateAssumption(
														"retirementAgeToTest",
														numericInputValue(event.target.value),
													)
												}
												placeholder="60"
											/>

											<small>
												Choose an earlier age at which work might end and
												compare it with your current plan.
											</small>
										</label>
									)}
								</div>

								{activeEventId === "longer_life" ? (
									<div className={styles.scenarioNotice}>
										<strong>Explore this in Longevity</strong>

										<p>
											Your Longevity workspace already compares longer
											planning horizons without treating them as lifespan
											predictions.
										</p>

										<a href="/v2/longevity">Open Longevity →</a>
									</div>
								) : (
									<div className={styles.explorationActions}>
										<div>
											<strong>Ready to see the effect?</strong>

											<span>
												{activeEventId === "life_insurance"
													? "We'll assess your current position using the financial information already recorded in Bioanalytix."
													: "We'll save these assumptions to your Plan and run the scenario."}
											</span>
										</div>

										<button
											type="button"
											className={styles.primaryAction}
											disabled={scenarioRunningId === activeQuestion.id}
											onClick={() => saveAndRunScenario(activeQuestion)}
										>
											{scenarioRunningId === activeQuestion.id
												? "Calculating…"
												: activeEventId === "life_insurance"
													? "Review my protection"
													: "See impact on my plan"}
										</button>
									</div>
								)}

								{(() => {
									const result = scenarioResults[activeQuestion.id];

									if (!result) {
										return null;
									}

									if (result.status === "needs_input") {
										return (
											<div className={styles.explorationResult}>
												<strong>We need a little more information</strong>

												<p>
													{result.missingInputs?.join(" ") ??
														"Complete the assumptions above and try again."}
												</p>
											</div>
										);
									}

									if (result.status === "not_financial_scenario") {
										return (
											<div className={styles.explorationResult}>
												<strong>This is a planning question</strong>

												<p>
													This question is better explored as a planning
													review rather than a financial simulation.
												</p>
											</div>
										);
									}

									if (
										result.status === "completed" &&
										isProtectionAssessmentResult(result.result)
									) {
										const protection = result.result;

										const assessmentLabel =
											protection.assessment === "worth_reviewing"
												? "Worth reviewing"
												: protection.assessment === "strong"
													? "Strong"
													: protection.assessment === "comfortable"
														? "Comfortable"
														: "Exposed";

										return (
											<div className={styles.explorationResult}>
												<div className={styles.resultHeading}>
													<div>
														<p className={styles.eyebrow}>
															Current protection position
														</p>

														<h3>{assessmentLabel}</h3>
													</div>
												</div>

												<div className={styles.scenarioMetrics}>
													<div>
														<span>Financial assets</span>
														<strong>
															{formatCurrency(
																protection.financialAssets,
															)}
														</strong>
													</div>

													<div>
														<span>Household liabilities</span>
														<strong>
															{formatCurrency(
																protection.totalHouseholdLiabilities,
															)}
														</strong>
													</div>

													<div>
														<span>Current life insurance</span>
														<strong>
															{formatCurrency(
																protection.lifeInsuranceCover,
															)}
														</strong>
													</div>

													<div>
														<span>Annual income at risk</span>
														<strong>
															{formatCurrency(
																protection.annualIncomeAtRisk,
															)}
														</strong>
													</div>

													<div>
														<span>Financial dependants</span>
														<strong>
															{protection.hasFinancialDependants
																? "Yes"
																: "No"}
														</strong>
													</div>
												</div>

												{protection.reasons.map((reason) => (
													<p
														key={reason}
														className={styles.resultExplanation}
													>
														{reason}
													</p>
												))}

												<p className={styles.resultExplanation}>
													This is a broad planning assessment of your
													recorded financial position. It does not
													determine an optimal amount of insurance or
													recommend whether you should keep or cancel
													cover.
												</p>
											</div>
										);
									}

									if (
										result.status === "completed" &&
										isFinancialScenarioResult(result.result)
									) {
										const summary = result.result.summary;

										return (
											<div className={styles.explorationResult}>
												<div className={styles.resultHeading}>
													<div>
														<p className={styles.eyebrow}>
															Impact on your plan
														</p>

														<h3>Here&apos;s what changes</h3>
													</div>
												</div>

												<div className={styles.scenarioMetrics}>
													<div>
														<span>Additional cost</span>
														<strong>
															{formatCurrency(
																summary.totalScenarioCost,
															)}
														</strong>
													</div>

													<div>
														<span>Additional funding shortfall</span>
														<strong>
															{formatCurrency(
																summary.totalAdditionalUnfundedCashFlow,
															)}
														</strong>
													</div>
												</div>

												<p className={styles.resultExplanation}>
													This is the financial effect of the assumptions
													you entered. Your genetic information can help
													identify questions worth exploring, but it does
													not determine these financial values.
												</p>
											</div>
										);
									}

									if (
										result.status === "completed" &&
										isRetirementScenarioResult(result.result)
									) {
										const isStopWorking = activeEventId === "stop_working";

										const baselineAge = result.result.baseline.retirementAge;
										const alternativeAge =
											result.result.alternative.retirementAge;
										const annualDifference =
											result.result.difference.annualAmount;

										const stopWorkingInterpretation =
											annualDifference < 0
												? `Stopping work at ${alternativeAge} instead of ${baselineAge} reduces the modelled sustainable annual retirement income by ${formatCurrency(
														Math.abs(annualDifference),
													)}.`
												: annualDifference > 0
													? `Stopping work at ${alternativeAge} instead of ${baselineAge} increases the modelled sustainable annual retirement income by ${formatCurrency(
															annualDifference,
														)}.`
													: `Stopping work at age ${alternativeAge} produces the same modelled sustainable annual retirement income as your current plan.`;

										return (
											<div className={styles.explorationResult}>
												<div className={styles.resultHeading}>
													<div>
														<p className={styles.eyebrow}>
															Impact on your plan
														</p>

														<h3>
															{isStopWorking
																? "Earlier end to working life"
																: "Retirement comparison"}
														</h3>
													</div>
												</div>

												<div className={styles.scenarioComparison}>
													<div>
														<span>Your current plan</span>

														<strong>
															{isStopWorking
																? `Work until age ${baselineAge}`
																: `Retire at age ${baselineAge}`}
														</strong>

														<small>
															{formatCurrency(
																result.result.baseline.annualIncome,
															)}{" "}
															annual retirement income
														</small>
													</div>

													<div>
														<span>What you&apos;re testing</span>

														<strong>
															{isStopWorking
																? `Stop working at age ${alternativeAge}`
																: `Retire at age ${alternativeAge}`}
														</strong>

														<small>
															{formatCurrency(
																result.result.alternative
																	.annualIncome,
															)}{" "}
															annual retirement income
														</small>
													</div>
												</div>

												<p className={styles.resultExplanation}>
													{isStopWorking
														? stopWorkingInterpretation
														: result.result.interpretation}
												</p>
											</div>
										);
									}

									return null;
								})()}
							</>
						) : (
							<div className={styles.scenarioNotice}>
								<strong>
									This question isn&apos;t yet available as a guided scenario.
								</strong>

								<p>
									Ask Bioanalytix about it instead. It can help frame the question
									using the planning information already in your account.
								</p>
							</div>
						)}
					</div>
				)}
			</section>

			{planningSummary && (
				<section className={styles.section}>
					<div className={styles.planningHeader}>
						<div>
							<p className={styles.eyebrow}>Your planning position</p>

							<h3 className={styles.sectionTitle}>
								{coveredCount === coverageTotal && coverageTotal > 0
									? "Your planning areas are covered"
									: planningSummary.headline}
							</h3>

							<p className={styles.sectionDescription}>
								{coveredCount === coverageTotal && coverageTotal > 0
									? "You've reviewed the areas requiring attention and your current Plan covers all five planning areas."
									: planningSummary.summary}
							</p>
						</div>

						<div className={styles.reviewProgress}>
							<div className={styles.reviewProgressTop}>
								<strong>
									Your plan covers {coveredCount} of {coverageTotal} areas
								</strong>

								<span>{coveragePercent}%</span>
							</div>

							<div className={styles.reviewProgressTrack}>
								<div
									className={styles.reviewProgressFill}
									style={{ width: `${coveragePercent}%` }}
								/>
							</div>
						</div>
					</div>

					<div className={styles.planningGrid}>
						{planningSummary.areas.map((area) => {
							const Icon = iconForPlanningArea(area.area);

							const review = areaReviews.find((item) => item.area === area.area);

							const reviewed = review?.status === "reviewed";

							const reviewHref = reviewHrefForPlanningArea(area.area);

							return (
								<div
									key={area.area}
									className={[
										styles.planningCard,
										planningAreaClass(area.area),
										reviewed ? styles.planningCardReviewed : "",
									].join(" ")}
								>
									<div className={styles.planningCardTop}>
										<div className={styles.planningIcon}>
											<Icon size={22} />
										</div>

										<div className={styles.planningCardHeading}>
											<div className={styles.planningCardTitle}>
												{area.title}
											</div>

											<div className={styles.planningBadges}>
												<span
													className={[
														styles.outcomeBadge,
														outcomeClass(area.outcome),
													].join(" ")}
												>
													{outcomeLabel(area.outcome)}
												</span>

												{area.geneticsIncreasesAttention && (
													<span className={styles.geneticBadge}>
														<Dna size={12} />
														DNA-informed
													</span>
												)}
											</div>
										</div>
									</div>

									<p className={styles.planningSummaryText}>{area.summary}</p>

									{area.geneticContext && (
										<p className={styles.planningGeneticContext}>
											{area.geneticContext}
										</p>
									)}

									<p className={styles.planningQuestion}>{area.question}</p>

									<div className={styles.planningReviewFooter}>
										{reviewed ? (
											<>
												<button
													type="button"
													className={[
														styles.reviewButton,
														styles.reviewButtonReviewed,
													].join(" ")}
													onClick={() => toggleAreaReview(area.area)}
													aria-pressed={true}
												>
													<span className={styles.reviewCircle}>
														<Check size={13} />
													</span>
													Reviewed
												</button>

												{review.reviewedAt && (
													<span className={styles.reviewDate}>
														Reviewed{" "}
														{formatReviewDate(review.reviewedAt)}
													</span>
												)}
											</>
										) : area.coverage === "covered" ? (
											<div
												className={[
													styles.reviewButton,
													styles.reviewButtonReviewed,
												].join(" ")}
											>
												<span className={styles.reviewCircle}>
													<Check size={13} />
												</span>
												Covered by your plan
											</div>
										) : (
											<>
												<button
													type="button"
													className={styles.reviewButton}
													onClick={() => toggleAreaReview(area.area)}
													aria-pressed={false}
												>
													<span className={styles.reviewCircle} />

													<span>Mark as reviewed</span>
												</button>

												{reviewHref && (
													<a
														href={reviewHref}
														className={styles.reviewLink}
													>
														Review <ChevronRight size={13} />
													</a>
												)}
											</>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</section>
			)}

			{error && (
				<div className={styles.error}>
					<AlertCircle size={18} />
					<span>{error}</span>
				</div>
			)}

			<AskBioanalytix />

			<section className={styles.section}>
				<div className={styles.panel}>
					<h3 className={styles.sectionTitle}>What matters most?</h3>

					<p className={styles.sectionDescription}>
						Choose the priorities you want the plan to protect.
					</p>

					<div className={styles.priorityList}>
						{DEFAULT_PRIORITIES.map((priority) => {
							const selected = priorities.includes(priority);

							return (
								<button
									type="button"
									key={priority}
									onClick={() => togglePriority(priority)}
									className={[
										styles.priorityButton,
										selected ? styles.priorityButtonSelected : "",
									].join(" ")}
								>
									{selected && <Check size={14} />}

									<span>{priority}</span>
								</button>
							);
						})}
					</div>

					<label className={styles.notesField}>
						<span>Notes</span>

						<textarea
							value={notes}
							onChange={(event) => {
								setNotes(event.target.value);
								markDirty();
							}}
							placeholder="Anything else you want the plan to remember?"
							rows={6}
						/>
					</label>
				</div>
			</section>

			<section className={styles.saveBar}>
				<div>
					<strong>Your plan stays with your account.</strong>

					<p>Save now and these choices will be restored the next time you return.</p>
				</div>

				<div className={styles.saveActions}>
					{dirty && !savedMessage && (
						<span className={styles.unsavedMessage}>
							<span className={styles.unsavedDot} />
							You have unsaved changes
						</span>
					)}
					{savedMessage && (
						<span className={styles.savedMessage}>
							<Check size={15} />
							{savedMessage}
						</span>
					)}

					<button
						type="button"
						className={styles.saveButton}
						disabled={saving}
						onClick={() => void savePlan()}
					>
						<Save size={16} />

						{saving ? "Saving…" : "Save my plan"}
					</button>
				</div>
			</section>
		</div>
	);
}

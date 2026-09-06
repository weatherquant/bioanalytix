"use client";

import {
	AlertCircle,
	Brain,
	Check,
	ChevronRight,
	Dna,
	HeartPulse,
	Landmark,
	Save,
	ShieldCheck,
	WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import styles from "./PlanWorkspace.module.css";

type PlanningDomain =
	| "healthy_working_life"
	| "health_costs"
	| "care_dependency"
	| "premature_mortality"
	| "longevity"
	| "income_interruption"
	| "estate"
	| "partner_dependency";

type PlanningQuestionSource =
	| "genetic_profile"
	| "household"
	| "estate"
	| "insurance"
	| "longevity"
	| "user";

type PlanningSignificance = "low" | "moderate" | "high";

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
	additionalAnnualCareCosts?: number;
	retirementYearsExtension?: number;
	earlierDeathAge?: number;
	insuranceShortfall?: number;
}

interface SavedPlan {
	version: "1.0.0";
	planningProfileId?: string;
	questions: PlanningQuestion[];
	assumptions: PlanAssumptions;
	priorities: string[];
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

	updatedAt: string | null;
}

const DEFAULT_PRIORITIES = [
	"Protect household income",
	"Preserve financial flexibility",
	"Protect partner or dependants",
	"Fund a longer life",
	"Prepare for health costs",
	"Keep estate arrangements current",
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

	const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

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

		setSavedMessage(null);
	}

	function togglePriority(priority: string) {
		setPriorities((current) =>
			current.includes(priority)
				? current.filter((item) => item !== priority)
				: [...current, priority],
		);

		setSavedMessage(null);
	}

	async function savePlan() {
		setSaving(true);
		setError(null);
		setSavedMessage(null);

		const payload: SavedPlan = {
			version: "1.0.0",

			planningProfileId,

			questions,

			assumptions,

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
					<p className={styles.eyebrow}>Your working plan</p>

					<h2 className={styles.title}>What should you test?</h2>

					<p className={styles.description}>
						Choose the questions that matter to you. Bioanalytix will use these as the
						basis for future scenario analysis.
					</p>
				</div>

				<div className={styles.status}>
					<div className={styles.statusValue}>{selectedQuestions.length}</div>

					<div className={styles.statusLabel}>questions selected</div>

					{lastSavedAt && (
						<div className={styles.savedAt}>
							Saved {new Date(lastSavedAt).toLocaleString()}
						</div>
					)}
				</div>
			</section>

			{error && (
				<div className={styles.error}>
					<AlertCircle size={18} />
					<span>{error}</span>
				</div>
			)}

			<section className={styles.section}>
				<div className={styles.sectionHeader}>
					<div>
						<h3 className={styles.sectionTitle}>Questions worth exploring</h3>

						<p className={styles.sectionDescription}>
							These suggestions come from your household profile and, where supported,
							your genetic evidence.
						</p>
					</div>
				</div>

				<div className={styles.questionGrid}>
					{questions.map((question) => {
						const Icon = iconForDomain(question.domain);

						const isGenetic =
							geneticQuestionIds.has(question.id) ||
							question.source === "genetic_profile";

						return (
							<button
								type="button"
								key={question.id}
								onClick={() => toggleQuestion(question.id)}
								className={[
									styles.questionCard,
									question.selected ? styles.questionCardSelected : "",
								].join(" ")}
							>
								<div className={styles.questionTop}>
									<div className={styles.questionIcon}>
										<Icon size={18} />
									</div>

									<div
										className={[
											styles.checkbox,
											question.selected ? styles.checkboxSelected : "",
										].join(" ")}
									>
										{question.selected && <Check size={14} />}
									</div>
								</div>

								<div className={styles.questionBody}>
									<div className={styles.questionLabels}>
										<span className={styles.questionDomain}>
											{question.title}
										</span>

										{isGenetic && (
											<span className={styles.geneticBadge}>
												<Dna size={12} />
												DNA-informed
											</span>
										)}
									</div>

									<p className={styles.questionText}>{question.question}</p>

									<p className={styles.questionRationale}>{question.rationale}</p>
								</div>

								<div className={styles.questionFooter}>
									<span>{question.significance} significance</span>

									<ChevronRight size={15} />
								</div>
							</button>
						);
					})}
				</div>

				{geneticQuestionIds.size === 0 && (
					<div className={styles.geneticNotice}>
						<Dna size={18} />

						<div>
							<strong>
								No additional DNA-attributed planning questions are currently
								supported.
							</strong>

							<p>
								Your genetic file has been analysed, but the current evidence does
								not justify adding a genotype-specific financial scenario.
							</p>
						</div>
					</div>
				)}
			</section>

			<section className={styles.twoColumnGrid}>
				<div className={styles.panel}>
					<h3 className={styles.sectionTitle}>Your assumptions</h3>

					<p className={styles.sectionDescription}>
						Set the values you want to use when Bioanalytix runs your what-if scenarios.
					</p>

					<div className={styles.fieldGrid}>
						<label className={styles.field}>
							<span>Income interruption</span>

							<div className={styles.inputWithSuffix}>
								<input
									type="number"
									min="0"
									value={assumptions.incomeInterruptionMonths ?? ""}
									onChange={(event) =>
										setAssumptions((current) => ({
											...current,
											incomeInterruptionMonths: numberValue(
												event.target.value,
											),
										}))
									}
								/>

								<span>months</span>
							</div>
						</label>

						<label className={styles.field}>
							<span>Essential spending increase</span>

							<div className={styles.inputWithSuffix}>
								<input
									type="number"
									min="0"
									value={assumptions.essentialSpendingIncreasePercent ?? ""}
									onChange={(event) =>
										setAssumptions((current) => ({
											...current,
											essentialSpendingIncreasePercent: numberValue(
												event.target.value,
											),
										}))
									}
								/>

								<span>%</span>
							</div>
						</label>

						<label className={styles.field}>
							<span>Additional annual health costs</span>

							<div className={styles.inputWithPrefix}>
								<span>$</span>

								<input
									type="number"
									min="0"
									value={assumptions.additionalAnnualHealthCosts ?? ""}
									onChange={(event) =>
										setAssumptions((current) => ({
											...current,
											additionalAnnualHealthCosts: numberValue(
												event.target.value,
											),
										}))
									}
								/>
							</div>
						</label>

						<label className={styles.field}>
							<span>Additional annual care costs</span>

							<div className={styles.inputWithPrefix}>
								<span>$</span>

								<input
									type="number"
									min="0"
									value={assumptions.additionalAnnualCareCosts ?? ""}
									onChange={(event) =>
										setAssumptions((current) => ({
											...current,
											additionalAnnualCareCosts: numberValue(
												event.target.value,
											),
										}))
									}
								/>
							</div>
						</label>

						<label className={styles.field}>
							<span>Longer retirement</span>

							<div className={styles.inputWithSuffix}>
								<input
									type="number"
									min="0"
									value={assumptions.retirementYearsExtension ?? ""}
									onChange={(event) =>
										setAssumptions((current) => ({
											...current,
											retirementYearsExtension: numberValue(
												event.target.value,
											),
										}))
									}
								/>

								<span>years</span>
							</div>
						</label>

						<label className={styles.field}>
							<span>Insurance shortfall</span>

							<div className={styles.inputWithPrefix}>
								<span>$</span>

								<input
									type="number"
									min="0"
									value={assumptions.insuranceShortfall ?? ""}
									onChange={(event) =>
										setAssumptions((current) => ({
											...current,
											insuranceShortfall: numberValue(event.target.value),
										}))
									}
								/>
							</div>
						</label>
					</div>
				</div>

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
								setSavedMessage(null);
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

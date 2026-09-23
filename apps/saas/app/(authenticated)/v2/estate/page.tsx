"use client";

import { ArrowRight, CheckCircle2, Circle, Loader2, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./EstatePage.module.css";

type EstateAssessment = "strong" | "comfortable" | "review" | "exposed";

interface EstatePosition {
	assessment: EstateAssessment;
	economicAssessment: EstateAssessment;
	documentationAssessment: EstateAssessment;

	totalAssets: number;
	totalLiabilities: number;
	netHouseholdResources: number;

	inheritanceGoal: {
		targetAmount: number;
		priority?: string;
	} | null;

	currentSurplusOrShortfallToGoal: number | null;

	documentation: {
		hasWill: boolean | null;
		hasEnduringPowerOfAttorney: boolean | null;
		hasSuperBeneficiaryNomination: boolean | null;
	};

	reasons: string[];
	qualifications: string[];
}

interface EstateObjective {
	targetAmount: number;
}

interface ObjectiveComparison {
	targetAmount: number;
	currentSurplusOrShortfall: number;
}

interface LegacyComparison {
	retirementAge: number;
	strategyId: string;
	strategyName: string;
	targetAmount: number;
	baselineAnnualRetirementSpending: number;
	withInheritanceObjectiveAnnualRetirementSpending: number;
	annualSpendingDifference: number;
	objectiveAchievableAtZeroSpending: boolean;
	projectionYears: number;
	maximumRetirementShortfallProbability: number;
	maximumInheritanceShortfallProbability: number;
}

interface LegacyComparisonResponse {
	status: "complete" | "missing_financial_state" | "missing_estate_objective";
	comparison: LegacyComparison | null;
}

interface EstateProjectionPoint {
	age: number;
	projectionDate: string;
	p25Estate: number;
	medianEstate: number;
	p75Estate: number;
}

interface EstateProjection {
	simulationCount: number;
	currency: string;

	longevity: {
		lowerAge: number;
		centralAge: number;
		upperAge: number;
	};

	projection: EstateProjectionPoint[];

	atCentralLongevityAge: {
		age: number;
		p25Estate: number;
		medianEstate: number;
		p75Estate: number;
	};

	atLongLifeAge: {
		age: number;
		p25Estate: number;
		medianEstate: number;
		p75Estate: number;
	};

	qualifications: string[];
}

interface EstatePlanningHorizon {
	version: string;

	range: {
		lowerAge: number;
		centralAge: number;
		upperAge: number;
	};

	projectionYears: number;
	qualifications: string[];
}

interface EstateResponse {
	householdId: string;
	estatePosition: EstatePosition | null;
	estateObjective: EstateObjective | null;
	objectiveComparison: ObjectiveComparison | null;
	planningHorizon: EstatePlanningHorizon | null;
	projection: EstateProjection | null;
}

interface SavedPlanResponse {
	savedPlan: {
		version: string;
		planningProfileId?: string;
		questions: unknown[];
		areaReviews?: unknown[];
		assumptions: Record<string, number>;
		estateObjective?: EstateObjective;
		priorities: string[];
		notes: string;
		lastSavedAt?: string;
	};
}

function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD",
		maximumFractionDigits: 0,
	}).format(value);
}

function assessmentLabel(assessment: EstateAssessment) {
	switch (assessment) {
		case "strong":
			return "Strong";
		case "comfortable":
			return "Comfortable";
		case "review":
			return "Worth reviewing";
		case "exposed":
			return "Exposed";
	}
}

function ReadinessItem({ label, value }: { label: string; value: boolean | null }) {
	const recorded = value === true;

	return (
		<div className={styles.readinessItem}>
			<span>{label}</span>

			<div className={styles.readinessStatus}>
				{recorded ? <CheckCircle2 size={17} /> : <Circle size={17} />}

				<span>{recorded ? "In place" : "Not recorded"}</span>
			</div>
		</div>
	);
}

export default function EstatePage() {
	const [data, setData] = useState<EstateResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [editingGoal, setEditingGoal] = useState(false);
	const [goalAmount, setGoalAmount] = useState("");
	const [savingGoal, setSavingGoal] = useState(false);
	const [goalError, setGoalError] = useState<string | null>(null);
	const [legacyComparison, setLegacyComparison] = useState<LegacyComparison | null>(null);
	const [loadingLegacyComparison, setLoadingLegacyComparison] = useState(false);
	const [legacyComparisonError, setLegacyComparisonError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadEstate() {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/bioanalytix/estate", {
					method: "GET",
					credentials: "include",
					cache: "no-store",
				});

				if (!response.ok) {
					throw new Error("Unable to load your estate position.");
				}

				const result = (await response.json()) as EstateResponse;

				if (!cancelled) {
					setData(result);
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "Unable to load your estate position.",
					);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		void loadEstate();

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (data?.estateObjective) {
			setGoalAmount(String(data.estateObjective.targetAmount));
		}
	}, [data?.estateObjective]);

	async function saveEstateGoal() {
		const targetAmount = Number(goalAmount.replace(/,/g, "").trim());

		if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
			setGoalError("Enter an inheritance goal greater than zero.");
			return;
		}

		setSavingGoal(true);
		setGoalError(null);

		try {
			const planResponse = await fetch("/api/bioanalytix/plan", {
				method: "GET",
				credentials: "include",
				cache: "no-store",
			});

			if (!planResponse.ok) {
				throw new Error("Unable to load your Plan.");
			}

			const planData = (await planResponse.json()) as SavedPlanResponse;

			const updatedPlan = {
				...planData.savedPlan,
				estateObjective: {
					targetAmount,
				},
			};

			const saveResponse = await fetch("/api/bioanalytix/plan", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updatedPlan),
			});

			if (!saveResponse.ok) {
				const result = await saveResponse.json().catch(() => null);

				throw new Error(
					result?.message ?? result?.error ?? "Unable to save your inheritance goal.",
				);
			}

			const estateResponse = await fetch("/api/bioanalytix/estate", {
				method: "GET",
				credentials: "include",
				cache: "no-store",
			});

			if (!estateResponse.ok) {
				throw new Error("Your goal was saved, but Estate could not be refreshed.");
			}

			const refreshedEstate = (await estateResponse.json()) as EstateResponse;

			setData(refreshedEstate);
			setLegacyComparison(null);
			setLegacyComparisonError(null);
			setEditingGoal(false);
		} catch (saveError) {
			setGoalError(
				saveError instanceof Error
					? saveError.message
					: "Unable to save your inheritance goal.",
			);
		} finally {
			setSavingGoal(false);
		}
	}

	async function exploreLegacyTradeOff() {
		setLoadingLegacyComparison(true);
		setLegacyComparisonError(null);

		try {
			const response = await fetch("/api/bioanalytix/estate/legacy-comparison", {
				method: "POST",
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Unable to explore this trade-off right now.");
			}

			const result = (await response.json()) as LegacyComparisonResponse;

			if (result.status !== "complete" || !result.comparison) {
				throw new Error(
					"We need a little more information before this trade-off can be explored.",
				);
			}

			setLegacyComparison(result.comparison);
		} catch (comparisonError) {
			setLegacyComparisonError(
				comparisonError instanceof Error
					? comparisonError.message
					: "Unable to explore this trade-off right now.",
			);
		} finally {
			setLoadingLegacyComparison(false);
		}
	}

	if (loading) {
		return (
			<div className={styles.loadingCard}>
				<Loader2 size={20} className={styles.spinner} />
				<p>Loading your estate position…</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.workspace}>
				<section className={styles.intro}>
					<div>
						<p className={styles.eyebrow}>Estate</p>
						<h1 className={styles.title}>What might you leave behind?</h1>
					</div>
				</section>

				<div className={styles.card}>
					<p>{error}</p>
				</div>
			</div>
		);
	}

	const estate = data?.estatePosition;

	if (!estate) {
		return (
			<div className={styles.workspace}>
				<section className={styles.intro}>
					<div>
						<p className={styles.eyebrow}>Estate</p>
						<h1 className={styles.title}>What might you leave behind?</h1>
						<p className={styles.description}>
							Complete your financial profile before Bioanalytix can assess your
							estate position.
						</p>
					</div>
				</section>

				<Link href="/v2/setup" className={styles.primaryLink}>
					Complete your profile
					<ArrowRight size={17} />
				</Link>
			</div>
		);
	}

	return (
		<div className={styles.workspace}>
			<section className={styles.intro}>
				<div>
					<p className={styles.eyebrow}>Estate</p>

					<h1 className={styles.title}>What might you leave behind?</h1>

					<p className={styles.description}>
						Your current household position provides the starting point for thinking
						about what you may leave to the people who matter to you.
					</p>
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.heroCard}>
					<p className={styles.cardLabel}>Net household resources</p>

					<div className={styles.heroValue}>
						{formatCurrency(estate.netHouseholdResources)}
					</div>

					<div className={styles.financialGrid}>
						<div>
							<p className={styles.metricLabel}>Total assets</p>
							<p className={styles.metricValue}>
								{formatCurrency(estate.totalAssets)}
							</p>
						</div>

						<div>
							<p className={styles.metricLabel}>Total liabilities</p>
							<p className={styles.metricValue}>
								{formatCurrency(estate.totalLiabilities)}
							</p>
						</div>
					</div>

					<p className={styles.qualification}>
						This is a broad financial-planning measure of household resources, not a
						legal probate-estate calculation.
					</p>
				</div>
			</section>

			{data?.projection && data.planningHorizon ? (
				<section className={styles.section}>
					<div className={styles.sectionHeader}>
						<div>
							<p className={styles.eyebrow}>Long-term planning</p>
							<h2 className={styles.sectionTitle}>
								What might remain later in life?
							</h2>
							<p className={styles.sectionDescription}>
								Explore projected household wealth across governed longevity
								planning horizons. These ages are planning assumptions, not
								predictions of how long you will live.
							</p>
						</div>
					</div>

					<div className={styles.projectionGrid}>
						<div className={styles.projectionCard}>
							<p className={styles.cardLabel}>
								Central planning age {data.projection.atCentralLongevityAge.age}
							</p>

							<p className={styles.projectionValue}>
								{formatCurrency(data.projection.atCentralLongevityAge.medianEstate)}
							</p>

							<p className={styles.supportingText}>
								Median projected household net worth
							</p>

							<div className={styles.projectionRange}>
								<div>
									<span>25th percentile</span>
									<strong>
										{formatCurrency(
											data.projection.atCentralLongevityAge.p25Estate,
										)}
									</strong>
								</div>

								<div>
									<span>75th percentile</span>
									<strong>
										{formatCurrency(
											data.projection.atCentralLongevityAge.p75Estate,
										)}
									</strong>
								</div>
							</div>
						</div>

						<div className={styles.projectionCard}>
							<p className={styles.cardLabel}>
								Long-life planning age {data.projection.atLongLifeAge.age}
							</p>

							<p className={styles.projectionValue}>
								{formatCurrency(data.projection.atLongLifeAge.medianEstate)}
							</p>

							<p className={styles.supportingText}>
								Median projected household net worth
							</p>

							<div className={styles.projectionRange}>
								<div>
									<span>25th percentile</span>
									<strong>
										{formatCurrency(data.projection.atLongLifeAge.p25Estate)}
									</strong>
								</div>

								<div>
									<span>75th percentile</span>
									<strong>
										{formatCurrency(data.projection.atLongLifeAge.p75Estate)}
									</strong>
								</div>
							</div>
						</div>
					</div>

					<p className={styles.projectionQualification}>
						Based on {data.projection.simulationCount} simulations using the baseline
						planning assumptions and your current recurring household spending as the
						initial retirement-spending assumption. Projected amounts represent
						household net worth for financial-planning purposes, not a guaranteed
						inheritance or legal probate-estate value. Life insurance is not
						automatically added to these projections.
					</p>
				</section>
			) : null}

			<section className={styles.section}>
				<div className={styles.sectionHeader}>
					<div>
						<p className={styles.eyebrow}>Your legacy</p>
						<h2 className={styles.sectionTitle}>Inheritance</h2>
					</div>
				</div>

				<div className={styles.card}>
					{editingGoal ? (
						<div className={styles.goalEditor}>
							<div>
								<p className={styles.cardLabel}>
									How much would you like to leave behind?
								</p>
								<p className={styles.supportingText}>
									Set a household inheritance objective for your Plan.
								</p>
							</div>

							<div className={styles.goalInputRow}>
								<div className={styles.goalInputWrap}>
									<span>$</span>
									<input
										type="text"
										inputMode="numeric"
										value={goalAmount}
										onChange={(event) => {
											setGoalAmount(event.target.value);
											setGoalError(null);
										}}
										placeholder="1,000,000"
										className={styles.goalInput}
										aria-label="Inheritance goal"
									/>
								</div>

								<button
									type="button"
									className={styles.saveGoalButton}
									onClick={() => void saveEstateGoal()}
									disabled={savingGoal}
								>
									{savingGoal ? "Saving…" : "Save goal"}
								</button>

								<button
									type="button"
									className={styles.cancelGoalButton}
									onClick={() => {
										setEditingGoal(false);
										setGoalError(null);
										setGoalAmount(
											data?.estateObjective
												? String(data.estateObjective.targetAmount)
												: "",
										);
									}}
									disabled={savingGoal}
								>
									Cancel
								</button>
							</div>

							{goalError ? <p className={styles.goalError}>{goalError}</p> : null}
						</div>
					) : (
						<>
							<div className={styles.legacyRow}>
								<div>
									<p className={styles.cardLabel}>Inheritance goal</p>
									<p className={styles.supportingText}>
										How much you would like to leave behind.
									</p>
								</div>

								<div className={styles.goalSummary}>
									<strong className={styles.legacyValue}>
										{data?.estateObjective
											? formatCurrency(data.estateObjective.targetAmount)
											: "Not set"}
									</strong>

									<button
										type="button"
										className={styles.editGoalButton}
										onClick={() => setEditingGoal(true)}
									>
										{data?.estateObjective ? "Edit goal" : "Set goal"}
									</button>
								</div>
							</div>

							{data?.objectiveComparison ? (
								<div className={styles.position}>
									<p className={styles.cardLabel}>Difference today</p>

									<p className={styles.positionValue}>
										{data.objectiveComparison.currentSurplusOrShortfall >= 0
											? "+"
											: "−"}
										{formatCurrency(
											Math.abs(
												data.objectiveComparison.currentSurplusOrShortfall,
											),
										)}
									</p>

									<p className={styles.supportingText}>
										Your current household resources are{" "}
										{data.objectiveComparison.currentSurplusOrShortfall >= 0
											? "above"
											: "below"}{" "}
										your inheritance goal by this amount.
									</p>

									<p className={styles.goalQualification}>
										This is a comparison with your current household resources.
										It does not estimate what will remain later in life.
									</p>
								</div>
							) : (
								<div className={styles.position}>
									<p className={styles.supportingText}>
										Set an inheritance goal to compare it with your current
										household position.
									</p>
								</div>
							)}

							{data?.estateObjective ? (
								<div className={styles.tradeOff}>
									{legacyComparison ? (
										<>
											<div className={styles.tradeOffHeader}>
												<div>
													<p className={styles.cardLabel}>
														How might this affect retirement?
													</p>
													<p className={styles.supportingText}>
														Compare retirement spending with and without
														your inheritance goal.
													</p>
												</div>
											</div>

											<div className={styles.tradeOffGrid}>
												<div>
													<p className={styles.metricLabel}>
														Without a legacy target
													</p>
													<p className={styles.tradeOffValue}>
														{formatCurrency(
															legacyComparison.baselineAnnualRetirementSpending,
														)}
														<span> p.a.</span>
													</p>
												</div>

												<div>
													<p className={styles.metricLabel}>
														While targeting{" "}
														{formatCurrency(
															legacyComparison.targetAmount,
														)}{" "}
														remaining
													</p>
													<p className={styles.tradeOffValue}>
														{formatCurrency(
															legacyComparison.withInheritanceObjectiveAnnualRetirementSpending,
														)}
														<span> p.a.</span>
													</p>
												</div>
											</div>

											<div className={styles.tradeOffResult}>
												<p className={styles.cardLabel}>
													Potential trade-off
												</p>

												<p className={styles.tradeOffDifference}>
													{formatCurrency(
														Math.abs(
															legacyComparison.annualSpendingDifference,
														),
													)}{" "}
													p.a. less retirement spending
												</p>
											</div>

											<p className={styles.goalQualification}>
												Illustrative {legacyComparison.strategyName}{" "}
												strategy from age {legacyComparison.retirementAge}{" "}
												over a {legacyComparison.projectionYears}-year model
												horizon. The amount remaining is modelled household
												wealth, not a guaranteed inheritance or legal estate
												value.
											</p>

											<Link
												href={`/v2/plan?ask=${encodeURIComponent(
													`What does my ${formatCurrency(
														legacyComparison.targetAmount,
													)} inheritance goal mean for my retirement spending?`,
												)}`}
												className={styles.tradeOffAsk}
											>
												<MessageCircleQuestion size={16} />
												Ask Bioanalytix about this
												<ArrowRight size={15} />
											</Link>
										</>
									) : (
										<>
											<p className={styles.cardLabel}>
												How might this affect retirement?
											</p>

											<p className={styles.supportingText}>
												Keeping money for your family can mean spending less
												during retirement. Explore the trade-off using your
												current Plan.
											</p>

											<button
												type="button"
												className={styles.exploreButton}
												onClick={() => void exploreLegacyTradeOff()}
												disabled={loadingLegacyComparison}
											>
												{loadingLegacyComparison ? (
													<>
														<Loader2
															size={16}
															className={styles.spinner}
														/>
														Exploring trade-off…
													</>
												) : (
													<>
														Explore the trade-off
														<ArrowRight size={16} />
													</>
												)}
											</button>

											{legacyComparisonError ? (
												<p className={styles.goalError}>
													{legacyComparisonError}
												</p>
											) : null}
										</>
									)}
								</div>
							) : null}
						</>
					)}
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionHeader}>
					<div>
						<p className={styles.eyebrow}>Basic arrangements</p>
						<h2 className={styles.sectionTitle}>Estate readiness</h2>
					</div>
				</div>

				<div className={styles.card}>
					<ReadinessItem label="Will" value={estate.documentation.hasWill} />

					<ReadinessItem
						label="Power of attorney"
						value={estate.documentation.hasEnduringPowerOfAttorney}
					/>

					<ReadinessItem
						label="Super beneficiary"
						value={estate.documentation.hasSuperBeneficiaryNomination}
					/>
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionHeader}>
					<div>
						<p className={styles.eyebrow}>Ask Bioanalytix</p>

						<h2 className={styles.sectionTitle}>Questions worth exploring</h2>

						<p className={styles.sectionDescription}>
							Explore how different choices and assumptions could affect what you
							leave behind.
						</p>
					</div>
				</div>

				<div className={styles.questionsCard}>
					<Link
						href={`/v2/plan?ask=${encodeURIComponent(
							"How much might I leave to my family?",
						)}`}
						className={styles.question}
					>
						<MessageCircleQuestion size={16} />
						<span>How much might I leave to my family?</span>
						<ArrowRight size={15} className={styles.questionArrow} />
					</Link>

					<Link
						href={`/v2/plan?ask=${encodeURIComponent(
							"Could I leave $500,000 to each of my children?",
						)}`}
						className={styles.question}
					>
						<MessageCircleQuestion size={16} />
						<span>Could I leave $500,000 to each of my children?</span>
						<ArrowRight size={15} className={styles.questionArrow} />
					</Link>

					<Link
						href={`/v2/plan?ask=${encodeURIComponent(
							"What might I leave if I live to 95?",
						)}`}
						className={styles.question}
					>
						<MessageCircleQuestion size={16} />
						<span>What might I leave if I live to 95?</span>
						<ArrowRight size={15} className={styles.questionArrow} />
					</Link>

					<Link
						href={`/v2/plan?ask=${encodeURIComponent(
							"What happens if I spend more in retirement?",
						)}`}
						className={styles.question}
					>
						<MessageCircleQuestion size={16} />
						<span>What happens if I spend more in retirement?</span>
						<ArrowRight size={15} className={styles.questionArrow} />
					</Link>

					<Link href="/v2/plan" className={styles.primaryLink}>
						Ask Bioanalytix
						<ArrowRight size={17} />
					</Link>
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

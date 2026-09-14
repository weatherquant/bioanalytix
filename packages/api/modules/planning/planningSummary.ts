import type { BioanalytixPlanningProfileV1 } from "./planningProfile";

export type PlanningOutcome = "strong" | "comfortable" | "worth_reviewing" | "exposed";

export type PlanningCoverage = "covered" | "review_recommended";

export type PlanningArea =
	| "financial_resilience"
	| "income_work"
	| "protection"
	| "estate_family"
	| "longevity_later_life";

export interface PlanningSummaryArea {
	area: PlanningArea;
	title: string;
	outcome: PlanningOutcome;
	coverage: PlanningCoverage;
	summary: string;
	question: string;
	geneticContext?: string;
	geneticsIncreasesAttention: boolean;
}

export interface PlanningSummary {
	overallOutcome: PlanningOutcome;
	headline: string;
	summary: string;
	areas: PlanningSummaryArea[];
	priorities: PlanningSummaryArea[];
}

type PlanningSummaryAreaAssessment = Omit<PlanningSummaryArea, "coverage">;

export const PLANNING_SUMMARY_POLICY = {
	liquidityMonths: {
		exposedBelow: 3,
		reviewBelow: 6,
		strongAtOrAbove: 12,
	},
	incomeToEssentialExpenses: {
		exposedBelow: 1,
		reviewBelow: 1.25,
		strongAtOrAbove: 2,
	},
} as const;

function monthsOfEssentialExpenses(profile: BioanalytixPlanningProfileV1): number | null {
	const annualExpenses = profile.householdContext.annualEssentialExpenses;

	if (annualExpenses <= 0) {
		return null;
	}

	return profile.householdContext.liquidAssets / (annualExpenses / 12);
}

function hasGeneticDomain(profile: BioanalytixPlanningProfileV1, domains: string[]): boolean {
	return profile.exposures.some(
		(exposure) =>
			domains.includes(exposure.domain) &&
			(exposure.significance === "moderate" || exposure.significance === "high"),
	);
}

function financialResilienceArea(
	profile: BioanalytixPlanningProfileV1,
): PlanningSummaryAreaAssessment {
	const months = monthsOfEssentialExpenses(profile);

	let outcome: PlanningOutcome = "comfortable";
	let summary =
		"Your available financial resources provide a useful foundation for handling unexpected change.";

	if (months !== null && months >= PLANNING_SUMMARY_POLICY.liquidityMonths.strongAtOrAbove) {
		outcome = "strong";
		summary =
			"Your liquid resources provide a strong buffer against a period of unexpected disruption.";
	} else if (months !== null && months < PLANNING_SUMMARY_POLICY.liquidityMonths.exposedBelow) {
		outcome = "exposed";
		summary =
			"Your readily available financial buffer may be limited if an unexpected disruption occurs.";
	} else if (months !== null && months < PLANNING_SUMMARY_POLICY.liquidityMonths.reviewBelow) {
		outcome = "worth_reviewing";
		summary =
			"Your financial buffer is useful, but resilience to a longer disruption is worth reviewing.";
	}

	const geneticsIncreasesAttention = hasGeneticDomain(profile, [
		"health_costs",
		"care_dependency",
		"income_interruption",
		"partner_dependency",
	]);

	return {
		area: "financial_resilience",
		title: "Financial resilience",
		outcome,
		summary,
		question:
			"Would your finances remain comfortable through an extended period of unexpected costs or disruption?",
		geneticContext: geneticsIncreasesAttention
			? "Your genetic profile makes resilience to health, care or income disruption more relevant to explore."
			: undefined,
		geneticsIncreasesAttention,
	};
}

function incomeWorkArea(profile: BioanalytixPlanningProfileV1): PlanningSummaryAreaAssessment {
	const income = profile.householdContext.annualIncome;
	const essentialExpenses = profile.householdContext.annualEssentialExpenses;

	const coverage = essentialExpenses > 0 ? income / essentialExpenses : null;

	let outcome: PlanningOutcome = "comfortable";
	let summary =
		"Your current income provides reasonable support for essential household spending.";

	if (
		coverage !== null &&
		coverage >= PLANNING_SUMMARY_POLICY.incomeToEssentialExpenses.strongAtOrAbove
	) {
		outcome = "strong";
		summary =
			"Current income provides substantial capacity above essential household spending.";
	} else if (
		coverage !== null &&
		coverage < PLANNING_SUMMARY_POLICY.incomeToEssentialExpenses.exposedBelow
	) {
		outcome = "exposed";
		summary = "Current income does not fully cover recorded essential household spending.";
	} else if (
		coverage !== null &&
		coverage < PLANNING_SUMMARY_POLICY.incomeToEssentialExpenses.reviewBelow
	) {
		outcome = "worth_reviewing";
		summary = "Your household appears relatively dependent on maintaining current income.";
	}

	const geneticsIncreasesAttention = hasGeneticDomain(profile, [
		"healthy_working_life",
		"income_interruption",
	]);

	return {
		area: "income_work",
		title: "Income & work",
		outcome,
		summary,
		question:
			"How would your household adapt if your income or ability to work changed for a period?",
		geneticContext: geneticsIncreasesAttention
			? "Your genetic profile makes resilience to changes in healthy working life worth considering."
			: undefined,
		geneticsIncreasesAttention,
	};
}

function protectionArea(profile: BioanalytixPlanningProfileV1): PlanningSummaryAreaAssessment {
	const hasCover = profile.householdContext.insuranceCoverCount > 0;

	const geneticsIncreasesAttention = hasGeneticDomain(profile, [
		"insurance",
		"premature_mortality",
		"partner_dependency",
	]);

	return {
		area: "protection",
		title: "Protection",
		outcome: hasCover ? "comfortable" : "worth_reviewing",
		summary: hasCover
			? "You have insurance arrangements recorded as part of your household plan."
			: "No insurance cover is currently recorded, so protection needs are worth reviewing.",
		question:
			"Would the people who depend on you remain financially secure if your circumstances changed unexpectedly?",
		geneticContext: geneticsIncreasesAttention
			? "Your genetic profile makes protection and household dependency more relevant to review."
			: undefined,
		geneticsIncreasesAttention,
	};
}

function estateFamilyArea(profile: BioanalytixPlanningProfileV1): PlanningSummaryAreaAssessment {
	const estate = profile.householdContext.estate;

	const completed = [
		estate.hasWill,
		estate.hasEnduringPowerOfAttorney,
		estate.hasSuperBeneficiaryNomination,
	].filter((value) => value === true).length;

	const unknown = [
		estate.hasWill,
		estate.hasEnduringPowerOfAttorney,
		estate.hasSuperBeneficiaryNomination,
	].filter((value) => value === null).length;

	let outcome: PlanningOutcome = "comfortable";
	let summary = "Your core estate arrangements appear broadly in place.";

	if (completed === 3) {
		outcome = "strong";
		summary =
			"Your core will, decision-making and beneficiary arrangements are recorded as being in place.";
	} else if (completed === 0 && unknown === 0) {
		outcome = "exposed";
		summary = "Your core estate arrangements are recorded as not currently being in place.";
	} else if (completed < 2 || unknown > 0) {
		outcome = "worth_reviewing";
		summary = "Some estate arrangements are incomplete or have not yet been confirmed.";
	}

	const geneticsIncreasesAttention = hasGeneticDomain(profile, [
		"estate",
		"family",
		"premature_mortality",
	]);

	return {
		area: "estate_family",
		title: "Estate & family",
		outcome,
		summary,
		question:
			"Are your estate documents and family arrangements clear and current if circumstances change unexpectedly?",
		geneticContext: geneticsIncreasesAttention
			? "Your genetic profile makes estate and family resilience more relevant to consider."
			: undefined,
		geneticsIncreasesAttention,
	};
}

function longevityArea(profile: BioanalytixPlanningProfileV1): PlanningSummaryAreaAssessment {
	const geneticsIncreasesAttention = hasGeneticDomain(profile, ["longevity", "care_dependency"]);

	return {
		area: "longevity_later_life",
		title: "Longevity & later life",
		outcome: geneticsIncreasesAttention ? "worth_reviewing" : "comfortable",
		summary: geneticsIncreasesAttention
			? "Later-life resilience deserves some additional attention in your planning."
			: "Nothing in your current genetic planning profile requires a change to your longevity assumptions.",
		question:
			"Would your plan remain comfortable if retirement, health and care needs lasted longer than expected?",
		geneticContext: geneticsIncreasesAttention
			? "Your genetic profile makes later-life resilience more relevant to explore, without predicting your lifespan."
			: undefined,
		geneticsIncreasesAttention,
	};
}

function coverageForOutcome(outcome: PlanningOutcome): PlanningCoverage {
	return outcome === "worth_reviewing" || outcome === "exposed"
		? "review_recommended"
		: "covered";
}

function outcomeRank(outcome: PlanningOutcome): number {
	switch (outcome) {
		case "exposed":
			return 4;
		case "worth_reviewing":
			return 3;
		case "comfortable":
			return 2;
		case "strong":
			return 1;
	}
}

export function buildPlanningSummary(profile: BioanalytixPlanningProfileV1): PlanningSummary {
	const areas = [
		financialResilienceArea(profile),
		incomeWorkArea(profile),
		protectionArea(profile),
		estateFamilyArea(profile),
		longevityArea(profile),
	].map((area) => ({
		...area,
		coverage: coverageForOutcome(area.outcome),
	}));

	const priorities = [...areas]
		.filter((area) => area.outcome === "exposed" || area.outcome === "worth_reviewing")
		.sort((a, b) => outcomeRank(b.outcome) - outcomeRank(a.outcome))
		.slice(0, 3);

	const worstOutcome =
		[...areas].sort((a, b) => outcomeRank(b.outcome) - outcomeRank(a.outcome))[0]?.outcome ??
		"comfortable";

	const overallOutcome: PlanningOutcome =
		worstOutcome === "exposed" ? "worth_reviewing" : worstOutcome;

	return {
		overallOutcome,
		headline:
			overallOutcome === "strong"
				? "Your foundations look strong"
				: overallOutcome === "comfortable"
					? "Your foundations look comfortable"
					: "A few areas deserve your attention",
		summary:
			priorities.length === 0
				? "Your current household and planning information does not highlight any major areas requiring attention."
				: "Your overall position has useful foundations, with a small number of areas worth reviewing.",
		areas,
		priorities,
	};
}

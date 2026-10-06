import type { ScenarioProjectionYear } from "../scenarios/types";
import {
	DEFAULT_RESILIENCE_THRESHOLDS,
	ResilienceAssessmentError,
	type ResilienceAssessment,
	type ResilienceAssessmentInput,
	type ResilienceLevel,
	type ResilienceThresholds,
} from "./types";

function validateThresholds(thresholds: ResilienceThresholds): void {
	const reasons: string[] = [];

	if (!Number.isFinite(thresholds.resilientAbsorptionRatio)) {
		reasons.push("Resilient absorption ratio must be a finite number.");
	}

	if (thresholds.resilientAbsorptionRatio < 0 || thresholds.resilientAbsorptionRatio > 1) {
		reasons.push("Resilient absorption ratio must be between 0 and 1.");
	}

	if (reasons.length > 0) {
		throw new ResilienceAssessmentError("Resilience thresholds are invalid.", reasons);
	}
}

function minimumStressedLiquidWealth(years: ScenarioProjectionYear[]): number {
	if (years.length === 0) {
		throw new ResilienceAssessmentError("Scenario result cannot be assessed.", [
			"Scenario result contains no projection years.",
		]);
	}

	return Math.min(...years.map((year) => year.stressedLiquidWealth));
}

function calculateAbsorbedScenarioCost(
	grossScenarioCost: number,
	additionalUnfundedNeed: number,
): number {
	return Math.max(0, grossScenarioCost - additionalUnfundedNeed);
}

function calculateAbsorptionRatio(grossScenarioCost: number, absorbedScenarioCost: number): number {
	if (grossScenarioCost === 0) {
		return 1;
	}

	return Math.min(1, Math.max(0, absorbedScenarioCost / grossScenarioCost));
}

function classifyResilience(
	additionalUnfundedNeed: number,
	absorptionRatio: number,
	thresholds: ResilienceThresholds,
): ResilienceLevel {
	if (additionalUnfundedNeed === 0) {
		return "resilient";
	}

	if (absorptionRatio >= thresholds.resilientAbsorptionRatio) {
		return "strained";
	}

	return "unfunded";
}

function createReasons(
	level: ResilienceLevel,
	grossScenarioCost: number,
	scenarioSupport: number,
	additionalUnfundedNeed: number,
	reducedBaselineUnfundedNeed: number,
): string[] {
	const reasons: string[] = [];

	if (grossScenarioCost > 0) {
		reasons.push("The scenario introduces additional financial demands to the household plan.");
	}

	if (scenarioSupport > 0) {
		reasons.push("Explicit financial support offsets part or all of the scenario impact.");
	}

	if (reducedBaselineUnfundedNeed > 0) {
		reasons.push(
			"Scenario support also reduces an unmet funding need already present in the baseline projection.",
		);
	}

	if (additionalUnfundedNeed > 0) {
		reasons.push(
			"The scenario creates additional financial needs that cannot be fully funded from the resources modelled.",
		);
	}

	if (level === "resilient") {
		reasons.push(
			"The modelled household resources and support absorb the scenario without creating additional unmet funding need.",
		);
	}

	if (level === "strained") {
		reasons.push("Most of the scenario is absorbed, but a residual funding gap remains.");
	}

	if (level === "unfunded") {
		reasons.push(
			"The scenario creates a material residual funding gap relative to the modelled financial demand.",
		);
	}

	return reasons;
}

/**
 * Convert a ScenarioResult into a financial resilience
 * interpretation.
 *
 * This function does not rerun the projection and does
 * not infer event probabilities, diagnoses, longevity,
 * genetic effects or insurance entitlement.
 *
 * It only interprets financial outputs already produced
 * by the Scenario Engine.
 */
export function assessResilience(input: ResilienceAssessmentInput): ResilienceAssessment {
	const { scenarioResult } = input;

	const thresholds = input.thresholds ?? DEFAULT_RESILIENCE_THRESHOLDS;

	validateThresholds(thresholds);

	if (scenarioResult.years.length === 0) {
		throw new ResilienceAssessmentError("Scenario result cannot be assessed.", [
			"Scenario result contains no projection years.",
		]);
	}

	const {
		totalScenarioCost,
		totalScenarioSupport,
		totalAdditionalUnfundedCashFlow,
		totalReducedUnfundedCashFlow,
		endingLiquidWealthImpact,
		endingNetWorthImpact,
		firstAdditionalUnfundedDate,
	} = scenarioResult.summary;

	const absorbedScenarioCost = calculateAbsorbedScenarioCost(
		totalScenarioCost,
		totalAdditionalUnfundedCashFlow,
	);

	const absorptionRatio = calculateAbsorptionRatio(totalScenarioCost, absorbedScenarioCost);

	const level = classifyResilience(totalAdditionalUnfundedCashFlow, absorptionRatio, thresholds);

	const minimumLiquidity = minimumStressedLiquidWealth(scenarioResult.years);

	const finalYear = scenarioResult.years[scenarioResult.years.length - 1]!;

	return {
		scenarioId: scenarioResult.scenario.id,

		scenarioName: scenarioResult.scenario.name,

		level,

		grossScenarioCost: totalScenarioCost,

		scenarioSupport: totalScenarioSupport,

		additionalUnfundedNeed: totalAdditionalUnfundedCashFlow,

		reducedBaselineUnfundedNeed: totalReducedUnfundedCashFlow,

		absorbedScenarioCost,

		absorptionRatio,

		minimumStressedLiquidWealth: minimumLiquidity,

		endingStressedLiquidWealth: finalYear.stressedLiquidWealth,

		endingLiquidWealthImpact,

		endingNetWorthImpact,

		firstAdditionalUnfundedDate,

		reasons: createReasons(
			level,
			totalScenarioCost,
			totalScenarioSupport,
			totalAdditionalUnfundedCashFlow,
			totalReducedUnfundedCashFlow,
		),
	};
}

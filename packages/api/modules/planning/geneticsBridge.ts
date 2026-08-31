import type { BiologicalInsight } from "../genetics/evidence/insight";
import { assertMayGeneratePlanningExposures } from "../genetics/evidence/modelPolicyGuards";
import type { PlanningExposure, PlanningSignificance } from "./types";

function isHigher(insight: BiologicalInsight): boolean {
	return insight.result.direction === "higher";
}

function significanceForFinding(
	insight: BiologicalInsight,
	positiveFinding: PlanningSignificance,
): PlanningSignificance {
	return isHigher(insight) ? positiveFinding : "low";
}

export function biologicalInsightToPlanningExposures(
	insight: BiologicalInsight,
): PlanningExposure[] {
	assertMayGeneratePlanningExposures(insight);
	switch (insight.id) {
		case "factor-v-leiden-vte":
			return factorVLeidenPlanningExposures(insight);

		case "apoe-alzheimer-susceptibility":
			return apoePlanningExposures(insight);

		default:
			return [];
	}
}

function factorVLeidenPlanningExposures(insight: BiologicalInsight): PlanningExposure[] {
	/*
	 * A reference or unresolved genotype does not justify
	 * attributing these exposures to the genetic finding.
	 */
	if (!isHigher(insight)) {
		return [];
	}

	return [
		{
			domain: "healthy_working_life",
			significance: significanceForFinding(insight, "moderate"),
			basis: "biological_insight",
			rationale:
				"A thrombotic event could interrupt employment or reduce healthy working capacity. The scenario represents financial exposure rather than a prediction that an event will occur.",
			sourceInsightIds: [insight.id],
		},
		{
			domain: "health_costs",
			significance: significanceForFinding(insight, "moderate"),
			basis: "biological_insight",
			rationale:
				"Potential acute or recurrent thrombotic events could create healthcare and recovery costs. This is a planning scenario rather than an estimate of personal medical expenditure.",
			sourceInsightIds: [insight.id],
		},
		{
			domain: "premature_mortality",
			significance: significanceForFinding(insight, "moderate"),
			basis: "biological_insight",
			rationale:
				"Venous thromboembolism can have serious consequences, but the genetic finding alone is not a mortality forecast.",
			sourceInsightIds: [insight.id],
		},
	];
}

function apoePlanningExposures(insight: BiologicalInsight): PlanningExposure[] {
	/*
	 * APOE reference or indeterminate results should not
	 * create genotype-attributed planning exposures.
	 *
	 * Baseline dementia/cognitive-decline resilience can
	 * still be modelled elsewhere as a general planning
	 * scenario independent of APOE.
	 */
	if (!isHigher(insight)) {
		return [];
	}

	return [
		{
			domain: "care_dependency",
			significance: "high",
			basis: "biological_insight",
			rationale:
				"Later-life cognitive impairment could materially increase care requirements and household financial needs. APOE susceptibility does not predict that impairment will occur.",
			sourceInsightIds: [insight.id],
		},
		{
			domain: "healthy_working_life",
			significance: "moderate",
			basis: "biological_insight",
			rationale:
				"Cognitive decline before planned retirement could shorten healthy working life, although APOE genotype does not predict that this will occur.",
			sourceInsightIds: [insight.id],
		},
		{
			domain: "estate",
			significance: "moderate",
			basis: "biological_insight",
			rationale:
				"Potential future cognitive incapacity makes estate, decision-making and financial-authority resilience relevant to scenario planning.",
			sourceInsightIds: [insight.id],
		},
		{
			domain: "partner_dependency",
			significance: "moderate",
			basis: "biological_insight",
			rationale:
				"Long-term cognitive impairment could create additional care and financial responsibilities for a partner or household.",
			sourceInsightIds: [insight.id],
		},
	];
}

import type { BiologicalInsight } from "../genetics/evidence/insight";
import { biologicalInsightToPlanningExposures } from "./geneticsBridge";
import type {
	PlanningInsight,
	PlanningInsightEvidenceStrength,
	PlanningInsightSignificance,
} from "./planningInsight";
import type { PlanningExposure, PlanningExposureDomain } from "./types";

export const PLANNING_INSIGHT_ENGINE_VERSION = "1.0.0";

export type PlanningInsightGovernanceContext = "development" | "production";

function evidenceStrength(insight: BiologicalInsight): PlanningInsightEvidenceStrength {
	switch (insight.confidence.evidenceStrength) {
		case "established":
		case "strong":
			return "strong";

		case "moderate":
			return "moderate";

		case "limited":
			return "limited";

		case "insufficient":
		default:
			return "limited";
	}
}

function financialSignificance(exposure: PlanningExposure): PlanningInsightSignificance {
	switch (exposure.significance) {
		case "high":
			return "high";

		case "moderate":
			return "moderate";

		case "low":
		default:
			return "low";
	}
}

function evidenceExplanation(insight: BiologicalInsight): string {
	const strength = evidenceStrength(insight);

	if (insight.result.direction === "higher") {
		return [
			"This genetic finding is associated with a higher biological risk signal.",
			`The underlying evidence is classified as ${strength}.`,
			"This does not mean that a particular condition or financial cost will occur.",
		].join(" ");
	}

	return [
		"This genetic finding does not currently create a higher-risk planning signal.",
		`The underlying evidence is classified as ${strength}.`,
	].join(" ");
}

function qualificationText(exposure: PlanningExposure): string | undefined {
	if (exposure.qualifications.length === 0) {
		return undefined;
	}

	return exposure.qualifications.join(" ");
}

function healthCostInsight({
	insight,
	exposure,
	geneticUploadId,
}: {
	insight: BiologicalInsight;
	exposure: PlanningExposure;
	geneticUploadId?: string;
}): PlanningInsight {
	const qualification = qualificationText(exposure);

	return {
		id: `planning-health-${insight.id}`,

		domain: "health_costs",

		title: "Health-cost resilience may deserve more attention",

		summary:
			"A genetic finding in your profile makes future health-related financial resilience worth exploring.",

		evidence: {
			modelIds: [insight.model.id],

			strength: evidenceStrength(insight),

			direction: "higher",

			explanation: evidenceExplanation(insight),
		},

		financialImpact: {
			significance: financialSignificance(exposure),

			affectedPlanAreas: [
				"retirement reserves",
				"late-life liquidity",
				"health-cost contingency",
			],

			explanation: [exposure.rationale, qualification].filter(Boolean).join(" "),
		},

		explorations: [
			{
				id: "explore-health-costs",

				label: "Explore health-cost resilience",

				description:
					"See how additional health and recovery costs could affect retirement liquidity and financial resilience.",
			},
		],

		provenance: {
			insightVersion: PLANNING_INSIGHT_ENGINE_VERSION,

			modelIds: [insight.model.id],

			geneticUploadId,

			generatedAt: new Date().toISOString(),
		},
	};
}

function lateLifeCareInsight({
	insight,
	exposure,
	geneticUploadId,
}: {
	insight: BiologicalInsight;
	exposure: PlanningExposure;
	geneticUploadId?: string;
}): PlanningInsight {
	const qualification = qualificationText(exposure);

	return {
		id: `planning-care-${insight.id}`,

		domain: "late_life_care",

		title: "Later-life care funding may be more important",

		summary:
			"A genetic finding in your profile makes later-life care resilience worth considering as part of your long-term plan.",

		evidence: {
			modelIds: [insight.model.id],

			strength: evidenceStrength(insight),

			direction: "higher",

			explanation: evidenceExplanation(insight),
		},

		financialImpact: {
			significance: financialSignificance(exposure),

			affectedPlanAreas: [
				"late-life care reserve",
				"retirement liquidity",
				"estate preservation",
				"partner resilience",
			],

			explanation: [exposure.rationale, qualification].filter(Boolean).join(" "),
		},

		explorations: [
			{
				id: "explore-care-costs",

				label: "Explore later-life care",

				description:
					"See how sustained care costs could affect retirement assets, household liquidity and estate outcomes.",
			},
		],

		provenance: {
			insightVersion: PLANNING_INSIGHT_ENGINE_VERSION,

			modelIds: [insight.model.id],

			geneticUploadId,

			generatedAt: new Date().toISOString(),
		},
	};
}

function insightForExposure({
	insight,
	exposure,
	geneticUploadId,
}: {
	insight: BiologicalInsight;
	exposure: PlanningExposure;
	geneticUploadId?: string;
}): PlanningInsight | null {
	switch (exposure.domain as PlanningExposureDomain) {
		case "health_costs":
			return healthCostInsight({
				insight,
				exposure,
				geneticUploadId,
			});

		case "care_dependency":
			return lateLifeCareInsight({
				insight,
				exposure,
				geneticUploadId,
			});

		/*
		 * Alpha deliberately ignores the remaining planning
		 * domains for now.
		 *
		 * The genetics/planning bridge may legitimately produce
		 * healthy-working-life, premature-mortality, estate or
		 * partner-dependency exposures, but they should only
		 * become user-facing PlanningInsights once we have a
		 * useful genetics-native financial interpretation for
		 * them.
		 */
		case "healthy_working_life":
		case "premature_mortality":
		case "estate":
		case "partner_dependency":
		case "longevity":
			return null;

		default:
			return null;
	}
}

/**
 * Translate governed biological findings into the small set
 * of genetics-informed PlanningInsights supported by Alpha.
 *
 * Genetics determines which financial planning topics may
 * deserve attention.
 *
 * This function does NOT:
 *
 * - create dollar estimates from genotype;
 * - alter the user's saved Plan;
 * - change retirement age;
 * - change insurance cover;
 * - prescribe investments;
 * - forecast personal mortality.
 */
export function buildPlanningInsights({
	insights,
	geneticUploadId,
	governanceContext = "development",
}: {
	insights: BiologicalInsight[];
	geneticUploadId?: string;
	governanceContext?: PlanningInsightGovernanceContext;
}): PlanningInsight[] {
	const result: PlanningInsight[] = [];

	for (const insight of insights) {
		/*
		 * Alpha is deliberately fail-closed.
		 *
		 * Reference and indeterminate findings do not generate
		 * genetics-attributed financial planning insights.
		 */
		if (insight.result.direction !== "higher") {
			continue;
		}

		const exposures = biologicalInsightToPlanningExposures(insight, governanceContext);

		for (const exposure of exposures) {
			const planningInsight = insightForExposure({
				insight,
				exposure,
				geneticUploadId,
			});

			if (planningInsight) {
				result.push(planningInsight);
			}
		}
	}

	return result;
}

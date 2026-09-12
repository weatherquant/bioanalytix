import type { BiologicalInsight } from "../genetics/evidence/insight";
import { assessPlanningEligibility, type PlanningGovernanceContext } from "./planningEligibility";
import {
	PLANNING_EXPOSURE_CONSTRAINTS,
	type PlanningExposure,
	type PlanningExposureDomain,
	type PlanningSignificance,
} from "./types";

interface ExposureDefinition {
	id: string;

	domain: PlanningExposureDomain;

	significance: PlanningSignificance;

	rationale: string;
}

interface ConfirmedClinicalExposureDefinition {
	id: string;

	domain: PlanningExposure["domain"];

	significance: PlanningExposure["significance"];

	rationale: string;
}

function confirmedClinicalPlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
	definitions: ConfirmedClinicalExposureDefinition[],
): PlanningExposure[] {
	if (!isHigher(insight)) {
		return [];
	}

	if (insight.input.confirmationStatus !== "confirmed") {
		return [];
	}

	return definitions.map((definition) =>
		createBiologicalExposure(insight, definition, qualifications),
	);
}

function isHigher(insight: BiologicalInsight): boolean {
	return insight.result.direction === "higher";
}

/**
 * Planning eligibility operates inside the genetics /
 * governance boundary and may contain model-specific
 * identifiers.
 *
 * PlanningExposure is the finance-facing boundary.
 * Internal model identifiers must therefore not pass
 * through in free-text qualifications.
 */
function planningQualificationsForExposure(
	insight: BiologicalInsight,
	qualifications: string[],
): string[] {
	const modelId = insight.model.id.toLowerCase();

	return qualifications.map((qualification) => {
		const normalized = qualification.toLowerCase();

		if (normalized.includes(modelId) && normalized.includes("scientific approval")) {
			return "The underlying biological model has not yet completed scientific approval and is being exercised in development only.";
		}

		if (normalized.includes(modelId) && normalized.includes("production release")) {
			return "The underlying biological model has not yet been approved for production release.";
		}

		/**
		 * Any remaining model identifier is removed
		 * defensively rather than exposed across the
		 * planning boundary.
		 */
		return qualification.replace(
			new RegExp(escapeRegExp(insight.model.id), "gi"),
			"the underlying biological model",
		);
	});
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createBiologicalExposure(
	insight: BiologicalInsight,
	definition: ExposureDefinition,
	qualifications: string[],
): PlanningExposure {
	return {
		id: definition.id,

		domain: definition.domain,

		significance: definition.significance,

		basis: "biological_insight",

		rationale: definition.rationale,

		qualifications: planningQualificationsForExposure(insight, qualifications),

		uncertainty: {
			evidenceStrength: insight.confidence.evidenceStrength,

			populationApplicability: insight.confidence.populationApplicability,

			confirmationStatus: insight.input.confirmationStatus,

			sourceType: insight.input.source,
		},

		constraints: {
			...PLANNING_EXPOSURE_CONSTRAINTS,
		},
	};
}

/**
 * Translate an eligible BiologicalInsight into
 * financial-resilience planning exposures.
 *
 * This function is the genetics-to-planning boundary.
 *
 * Genotype, rsID, haplotype, model identifiers,
 * absolute-risk values and other model-specific
 * biological details deliberately do not cross this
 * boundary.
 *
 * Development is the default only so scientific and
 * engineering validation can exercise models that have
 * not yet completed production-release governance.
 *
 * User-facing production callers must explicitly pass
 * "production".
 */
export function biologicalInsightToPlanningExposures(
	insight: BiologicalInsight,
	context: PlanningGovernanceContext = "development",
): PlanningExposure[] {
	const eligibility = assessPlanningEligibility(insight, context);

	/**
	 * Planning eligibility is fail-closed.
	 *
	 * An insight may remain scientifically displayable
	 * even when it is not permitted to create a
	 * genotype-attributed financial planning exposure.
	 */
	if (!eligibility.eligible) {
		return [];
	}

	switch (insight.id) {
		case "factor-v-leiden-vte":
			return factorVLeidenPlanningExposures(insight, eligibility.qualifications);

		case "apoe-alzheimer-susceptibility":
			return apoePlanningExposures(insight, eligibility.qualifications);

		case "lpa-cardiovascular-susceptibility":
			return lpaPlanningExposures(insight, eligibility.qualifications);

		case "amd-common-susceptibility":
			return amdPlanningExposures(insight, eligibility.qualifications);

		case "tcf7l2-type-2-diabetes-susceptibility":
			return tcf7l2DiabetesPlanningExposures(insight, eligibility.qualifications);

		case "lrrk2-g2019s-parkinson-susceptibility":
			return lrrk2ParkinsonPlanningExposures(insight, eligibility.qualifications);

		case "ttr-v142i-amyloidosis-susceptibility":
			return ttrPlanningExposures(insight, eligibility.qualifications);

		case "apob-r3527q-familial-hypercholesterolemia":
			return apobPlanningExposures(insight, eligibility.qualifications);

		case "f2-g20210a-thrombophilia":
			return f2PlanningExposures(insight, eligibility.qualifications);

		case "mutyh-selected-variants-polyposis":
			return mutyhPlanningExposures(insight, eligibility.qualifications);

		case "brca-selected-pathogenic-variants":
			return brcaPlanningExposures(insight, eligibility.qualifications);

		default:
			return [];
	}
}

function factorVLeidenPlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	if (!isHigher(insight)) {
		return [];
	}

	return [
		createBiologicalExposure(
			insight,
			{
				id: "healthy-working-life-resilience",

				domain: "healthy_working_life",

				significance: "moderate",

				rationale:
					"A health event associated with this biological risk signal could interrupt employment or reduce healthy working capacity. The exposure supports resilience stress-testing and does not predict that an event will occur.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "health-cost-resilience",

				domain: "health_costs",

				significance: "moderate",

				rationale:
					"A health event associated with this biological risk signal could create healthcare, recovery or household costs. The exposure supports scenario planning rather than estimating personal medical expenditure.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "premature-mortality-resilience",

				domain: "premature_mortality",

				significance: "moderate",

				rationale:
					"A severe health event could have mortality consequences. This exposure supports household resilience stress-testing and is not a mortality forecast.",
			},
			qualifications,
		),
	];
}

function lpaPlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	if (!isHigher(insight)) {
		return [];
	}

	return [
		createBiologicalExposure(
			insight,
			{
				id: "health-cost-resilience",
				domain: "health_costs",
				significance: "moderate",
				rationale:
					"A cardiovascular health event associated with this biological risk signal could create healthcare, recovery or household costs. This exposure supports financial resilience stress-testing and does not predict that a cardiovascular event will occur.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "healthy-working-life-resilience",
				domain: "healthy_working_life",
				significance: "moderate",
				rationale:
					"A cardiovascular health event occurring before planned retirement could interrupt employment or reduce healthy working capacity. This exposure supports resilience stress-testing rather than predicting that such an event will occur.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "premature-mortality-resilience",
				domain: "premature_mortality",
				significance: "moderate",
				rationale:
					"A severe cardiovascular event could have mortality consequences. This exposure supports household resilience stress-testing and is not a mortality forecast.",
			},
			qualifications,
		),
	];
}

function apoePlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	/**
	 * Reference and indeterminate results do not create
	 * genotype-attributed planning exposures.
	 *
	 * Baseline cognitive-decline and care-dependency
	 * resilience remain relevant independently of the
	 * genetic result.
	 */
	if (!isHigher(insight)) {
		return [];
	}

	return [
		createBiologicalExposure(
			insight,
			{
				id: "care-dependency-resilience",

				domain: "care_dependency",

				significance: "high",

				rationale:
					"A later-life care-dependency event could materially increase household care requirements and financial needs. This exposure supports resilience stress-testing and does not predict that cognitive impairment will occur.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "healthy-working-life-resilience",

				domain: "healthy_working_life",

				significance: "moderate",

				rationale:
					"A health event occurring before planned retirement could shorten healthy working life. This exposure supports resilience stress-testing rather than predicting such an event.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "estate-resilience",

				domain: "estate",

				significance: "moderate",

				rationale:
					"A future incapacity scenario can make estate, decision-making and financial-authority resilience relevant. The exposure does not predict that incapacity will occur.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "partner-dependency-resilience",

				domain: "partner_dependency",

				significance: "moderate",

				rationale:
					"A long-term care or incapacity scenario could create additional care and financial responsibilities for a partner or household. The exposure represents scenario relevance rather than an expected outcome.",
			},
			qualifications,
		),
	];
}

function amdPlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	if (!isHigher(insight)) {
		return [];
	}

	return [
		createBiologicalExposure(
			insight,
			{
				id: "health-cost-resilience",
				domain: "health_costs",
				significance: "moderate",
				rationale:
					"A later-life vision condition associated with this biological risk signal could create treatment, monitoring, transport or household-support costs. This exposure supports resilience stress-testing and does not predict that vision impairment will occur.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "care-dependency-resilience",
				domain: "care_dependency",
				significance: "high",
				rationale:
					"Material vision impairment later in life could reduce independence and increase reliance on a partner, family member or paid support. This exposure supports care-resilience stress-testing rather than predicting future dependency.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "partner-dependency-resilience",
				domain: "partner_dependency",
				significance: "moderate",
				rationale:
					"Reduced vision or loss of independence could create additional practical and financial responsibilities for a partner or household. This exposure represents scenario relevance rather than an expected outcome.",
			},
			qualifications,
		),
	];
}

function tcf7l2DiabetesPlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	if (!isHigher(insight)) {
		return [];
	}

	return [
		createBiologicalExposure(
			insight,
			{
				id: "health-cost-resilience",

				domain: "health_costs",

				significance: "moderate",

				rationale:
					"A chronic metabolic condition associated with this biological susceptibility signal could create recurring healthcare, monitoring or medication costs. This exposure supports resilience stress-testing and does not predict that diabetes will occur.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "healthy-working-life-resilience",

				domain: "healthy_working_life",

				significance: "moderate",

				rationale:
					"Diabetes or its complications could affect healthy working capacity or create periods away from work. This exposure supports resilience testing rather than predicting future work impairment.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "care-dependency-resilience",

				domain: "care_dependency",

				significance: "moderate",

				rationale:
					"Long-term complications from a chronic metabolic condition can, in some circumstances, affect independence or create additional support needs later in life. This exposure supports scenario planning and does not predict future dependency.",
			},
			qualifications,
		),
	];
}

function lrrk2ParkinsonPlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	if (!isHigher(insight)) {
		return [];
	}

	if (insight.input.confirmationStatus !== "confirmed") {
		return [];
	}

	return [
		createBiologicalExposure(
			insight,
			{
				id: "health-cost-resilience",

				domain: "health_costs",

				significance: "high",

				rationale:
					"A confirmed neurological health finding could justify exploring resilience to future healthcare, treatment or support costs. This exposure supports scenario planning and does not predict that Parkinson disease will develop.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "healthy-working-life-resilience",

				domain: "healthy_working_life",

				significance: "high",

				rationale:
					"A future neurological condition could affect healthy working capacity or retirement timing. This exposure supports resilience testing without predicting future disease or incapacity.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "care-dependency-resilience",

				domain: "care_dependency",

				significance: "high",

				rationale:
					"A progressive neurological condition could increase future assistance or care requirements. This exposure supports later-life care resilience testing and is not a prediction of dependency.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "partner-dependency-resilience",

				domain: "partner_dependency",

				significance: "high",

				rationale:
					"A neurological condition affecting independence could increase practical, emotional and financial reliance on a partner or household. This exposure represents scenario relevance rather than an expected outcome.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "estate-readiness-resilience",

				domain: "estate",

				significance: "moderate",

				rationale:
					"A serious future neurological condition can make early attention to estate, decision-making and capacity arrangements relevant. This exposure supports preparedness rather than predicting loss of capacity.",
			},
			qualifications,
		),
	];
}

function ttrPlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	return confirmedClinicalPlanningExposures(insight, qualifications, [
		{
			id: "health-cost-resilience",
			domain: "health_costs",
			significance: "high",
			rationale:
				"A confirmed hereditary amyloidosis finding may justify exploring resilience to future cardiac, neurological, monitoring or treatment costs. This is scenario planning and not a prediction of disease.",
		},
		{
			id: "healthy-working-life-resilience",
			domain: "healthy_working_life",
			significance: "high",
			rationale:
				"A progressive cardiac or neurological condition could affect healthy working capacity or retirement timing. This exposure supports resilience testing rather than forecasting incapacity.",
		},
		{
			id: "care-dependency-resilience",
			domain: "care_dependency",
			significance: "high",
			rationale:
				"Progressive neurological or cardiac impairment could increase future assistance or care needs. This exposure supports later-life resilience planning.",
		},
		{
			id: "partner-dependency-resilience",
			domain: "partner_dependency",
			significance: "high",
			rationale:
				"Loss of independence could increase practical and financial reliance on a partner or household.",
		},
		{
			id: "premature-mortality-resilience",
			domain: "premature_mortality",
			significance: "high",
			rationale:
				"Serious hereditary cardiac disease may have longevity implications. This exposure supports household resilience testing and is not a mortality forecast.",
		},
		{
			id: "estate-readiness-resilience",
			domain: "estate",
			significance: "moderate",
			rationale:
				"A serious progressive condition may make earlier estate, decision-making and capacity planning worth considering.",
		},
	]);
}

function apobPlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	return confirmedClinicalPlanningExposures(insight, qualifications, [
		{
			id: "health-cost-resilience",
			domain: "health_costs",
			significance: "high",
			rationale:
				"A confirmed familial-hypercholesterolaemia finding may justify exploring resilience to long-term cardiovascular monitoring, treatment and possible cardiovascular events.",
		},
		{
			id: "healthy-working-life-resilience",
			domain: "healthy_working_life",
			significance: "moderate",
			rationale:
				"Premature cardiovascular disease could affect healthy working capacity or retirement timing.",
		},
		{
			id: "income-interruption-resilience",
			domain: "income_interruption",
			significance: "moderate",
			rationale:
				"A cardiovascular event or treatment period could temporarily interrupt employment or household income.",
		},
		{
			id: "premature-mortality-resilience",
			domain: "premature_mortality",
			significance: "high",
			rationale:
				"Premature cardiovascular disease may have longevity implications. This exposure is for resilience testing and does not estimate personal mortality.",
		},
		{
			id: "insurance-resilience",
			domain: "insurance",
			significance: "moderate",
			rationale:
				"A confirmed hereditary cardiovascular condition can make existing household risk protection worth reviewing.",
		},
	]);
}

function f2PlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	return confirmedClinicalPlanningExposures(insight, qualifications, [
		{
			id: "health-cost-resilience",
			domain: "health_costs",
			significance: "moderate",
			rationale:
				"A serious thrombotic event could create hospital, treatment and recovery costs. This exposure supports resilience testing and does not predict thrombosis.",
		},
		{
			id: "healthy-working-life-resilience",
			domain: "healthy_working_life",
			significance: "moderate",
			rationale:
				"A thrombotic event or recovery period could temporarily affect healthy working capacity.",
		},
		{
			id: "income-interruption-resilience",
			domain: "income_interruption",
			significance: "moderate",
			rationale:
				"Hospitalisation and recovery from a thrombotic event could temporarily interrupt employment or household income.",
		},
	]);
}

function mutyhPlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	if (!isHigher(insight)) {
		return [];
	}

	if (insight.result.genotype !== "biallelic_selected_variants") {
		return [];
	}

	if (insight.input.confirmationStatus !== "confirmed") {
		return [];
	}

	return [
		createBiologicalExposure(
			insight,
			{
				id: "health-cost-resilience",

				domain: "health_costs",

				significance: "high",

				rationale:
					"A confirmed MUTYH-associated polyposis finding may justify exploring resilience to ongoing surveillance, procedures and possible cancer-treatment costs. This exposure supports scenario planning and does not predict cancer occurrence.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "healthy-working-life-resilience",

				domain: "healthy_working_life",

				significance: "moderate",

				rationale:
					"Surveillance, procedures or cancer treatment could affect healthy working capacity or retirement timing.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "income-interruption-resilience",

				domain: "income_interruption",

				significance: "moderate",

				rationale:
					"Periods of investigation, procedures or treatment could interrupt employment or household income.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "care-dependency-resilience",

				domain: "care_dependency",

				significance: "moderate",

				rationale:
					"A serious colorectal disease or treatment course could temporarily or later in life increase assistance or care needs.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "estate-readiness-resilience",

				domain: "estate",

				significance: "moderate",

				rationale:
					"A confirmed hereditary cancer-predisposition condition may make earlier attention to estate, decision-making and family arrangements worth considering.",
			},
			qualifications,
		),
	];
}

function brcaPlanningExposures(
	insight: BiologicalInsight,
	qualifications: string[],
): PlanningExposure[] {
	if (!isHigher(insight)) {
		return [];
	}

	if (insight.input.confirmationStatus !== "confirmed") {
		return [];
	}

	return [
		createBiologicalExposure(
			insight,
			{
				id: "health-cost-resilience",

				domain: "health_costs",

				significance: "high",

				rationale:
					"A confirmed hereditary cancer-predisposition finding may justify exploring resilience to surveillance, investigation and possible treatment costs. This exposure does not predict that cancer will develop.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "healthy-working-life-resilience",

				domain: "healthy_working_life",

				significance: "high",

				rationale:
					"Investigation or cancer treatment could affect healthy working capacity or retirement timing.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "income-interruption-resilience",

				domain: "income_interruption",

				significance: "high",

				rationale:
					"Investigation, surgery or cancer treatment could create periods away from employment and temporary household income interruption.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "care-dependency-resilience",

				domain: "care_dependency",

				significance: "moderate",

				rationale:
					"A serious treatment course could temporarily or later in life increase assistance or care requirements.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "premature-mortality-resilience",

				domain: "premature_mortality",

				significance: "high",

				rationale:
					"Hereditary cancer predisposition can have potential longevity implications. This exposure supports household resilience testing and does not estimate personal mortality.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "insurance-resilience",

				domain: "insurance",

				significance: "moderate",

				rationale:
					"A confirmed hereditary cancer-predisposition finding can make existing household risk-protection arrangements relevant to review.",
			},
			qualifications,
		),

		createBiologicalExposure(
			insight,
			{
				id: "estate-readiness-resilience",

				domain: "estate",

				significance: "moderate",

				rationale:
					"A serious hereditary health finding can make earlier estate, decision-making and family arrangements worth considering.",
			},
			qualifications,
		),
	];
}

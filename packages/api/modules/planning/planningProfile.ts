import type { HouseholdFinancialState } from "../financial/household/types";
import type { GeneticHighlight } from "./geneticHighlight";
import type { PlanningInsight } from "./planningInsight";
import type { PlanningExposure, PlanningExposureDomain, PlanningSignificance } from "./types";

export const PLANNING_PROFILE_VERSION = "1.0.0";

export interface PlanningProfileQuestion {
	id: string;
	domain: PlanningExposureDomain;

	title: string;
	question: string;

	significance: PlanningSignificance;

	/**
	 * Why this question is being surfaced.
	 *
	 * This is deliberately framed as scenario-planning context,
	 * not as a prediction, recommendation or diagnosis.
	 */
	rationale: string;

	sourceInsightIds: string[];
}

export interface PlanningProfileHouseholdContext {
	currency: string;
	country?: string;

	annualIncome: number;
	annualEssentialExpenses: number;
	annualDiscretionaryExpenses: number;

	liquidAssets: number;
	totalAssets: number;
	totalLiabilities: number;

	insuranceCoverCount: number;

	estate: {
		hasWill: boolean | null;
		hasEnduringPowerOfAttorney: boolean | null;
		hasSuperBeneficiaryNomination: boolean | null;
	};
}

export interface BioanalytixPlanningProfileV1 {
	version: typeof PLANNING_PROFILE_VERSION;

	generatedAt: string;

	geneticSource: {
		uploadId: string;
		modelIds: string[];
	};

	householdContext: PlanningProfileHouseholdContext;

	exposures: PlanningExposure[];

	geneticHighlights: GeneticHighlight[];

	planningInsights: PlanningInsight[];

	geneticPlanningCoverage: GeneticPlanningCoverage;

	questions: PlanningProfileQuestion[];

	guardrails: {
		geneticsChangesFinancialParameters: false;
		geneticsChangesLongevityAssumptions: false;
		consumerGeneticsIsDiagnostic: false;
		absoluteDiseaseRiskCalculated: false;
	};
}

export interface GeneticPlanningCoverage {
	modelsEvaluated: number;

	elevatedFindings: number;

	planningExposureCount: number;

	planningInsightCount: number;
}

function questionForExposure(exposure: PlanningExposure, index: number): PlanningProfileQuestion {
	const base = {
		id: `${exposure.domain}-${index + 1}`,
		domain: exposure.domain,
		significance: exposure.significance,
		rationale: exposure.rationale,
		sourceInsightIds: exposure.sourceInsightIds ?? [],
	};

	switch (exposure.domain) {
		case "healthy_working_life":
			return {
				...base,
				title: "Work interruption",
				question:
					"What would happen to your household plan if your healthy working life were interrupted for a period?",
			};

		case "health_costs":
			return {
				...base,
				title: "Unexpected health costs",
				question:
					"How resilient would your finances be to a period of higher health, treatment or recovery costs?",
			};

		case "care_dependency":
			return {
				...base,
				title: "Future care needs",
				question:
					"What would change if you or your partner required additional paid care or support later in life?",
			};

		case "premature_mortality":
			return {
				...base,
				title: "Earlier death scenario",
				question:
					"Would your household, insurance and estate arrangements remain resilient if death occurred earlier than currently assumed?",
			};

		case "longevity":
			return {
				...base,
				title: "Longer life scenario",
				question:
					"What would happen to your plan if retirement and later-life costs needed to be funded for substantially longer?",
			};

		case "income_interruption":
			return {
				...base,
				title: "Income interruption",
				question:
					"How long could your household maintain essential spending if employment or other income were interrupted?",
			};

		case "estate":
			return {
				...base,
				title: "Estate readiness",
				question:
					"Are your estate documents, beneficiary arrangements and asset structures ready for an unexpected change in timing or capacity?",
			};

		case "partner_dependency":
			return {
				...base,
				title: "Partner resilience",
				question:
					"How would your partner or dependants be affected financially if your income, health or availability changed?",
			};

		case "insurance":
			return {
				...base,
				title: "Insurance resilience",
				question:
					"Would your current insurance arrangements remain resilient if your household faced illness, disability, care needs or an earlier death?",
			};

		case "family":
			return {
				...base,
				title: "Family resilience",
				question:
					"Would your household and family arrangements remain resilient if health, care, income or dependency needs changed?",
			};
	}
}

function householdContext(household: HouseholdFinancialState): PlanningProfileHouseholdContext {
	const annualIncome = household.income.reduce((total, source) => total + source.annualAmount, 0);

	const liquidAssets = household.assets
		.filter((asset) => asset.liquid)
		.reduce((total, asset) => total + asset.value, 0);

	const totalAssets =
		household.assets.reduce((total, asset) => total + asset.value, 0) +
		household.superannuation.reduce((total, account) => total + account.balance, 0);

	const totalLiabilities = household.liabilities.reduce(
		(total, liability) => total + liability.balance,
		0,
	);

	return {
		currency: household.currency,
		country: household.country,

		annualIncome,

		annualEssentialExpenses: household.expenses.essentialAnnual,

		annualDiscretionaryExpenses: household.expenses.discretionaryAnnual,

		liquidAssets,
		totalAssets,
		totalLiabilities,

		insuranceCoverCount: household.insurance.length,

		estate: {
			hasWill: household.estate.hasWill ?? null,
			hasEnduringPowerOfAttorney: household.estate.hasEnduringPowerOfAttorney ?? null,
			hasSuperBeneficiaryNomination: household.estate.hasSuperBeneficiaryNomination ?? null,
		},
	};
}

export function buildPlanningProfileV1({
	household,
	geneticUploadId,
	modelIds,
	exposures,
	geneticHighlights = [],
	planningInsights = [],
	now = new Date(),
}: {
	household: HouseholdFinancialState;
	geneticUploadId: string;
	modelIds: string[];
	exposures: PlanningExposure[];
	geneticHighlights?: GeneticHighlight[];
	planningInsights?: PlanningInsight[];
	now?: Date;
}): BioanalytixPlanningProfileV1 {
	return {
		version: PLANNING_PROFILE_VERSION,

		generatedAt: now.toISOString(),

		geneticSource: {
			uploadId: geneticUploadId,
			modelIds: [...new Set(modelIds)],
		},

		householdContext: householdContext(household),

		exposures,

		geneticHighlights,

		planningInsights,

		geneticPlanningCoverage: {
			modelsEvaluated: new Set(modelIds).size,

			elevatedFindings: geneticHighlights.filter(
				(highlight) => highlight.direction === "higher",
			).length,

			planningExposureCount: exposures.length,

			planningInsightCount: planningInsights.length,
		},

		questions: exposures.map(questionForExposure),

		guardrails: {
			geneticsChangesFinancialParameters: false,
			geneticsChangesLongevityAssumptions: false,
			consumerGeneticsIsDiagnostic: false,
			absoluteDiseaseRiskCalculated: false,
		},
	};
}

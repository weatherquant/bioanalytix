import { describe, expect, it } from "vitest";

import type { BioanalytixPlanningProfileV1 } from "../../planning/planningProfile";
import { buildBioanalytixAgentContext } from "./agentContext";

export function buildProfile(): BioanalytixPlanningProfileV1 {
	return {
		version: "1.0.0",
		generatedAt: "2026-09-16T00:00:00.000Z",

		geneticSource: {
			uploadId: "upload-1",
			modelIds: ["model-1"],
		},

		householdContext: {
			currency: "AUD",
			country: "AU",

			annualIncome: 180_000,
			annualEssentialExpenses: 70_000,
			annualDiscretionaryExpenses: 30_000,

			liquidAssets: 100_000,
			totalAssets: 1_500_000,
			totalLiabilities: 300_000,

			insuranceCoverCount: 2,

			protection: {
				assessment: "comfortable",
				annualIncomeAtRisk: 120_000,
				lifeInsuranceCover: 500_000,
				incomeProtectionAnnualBenefit: 80_000,
				totalHouseholdLiabilities: 300_000,
				liquidAssets: 100_000,
				financialAssets: 600_000,
				hasFinancialDependants: true,
				reasons: ["Recorded resources provide meaningful protection."],
			},

			estate: {
				hasWill: true,
				hasEnduringPowerOfAttorney: false,
				hasSuperBeneficiaryNomination: null,
			},

			estatePosition: {
				assessment: "worth_reviewing",
				economicAssessment: "comfortable",
				documentationAssessment: "worth_reviewing",
				netHouseholdResources: 1_200_000,
				totalAssets: 1_500_000,
				totalLiabilities: 300_000,
				inheritanceGoal: 1_000_000,
				currentSurplusOrShortfallToGoal: 200_000,
				documentation: {
					hasWill: true,
					hasEnduringPowerOfAttorney: false,
					hasSuperBeneficiaryNomination: null,
					completed: 1,
					unknown: 1,
				},
				reasons: ["Some estate arrangements may be worth reviewing."],
				qualifications: [
					"Household resources are not the same as the legal probate estate.",
				],
			},
		},

		exposures: [
			{
				id: "exposure-1",
				domain: "healthy_working_life",
				significance: "high",
				basis: "biological_insight",
				rationale: "Credible genetic evidence makes work interruption worth exploring.",
				qualifications: [
					"This planning exposure does not predict that a biological event will occur.",
				],
				sourceInsightIds: ["insight-1"],
				constraints: {
					diagnosticInferencePermitted: false,
					absoluteRiskConversionPermitted: false,
					directLongevityAdjustmentPermitted: false,
					deterministicFinancialAdjustmentPermitted: false,
				},
			},
		],

		geneticHighlights: [],
		planningInsights: [],

		geneticPlanningCoverage: {
			modelsEvaluated: 1,
			elevatedFindings: 1,
			planningExposureCount: 1,
			planningInsightCount: 1,
		},

		questions: [
			{
				id: "healthy_working_life-1",
				domain: "healthy_working_life",
				significance: "high",
				title: "Work interruption",
				question:
					"What would happen to your household plan if your healthy working life were interrupted for a period?",
				rationale: "Credible genetic evidence makes work interruption worth exploring.",
				sourceInsightIds: ["insight-1"],
			},
		],

		guardrails: {
			geneticsChangesFinancialParameters: false,
			geneticsChangesLongevityAssumptions: false,
			consumerGeneticsIsDiagnostic: false,
			absoluteDiseaseRiskCalculated: false,
		},
	};
}

describe("buildBioanalytixAgentContext", () => {
	it("provides bounded household and planning context", () => {
		const context = buildBioanalytixAgentContext(buildProfile());

		expect(context.household).toEqual({
			currency: "AUD",
			country: "AU",
			annualIncome: 180_000,
			annualEssentialExpenses: 70_000,
			annualDiscretionaryExpenses: 30_000,
			liquidAssets: 100_000,
			totalAssets: 1_500_000,
			totalLiabilities: 300_000,
			insuranceCoverCount: 2,
		});

		expect(context.plan.protection.assessment).toBe("comfortable");
		expect(context.plan.protection.lifeInsuranceCover).toBe(500_000);

		expect(context.plan.estate.assessment).toBe("worth_reviewing");
		expect(context.plan.estate.inheritanceGoal).toBe(1_000_000);

		expect(context.plan.estateDocuments).toEqual({
			hasWill: true,
			hasEnduringPowerOfAttorney: false,
			hasSuperBeneficiaryNomination: null,
		});
	});

	it("passes planning relevance rather than raw genetic interpretation", () => {
		const context = buildBioanalytixAgentContext(buildProfile());

		expect(context.genetics.planningRelevantFindings).toEqual([
			{
				domain: "healthy_working_life",
				title: "healthy working life",
				rationale: "Credible genetic evidence makes work interruption worth exploring.",
			},
		]);

		expect(context.genetics.planningQuestions).toEqual([
			{
				domain: "healthy_working_life",
				title: "Work interruption",
				question:
					"What would happen to your household plan if your healthy working life were interrupted for a period?",
				rationale: "Credible genetic evidence makes work interruption worth exploring.",
			},
		]);
	});

	it("preserves the genetics-to-finance guardrails", () => {
		const context = buildBioanalytixAgentContext(buildProfile());

		expect(context.guardrails).toEqual({
			geneticsChangesFinancialParameters: false,
			geneticsChangesLongevityAssumptions: false,
			consumerGeneticsIsDiagnostic: false,
			absoluteDiseaseRiskCalculated: false,
		});
	});
});

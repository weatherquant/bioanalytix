import { describe, expect, it } from "vitest";

import type { BioanalytixPlanningProfileV1 } from "../../planning/planningProfile";
import { toHouseholdFinancialState } from "../onboarding/toHouseholdFinancialState";
import { buildBioanalytixAgentContext } from "./agentContext";

function buildHousehold() {
	return toHouseholdFinancialState({
		householdId: "agent-context-test",
		input: {
			dateOfBirth: "1975-04-12",
			country: "AU",
			currency: "AUD",
			employmentStatus: "employed",
			hasPartner: false,
			hasDependants: false,
			annualHouseholdIncome: 160_000,
			cashAndSavings: 50_000,
			investments: 120_000,
			propertyAndOtherAssets: 800_000,
			retirementSavings: 350_000,
			totalDebt: 300_000,
			annualHouseholdSpending: 85_000,
			lifeInsuranceCover: 500_000,
			incomeProtectionAnnualBenefit: 80_000,
			desiredInheritance: 600_000,
			expectedRetirementAge: 60,
		},
	});
}

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
		const context = buildBioanalytixAgentContext({
			household: buildHousehold(),
			profile: buildProfile(),
		});

		expect(context.household).toEqual({
			currency: "AUD",
			country: "AU",
			annualIncome: 160_000,
			annualEssentialExpenses: 85_000,
			annualDiscretionaryExpenses: 0,
			liquidAssets: 170_000,
			totalAssets: 1_320_000,
			totalLiabilities: 300_000,
			insuranceCoverCount: 2,
		});

		expect(context.plan.protection.assessment).toBe("comfortable");
		expect(context.plan.protection.lifeInsuranceCover).toBe(500_000);

		expect(context.plan.estate.assessment).toBe("worth_reviewing");
		expect(context.plan.estate.inheritanceGoal).toBe(600_000);

		expect(context.plan.estateDocuments).toEqual({
			hasWill: null,
			hasEnduringPowerOfAttorney: null,
			hasSuperBeneficiaryNomination: null,
		});
	});

	it("passes planning relevance rather than raw genetic interpretation", () => {
		const context = buildBioanalytixAgentContext({
			household: buildHousehold(),
			profile: buildProfile(),
		});

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
		const context = buildBioanalytixAgentContext({
			household: buildHousehold(),
			profile: buildProfile(),
		});

		expect(context.guardrails).toEqual({
			geneticsChangesFinancialParameters: false,
			geneticsChangesLongevityAssumptions: false,
			consumerGeneticsIsDiagnostic: false,
			absoluteDiseaseRiskCalculated: false,
		});
	});

	it("supports financial planning without a genetic profile", () => {
		const context = buildBioanalytixAgentContext({
			household: buildHousehold(),
			profile: null,
		});

		expect(context.household.currency).toBe("AUD");

		expect(context.genetics).toEqual({
			planningRelevantFindings: [],
			planningQuestions: [],
		});

		expect(context.guardrails).toEqual({
			geneticsChangesFinancialParameters: false,
			geneticsChangesLongevityAssumptions: false,
			consumerGeneticsIsDiagnostic: false,
			absoluteDiseaseRiskCalculated: false,
		});
	});
});

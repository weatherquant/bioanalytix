import type { HouseholdFinancialState } from "../../financial/household/types";
import {
	buildPlanningProfileHouseholdContext,
	type BioanalytixPlanningProfileV1,
} from "../../planning/planningProfile";

export interface BioanalytixAgentContext {
	version: "1.0.0";

	household: {
		currency: string;
		country?: string;
		annualIncome: number;
		annualEssentialExpenses: number;
		annualDiscretionaryExpenses: number;
		liquidAssets: number;
		totalAssets: number;
		totalLiabilities: number;
		insuranceCoverCount: number;
	};

	plan: {
		protection: {
			assessment: "strong" | "comfortable" | "worth_reviewing" | "exposed";
			annualIncomeAtRisk: number;
			lifeInsuranceCover: number;
			incomeProtectionAnnualBenefit: number;
			totalHouseholdLiabilities: number;
			liquidAssets: number;
			financialAssets: number;
			hasFinancialDependants: boolean;
			reasons: string[];
		};

		estate: {
			assessment: "strong" | "comfortable" | "worth_reviewing" | "exposed";
			economicAssessment: "strong" | "comfortable" | "worth_reviewing" | "exposed";
			documentationAssessment: "strong" | "comfortable" | "worth_reviewing" | "exposed";
			netHouseholdResources: number;
			totalAssets: number;
			totalLiabilities: number;
			inheritanceGoal: number | null;
			currentSurplusOrShortfallToGoal: number | null;
			reasons: string[];
			qualifications: string[];
		};

		estateDocuments: {
			hasWill: boolean | null;
			hasEnduringPowerOfAttorney: boolean | null;
			hasSuperBeneficiaryNomination: boolean | null;
		};
	};

	genetics: {
		planningRelevantFindings: Array<{
			domain: string;
			title: string;
			rationale: string;
		}>;

		planningQuestions: Array<{
			domain: string;
			title: string;
			question: string;
			rationale: string;
		}>;
	};

	guardrails: {
		geneticsChangesFinancialParameters: false;
		geneticsChangesLongevityAssumptions: false;
		consumerGeneticsIsDiagnostic: false;
		absoluteDiseaseRiskCalculated: false;
	};
}

export function buildBioanalytixAgentContext({
	household,
	profile,
}: {
	household: HouseholdFinancialState;
	profile?: BioanalytixPlanningProfileV1 | null;
}): BioanalytixAgentContext {
	const householdContext = buildPlanningProfileHouseholdContext(household);

	return {
		version: "1.0.0",

		household: {
			currency: householdContext.currency,
			country: householdContext.country,
			annualIncome: householdContext.annualIncome,
			annualEssentialExpenses: householdContext.annualEssentialExpenses,
			annualDiscretionaryExpenses: householdContext.annualDiscretionaryExpenses,
			liquidAssets: householdContext.liquidAssets,
			totalAssets: householdContext.totalAssets,
			totalLiabilities: householdContext.totalLiabilities,
			insuranceCoverCount: householdContext.insuranceCoverCount,
		},

		plan: {
			protection: {
				assessment: householdContext.protection.assessment,
				annualIncomeAtRisk: householdContext.protection.annualIncomeAtRisk,
				lifeInsuranceCover: householdContext.protection.lifeInsuranceCover,
				incomeProtectionAnnualBenefit:
					householdContext.protection.incomeProtectionAnnualBenefit,
				totalHouseholdLiabilities: householdContext.protection.totalHouseholdLiabilities,
				liquidAssets: householdContext.protection.liquidAssets,
				financialAssets: householdContext.protection.financialAssets,
				hasFinancialDependants: householdContext.protection.hasFinancialDependants,
				reasons: [...householdContext.protection.reasons],
			},

			estate: {
				assessment: householdContext.estatePosition.assessment,
				economicAssessment: householdContext.estatePosition.economicAssessment,
				documentationAssessment: householdContext.estatePosition.documentationAssessment,
				netHouseholdResources: householdContext.estatePosition.netHouseholdResources,
				totalAssets: householdContext.estatePosition.totalAssets,
				totalLiabilities: householdContext.estatePosition.totalLiabilities,
				inheritanceGoal: householdContext.estatePosition.inheritanceGoal,
				currentSurplusOrShortfallToGoal:
					householdContext.estatePosition.currentSurplusOrShortfallToGoal,
				reasons: [...householdContext.estatePosition.reasons],
				qualifications: [...householdContext.estatePosition.qualifications],
			},

			estateDocuments: {
				hasWill: householdContext.estate.hasWill,
				hasEnduringPowerOfAttorney: householdContext.estate.hasEnduringPowerOfAttorney,
				hasSuperBeneficiaryNomination:
					householdContext.estate.hasSuperBeneficiaryNomination,
			},
		},

		genetics: {
			planningRelevantFindings:
				profile?.exposures.map((exposure) => ({
					domain: exposure.domain,
					title: exposure.domain.replaceAll("_", " "),
					rationale: exposure.rationale,
				})) ?? [],

			planningQuestions:
				profile?.questions.map((question) => ({
					domain: question.domain,
					title: question.title,
					question: question.question,
					rationale: question.rationale,
				})) ?? [],
		},

		guardrails: {
			geneticsChangesFinancialParameters: false,
			geneticsChangesLongevityAssumptions: false,
			consumerGeneticsIsDiagnostic: false,
			absoluteDiseaseRiskCalculated: false,
		},
	};
}

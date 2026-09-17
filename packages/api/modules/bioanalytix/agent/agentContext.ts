import type { BioanalytixPlanningProfileV1 } from "../../planning/planningProfile";

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

export function buildBioanalytixAgentContext(
	profile: BioanalytixPlanningProfileV1,
): BioanalytixAgentContext {
	const household = profile.householdContext;

	return {
		version: "1.0.0",

		household: {
			currency: household.currency,
			country: household.country,
			annualIncome: household.annualIncome,
			annualEssentialExpenses: household.annualEssentialExpenses,
			annualDiscretionaryExpenses: household.annualDiscretionaryExpenses,
			liquidAssets: household.liquidAssets,
			totalAssets: household.totalAssets,
			totalLiabilities: household.totalLiabilities,
			insuranceCoverCount: household.insuranceCoverCount,
		},

		plan: {
			protection: {
				assessment: household.protection.assessment,
				annualIncomeAtRisk: household.protection.annualIncomeAtRisk,
				lifeInsuranceCover: household.protection.lifeInsuranceCover,
				incomeProtectionAnnualBenefit: household.protection.incomeProtectionAnnualBenefit,
				totalHouseholdLiabilities: household.protection.totalHouseholdLiabilities,
				liquidAssets: household.protection.liquidAssets,
				financialAssets: household.protection.financialAssets,
				hasFinancialDependants: household.protection.hasFinancialDependants,
				reasons: [...household.protection.reasons],
			},

			estate: {
				assessment: household.estatePosition.assessment,
				economicAssessment: household.estatePosition.economicAssessment,
				documentationAssessment: household.estatePosition.documentationAssessment,
				netHouseholdResources: household.estatePosition.netHouseholdResources,
				totalAssets: household.estatePosition.totalAssets,
				totalLiabilities: household.estatePosition.totalLiabilities,
				inheritanceGoal: household.estatePosition.inheritanceGoal,
				currentSurplusOrShortfallToGoal:
					household.estatePosition.currentSurplusOrShortfallToGoal,
				reasons: [...household.estatePosition.reasons],
				qualifications: [...household.estatePosition.qualifications],
			},

			estateDocuments: {
				hasWill: household.estate.hasWill,
				hasEnduringPowerOfAttorney: household.estate.hasEnduringPowerOfAttorney,
				hasSuperBeneficiaryNomination: household.estate.hasSuperBeneficiaryNomination,
			},
		},

		genetics: {
			planningRelevantFindings: profile.exposures.map((exposure) => ({
				domain: exposure.domain,
				title: exposure.domain.replaceAll("_", " "),
				rationale: exposure.rationale,
			})),

			planningQuestions: profile.questions.map((question) => ({
				domain: question.domain,
				title: question.title,
				question: question.question,
				rationale: question.rationale,
			})),
		},

		guardrails: {
			...profile.guardrails,
		},
	};
}

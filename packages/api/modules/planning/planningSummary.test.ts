import { describe, expect, it } from "vitest";

import type { BioanalytixPlanningProfileV1 } from "./planningProfile";
import { buildPlanningSummary } from "./planningSummary";

function makeProfile(
	overrides: Partial<BioanalytixPlanningProfileV1> = {},
): BioanalytixPlanningProfileV1 {
	return {
		version: "1.0.0",
		generatedAt: new Date("2026-09-13T00:00:00Z").toISOString(),

		geneticSource: {
			uploadId: "upload-1",
			modelIds: [],
		},

		householdContext: {
			currency: "AUD",
			country: "AU",

			annualIncome: 180_000,
			annualEssentialExpenses: 72_000,
			annualDiscretionaryExpenses: 30_000,

			liquidAssets: 90_000,
			totalAssets: 1_000_000,
			totalLiabilities: 300_000,

			insuranceCoverCount: 2,

			protection: {
				assessment: "comfortable",
				annualIncomeAtRisk: 180_000,
				lifeInsuranceCover: 500_000,
				incomeProtectionAnnualBenefit: 80_000,
				totalHouseholdLiabilities: 300_000,
				liquidAssets: 90_000,
				financialAssets: 700_000,
				hasFinancialDependants: true,
				reasons: [
					"Recorded resources and protection provide useful immediate financial support.",
				],
			},

			estate: {
				hasWill: true,
				hasEnduringPowerOfAttorney: true,
				hasSuperBeneficiaryNomination: true,
			},

			estatePosition: {
				assessment: "strong",
				economicAssessment: "strong",
				documentationAssessment: "strong",
				netHouseholdResources: 1_000_000,
				totalAssets: 1_300_000,
				totalLiabilities: 300_000,
				inheritanceGoal: 600_000,
				currentSurplusOrShortfallToGoal: 400_000,
				documentation: {
					hasWill: true,
					hasEnduringPowerOfAttorney: true,
					hasSuperBeneficiaryNomination: true,
					completed: 3,
					unknown: 0,
				},
				reasons: [
					"Current net household resources are materially above your recorded inheritance objective.",
				],
				qualifications: [],
			},
		},

		exposures: [],
		geneticHighlights: [],
		planningInsights: [],

		geneticPlanningCoverage: {
			modelsEvaluated: 0,
			elevatedFindings: 0,
			planningExposureCount: 0,
			planningInsightCount: 0,
		},

		questions: [],

		guardrails: {
			geneticsChangesFinancialParameters: false,
			geneticsChangesLongevityAssumptions: false,
			consumerGeneticsIsDiagnostic: false,
			absoluteDiseaseRiskCalculated: false,
		},

		...overrides,
	};
}

describe("buildPlanningSummary", () => {
	it("produces a simple five-area planning summary", () => {
		const summary = buildPlanningSummary(makeProfile());

		expect(summary.areas).toHaveLength(5);

		expect(summary.areas.map((area) => area.area)).toEqual([
			"financial_resilience",
			"income_work",
			"protection",
			"estate_family",
			"longevity_later_life",
		]);
	});

	it("classifies strong liquidity as strong financial resilience", () => {
		const profile = makeProfile({
			householdContext: {
				...makeProfile().householdContext,
				annualEssentialExpenses: 60_000,
				liquidAssets: 60_000,
			},
		});

		const summary = buildPlanningSummary(profile);

		const resilience = summary.areas.find((area) => area.area === "financial_resilience");

		expect(resilience?.outcome).toBe("strong");
	});

	it("classifies low liquidity as exposed financial resilience", () => {
		const profile = makeProfile({
			householdContext: {
				...makeProfile().householdContext,
				annualEssentialExpenses: 60_000,
				liquidAssets: 10_000,
			},
		});

		const summary = buildPlanningSummary(profile);

		const resilience = summary.areas.find((area) => area.area === "financial_resilience");

		expect(resilience?.outcome).toBe("exposed");
	});

	it("flags estate planning for review when the estate position requires review", () => {
		const baseProfile = makeProfile();

		const profile = makeProfile({
			householdContext: {
				...baseProfile.householdContext,

				estate: {
					hasWill: true,
					hasEnduringPowerOfAttorney: null,
					hasSuperBeneficiaryNomination: false,
				},

				estatePosition: {
					...baseProfile.householdContext.estatePosition,
					assessment: "worth_reviewing",
					documentationAssessment: "worth_reviewing",
					documentation: {
						hasWill: true,
						hasEnduringPowerOfAttorney: null,
						hasSuperBeneficiaryNomination: false,
						completed: 1,
						unknown: 1,
					},
				},
			},
		});

		const summary = buildPlanningSummary(profile);

		const estate = summary.areas.find((area) => area.area === "estate_family");

		expect(estate?.outcome).toBe("worth_reviewing");
	});

	it("adds genetic context without changing financial assumptions", () => {
		const profile = makeProfile({
			exposures: [
				{
					id: "exposure-1",
					domain: "health_costs",
					significance: "moderate",
					basis: "biological_insight",
					rationale: "Health-cost resilience deserves additional attention.",
					qualifications: [],
					constraints: {
						diagnosticInferencePermitted: false,
						absoluteRiskConversionPermitted: false,
						directLongevityAdjustmentPermitted: false,
						deterministicFinancialAdjustmentPermitted: false,
					},
					sourceInsightIds: ["insight-1"],
				},
			],
		});

		const summary = buildPlanningSummary(profile);

		const resilience = summary.areas.find((area) => area.area === "financial_resilience");

		expect(resilience?.geneticsIncreasesAttention).toBe(true);
		expect(resilience?.geneticContext).toBeDefined();

		expect(profile.guardrails.geneticsChangesFinancialParameters).toBe(false);
		expect(profile.guardrails.geneticsChangesLongevityAssumptions).toBe(false);
	});

	it("keeps longevity comfortable when genetics adds no planning relevance", () => {
		const summary = buildPlanningSummary(makeProfile());

		const longevity = summary.areas.find((area) => area.area === "longevity_later_life");

		expect(longevity?.outcome).toBe("comfortable");
		expect(longevity?.geneticsIncreasesAttention).toBe(false);
	});

	it("surfaces at most three priorities", () => {
		const baseProfile = makeProfile();

		const profile = makeProfile({
			householdContext: {
				...baseProfile.householdContext,
				annualIncome: 50_000,
				annualEssentialExpenses: 70_000,
				liquidAssets: 5_000,
				insuranceCoverCount: 0,

				estate: {
					hasWill: false,
					hasEnduringPowerOfAttorney: false,
					hasSuperBeneficiaryNomination: false,
				},

				estatePosition: {
					...baseProfile.householdContext.estatePosition,
					assessment: "worth_reviewing",
					documentationAssessment: "worth_reviewing",
					documentation: {
						hasWill: false,
						hasEnduringPowerOfAttorney: false,
						hasSuperBeneficiaryNomination: false,
						completed: 0,
						unknown: 0,
					},
				},
			},
		});

		const summary = buildPlanningSummary(profile);

		expect(summary.priorities.length).toBeLessThanOrEqual(3);
		expect(summary.priorities.length).toBeGreaterThan(0);
	});

	it("treats strong and comfortable areas as covered", () => {
		const summary = buildPlanningSummary(makeProfile());

		for (const area of summary.areas) {
			if (area.outcome === "strong" || area.outcome === "comfortable") {
				expect(area.coverage).toBe("covered");
			}
		}
	});

	it("recommends review for exposed and worth-reviewing areas", () => {
		const summary = buildPlanningSummary(makeProfile());

		for (const area of summary.areas) {
			if (area.outcome === "exposed" || area.outcome === "worth_reviewing") {
				expect(area.coverage).toBe("review_recommended");
			}
		}
	});

	it("does not treat absence of insurance as a protection deficiency when the household is financially self-sufficient", () => {
		const profile = makeProfile({
			householdContext: {
				...makeProfile().householdContext,
				insuranceCoverCount: 0,
				protection: {
					assessment: "strong",
					annualIncomeAtRisk: 0,
					lifeInsuranceCover: 0,
					incomeProtectionAnnualBenefit: 0,
					totalHouseholdLiabilities: 0,
					liquidAssets: 500_000,
					financialAssets: 1_000_000,
					hasFinancialDependants: false,
					reasons: [
						"No material income, liability or dependant protection gap is recorded.",
					],
				},
			},
		});

		const summary = buildPlanningSummary(profile);

		const protection = summary.areas.find((area) => area.area === "protection");

		expect(protection?.outcome).toBe("strong");
		expect(protection?.coverage).toBe("covered");
	});

	it("does not treat insurance presence alone as adequate protection", () => {
		const profile = makeProfile({
			householdContext: {
				...makeProfile().householdContext,
				insuranceCoverCount: 1,
				protection: {
					assessment: "exposed",
					annualIncomeAtRisk: 180_000,
					lifeInsuranceCover: 50_000,
					incomeProtectionAnnualBenefit: 0,
					totalHouseholdLiabilities: 600_000,
					liquidAssets: 20_000,
					financialAssets: 100_000,
					hasFinancialDependants: true,
					reasons: [
						"Recorded resources and life cover do not close the immediate financial exposure.",
					],
				},
			},
		});

		const summary = buildPlanningSummary(profile);

		const protection = summary.areas.find((area) => area.area === "protection");

		expect(protection?.outcome).toBe("exposed");
		expect(protection?.coverage).toBe("review_recommended");
	});

	it("does not treat complete estate documents as sufficient when the economic estate position is exposed", () => {
		const baseProfile = makeProfile();

		const profile = makeProfile({
			householdContext: {
				...baseProfile.householdContext,

				estate: {
					hasWill: true,
					hasEnduringPowerOfAttorney: true,
					hasSuperBeneficiaryNomination: true,
				},

				estatePosition: {
					...baseProfile.householdContext.estatePosition,
					assessment: "exposed",
					economicAssessment: "exposed",
					documentationAssessment: "strong",
					documentation: {
						hasWill: true,
						hasEnduringPowerOfAttorney: true,
						hasSuperBeneficiaryNomination: true,
						completed: 3,
						unknown: 0,
					},
				},
			},
		});

		const summary = buildPlanningSummary(profile);

		const estate = summary.areas.find((area) => area.area === "estate_family");

		expect(estate?.outcome).toBe("exposed");
		expect(estate?.coverage).toBe("review_recommended");
	});

	it("does not treat absence of an inheritance objective as an estate deficiency", () => {
		const baseProfile = makeProfile();

		const profile = makeProfile({
			householdContext: {
				...baseProfile.householdContext,

				estatePosition: {
					...baseProfile.householdContext.estatePosition,
					assessment: "comfortable",
					economicAssessment: "comfortable",
					inheritanceGoal: null,
					currentSurplusOrShortfallToGoal: null,
				},
			},
		});

		const summary = buildPlanningSummary(profile);

		const estate = summary.areas.find((area) => area.area === "estate_family");

		expect(estate?.outcome).toBe("comfortable");
		expect(estate?.coverage).toBe("covered");
	});
});

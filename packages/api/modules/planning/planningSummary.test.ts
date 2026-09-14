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

			estate: {
				hasWill: true,
				hasEnduringPowerOfAttorney: true,
				hasSuperBeneficiaryNomination: true,
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

	it("flags estate planning for review when core arrangements are incomplete", () => {
		const profile = makeProfile({
			householdContext: {
				...makeProfile().householdContext,
				estate: {
					hasWill: true,
					hasEnduringPowerOfAttorney: null,
					hasSuperBeneficiaryNomination: false,
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
		const profile = makeProfile({
			householdContext: {
				...makeProfile().householdContext,
				annualIncome: 50_000,
				annualEssentialExpenses: 70_000,
				liquidAssets: 5_000,
				insuranceCoverCount: 0,
				estate: {
					hasWill: false,
					hasEnduringPowerOfAttorney: false,
					hasSuperBeneficiaryNomination: false,
				},
			},
		});

		const summary = buildPlanningSummary(profile);

		expect(summary.priorities.length).toBeLessThanOrEqual(3);
		expect(summary.priorities.length).toBeGreaterThan(0);
	});
});

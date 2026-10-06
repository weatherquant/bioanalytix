import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "../financial/household/types";
import { buildPlanningProfileV1, PLANNING_PROFILE_VERSION } from "./planningProfile";
import type { PlanningExposure } from "./types";

function household(): HouseholdFinancialState {
	return {
		id: "household-1",
		asOfDate: "2026-09-06",
		currency: "AUD",
		country: "Australia",

		people: [
			{
				id: "person-1",
				role: "primary",
				dateOfBirth: "1970-01-01",
				employmentStatus: "employed",
			},
		],

		income: [
			{
				id: "income-1",
				personId: "person-1",
				type: "employment",
				annualAmount: 150000,
				taxable: true,
			},
		],

		expenses: {
			essentialAnnual: 60000,
			discretionaryAnnual: 30000,
		},

		assets: [
			{
				id: "cash",
				type: "cash",
				value: 50000,
				liquid: true,
				investable: true,
				incomeProducing: false,
			},
		],

		superannuation: [
			{
				id: "super-1",
				personId: "person-1",
				balance: 400000,
				preserved: true,
			},
		],

		liabilities: [],

		insurance: [],

		estate: {
			hasWill: true,
			hasEnduringPowerOfAttorney: false,
		},

		goals: [],
	};
}

describe("buildPlanningProfileV1", () => {
	it("builds a versioned planning profile from household and genetic exposures", () => {
		const exposure: PlanningExposure = {
			id: "health-cost-resilience",
			domain: "health_costs",
			significance: "moderate",
			basis: "biological_insight",
			rationale:
				"A qualified biological signal may justify testing financial resilience to higher health costs.",
			sourceInsightIds: ["factor-v-leiden-vte"],
			qualifications: [],
			constraints: {
				diagnosticInferencePermitted: false,
				absoluteRiskConversionPermitted: false,
				directLongevityAdjustmentPermitted: false,
				deterministicFinancialAdjustmentPermitted: false,
			},
		};

		const profile = buildPlanningProfileV1({
			household: household(),
			geneticUploadId: "upload-1",
			modelIds: ["f5-factor-v-leiden-vte"],
			exposures: [exposure],
			now: new Date("2026-09-06T00:00:00.000Z"),
		});

		expect(profile.version).toBe(PLANNING_PROFILE_VERSION);

		expect(profile.geneticSource.uploadId).toBe("upload-1");

		expect(profile.questions).toHaveLength(1);

		expect(profile.questions[0]?.domain).toBe("health_costs");

		expect(profile.householdContext.annualIncome).toBe(150000);

		expect(profile.householdContext.liquidAssets).toBe(50000);
	});

	it("does not manufacture questions when genetics creates no eligible planning exposures", () => {
		const profile = buildPlanningProfileV1({
			household: household(),
			geneticUploadId: "upload-1",
			modelIds: ["f5-factor-v-leiden-vte"],
			exposures: [],
		});

		expect(profile.questions).toEqual([]);
	});

	it("does not permit genetics to alter financial or longevity assumptions", () => {
		const profile = buildPlanningProfileV1({
			household: household(),
			geneticUploadId: "upload-1",
			modelIds: [],
			exposures: [],
		});

		expect(profile.guardrails).toEqual({
			geneticsChangesFinancialParameters: false,
			geneticsChangesLongevityAssumptions: false,
			consumerGeneticsIsDiagnostic: false,
			absoluteDiseaseRiskCalculated: false,
		});
	});
});

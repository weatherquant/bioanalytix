import { describe, expect, it } from "vitest";

import { toHouseholdFinancialState } from "../bioanalytix/onboarding/toHouseholdFinancialState";
import {
	BIOANALYTIX_MAXIMUM_SHORTFALL_PROBABILITY,
	BIOANALYTIX_RETIREMENT_SIMULATION_CONFIG,
	BIOANALYTIX_RETIREMENT_SPENDING_PRECISION,
	buildBioanalytixRetirementSimulationPolicy,
	getBioanalytixBaselineRetirementAge,
} from "./retirementSimulationPolicy";

function householdFixture() {
	return toHouseholdFinancialState({
		householdId: "household-1",

		input: {
			dateOfBirth: "1975-04-12",

			country: "AU",

			currency: "AUD",

			employmentStatus: "employed",

			hasPartner: false,

			hasDependants: false,

			annualHouseholdIncome: 160000,

			cashAndSavings: 50000,

			investments: 120000,

			propertyAndOtherAssets: 800000,

			retirementSavings: 350000,

			totalDebt: 300000,

			annualHouseholdSpending: 85000,

			lifeInsuranceCover: 500000,

			incomeProtectionAnnualBenefit: 80000,

			desiredInheritance: 600000,

			expectedRetirementAge: 60,
		},
	});
}

describe("Bioanalytix retirement simulation policy", () => {
	it("uses the household retirement goal as the baseline retirement age", () => {
		const household = householdFixture();

		expect(getBioanalytixBaselineRetirementAge(household)).toBe(60);
	});

	it("creates reproducible market paths using the Bioanalytix policy", () => {
		const household = householdFixture();

		const first = buildBioanalytixRetirementSimulationPolicy(household);
		const second = buildBioanalytixRetirementSimulationPolicy(household);

		expect(first.marketPaths).toEqual(second.marketPaths);

		expect(first.marketPaths).toHaveLength(
			BIOANALYTIX_RETIREMENT_SIMULATION_CONFIG.numberOfSimulations,
		);

		expect(first.marketPaths[0]?.years).toHaveLength(
			BIOANALYTIX_RETIREMENT_SIMULATION_CONFIG.numberOfYears,
		);

		expect(first.maximumShortfallProbability).toBe(BIOANALYTIX_MAXIMUM_SHORTFALL_PROBABILITY);

		expect(first.spendingPrecision).toBe(BIOANALYTIX_RETIREMENT_SPENDING_PRECISION);
	});

	it("fails rather than inventing a baseline retirement age", () => {
		const household = householdFixture();

		household.goals = household.goals.filter((goal) => goal.type !== "retirement");

		expect(() => getBioanalytixBaselineRetirementAge(household)).toThrow(
			"A baseline retirement age is required before running retirement analysis.",
		);
	});
});

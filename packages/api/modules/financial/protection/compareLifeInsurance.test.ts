import { describe, expect, it } from "vitest";

import { toHouseholdFinancialState } from "../../bioanalytix/onboarding/toHouseholdFinancialState";
import type { ProjectionAssumptions } from "../projection/types";
import { compareLifeInsurance } from "./compareLifeInsurance";

function nextAnniversary(asOfDate: string): string {
	const year = Number(asOfDate.slice(0, 4)) + 1;

	return `${year}${asOfDate.slice(4)}`;
}

function anniversaryInYears(asOfDate: string, years: number): string {
	const year = Number(asOfDate.slice(0, 4)) + years;

	return `${year}${asOfDate.slice(4)}`;
}

function createFixture() {
	const household = toHouseholdFinancialState({
		householdId: "life-insurance-comparison-test",
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

	const assumptions: ProjectionAssumptions = {
		inflationRate: 0,
		wageGrowthRate: 0,
		spendingGrowthRate: 0,
		cashReturnRate: 0,
		investmentReturnRate: 0,
		superReturnRate: 0,
		effectiveTaxRate: 0,
		projectionEndDate: anniversaryInYears(household.asOfDate, 20),
	};

	return {
		household,
		assumptions,
		primaryPersonId: household.people[0]!.id,
	};
}

describe("compareLifeInsurance", () => {
	it("compares the same survivor scenario with and without recorded life cover", () => {
		const { household, assumptions, primaryPersonId } = createFixture();

		const startDate = nextAnniversary(household.asOfDate);

		const result = compareLifeInsurance({
			household,
			assumptions,
			personId: primaryPersonId,
			startDate,
			annualIncomeLost: 100000,
		});

		expect(result.recordedLifeInsuranceCover).toBe(500000);

		expect(result.withRecordedCover.lifeInsuranceProceeds).toBe(500000);

		expect(result.withoutRecordedCover.lifeInsuranceProceeds).toBe(0);

		expect(result.difference.additionalScenarioSupport).toBe(500000);
	});

	it("holds the explicit income-loss assumption constant", () => {
		const { household, assumptions, primaryPersonId } = createFixture();

		const startDate = nextAnniversary(household.asOfDate);

		const result = compareLifeInsurance({
			household,
			assumptions,
			personId: primaryPersonId,
			startDate,
			annualIncomeLost: 90000,
		});

		expect(result.annualIncomeLost).toBe(90000);

		expect(result.withRecordedCover.annualIncomeLost).toBe(90000);

		expect(result.withoutRecordedCover.annualIncomeLost).toBe(90000);
	});

	it("reports no insurance difference when no life cover is recorded", () => {
		const { household, assumptions, primaryPersonId } = createFixture();

		const startDate = nextAnniversary(household.asOfDate);

		household.insurance = household.insurance.filter((cover) => cover.type !== "life");

		const result = compareLifeInsurance({
			household,
			assumptions,
			personId: primaryPersonId,
			startDate,
			annualIncomeLost: 100000,
		});

		expect(result.recordedLifeInsuranceCover).toBe(0);

		expect(result.difference.additionalScenarioSupport).toBe(0);

		expect(result.difference.reductionInAdditionalUnfundedNeed).toBe(0);

		expect(result.difference.endingLiquidWealthImpact).toBe(0);

		expect(result.difference.endingNetWorthImpact).toBe(0);
	});
});

import { describe, expect, it } from "vitest";

import { toHouseholdFinancialState } from "../../bioanalytix/onboarding/toHouseholdFinancialState";
import type { ProjectionAssumptions } from "../projection/types";
import { analyseSurvivorScenario } from "./survivorScenario";

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
		householdId: "survivor-test",
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

describe("analyseSurvivorScenario", () => {
	it("uses an explicit income-loss assumption rather than inferring one", () => {
		const { household, assumptions, primaryPersonId } = createFixture();

		const startDate = nextAnniversary(household.asOfDate);

		const result = analyseSurvivorScenario({
			household,
			assumptions,
			personId: primaryPersonId,
			startDate,
			annualIncomeLost: 100000,
		});

		expect(result.annualIncomeLost).toBe(100000);

		expect(result.scenario.scenario.effects.annualIncomeReduction).toBe(100000);
	});

	it("includes recorded life cover when requested", () => {
		const { household, assumptions, primaryPersonId } = createFixture();

		const startDate = nextAnniversary(household.asOfDate);

		const result = analyseSurvivorScenario({
			household,
			assumptions,
			personId: primaryPersonId,
			startDate,
			annualIncomeLost: 100000,
			includeRecordedLifeInsurance: true,
		});

		expect(result.lifeInsuranceProceeds).toBe(500000);

		expect(result.scenario.scenario.effects.oneOffInsuranceProceeds).toBe(500000);
	});

	it("can test the same survivor scenario without life cover", () => {
		const { household, assumptions, primaryPersonId } = createFixture();

		const startDate = nextAnniversary(household.asOfDate);

		const result = analyseSurvivorScenario({
			household,
			assumptions,
			personId: primaryPersonId,
			startDate,
			annualIncomeLost: 100000,
			includeRecordedLifeInsurance: false,
		});

		expect(result.lifeInsuranceProceeds).toBe(0);

		expect(result.scenario.scenario.effects.oneOffInsuranceProceeds).toBe(0);
	});

	it("shows that insurance can improve the modelled survivor position", () => {
		const { household, assumptions, primaryPersonId } = createFixture();

		const startDate = nextAnniversary(household.asOfDate);

		const withCover = analyseSurvivorScenario({
			household,
			assumptions,
			personId: primaryPersonId,
			startDate,
			annualIncomeLost: 100000,
			includeRecordedLifeInsurance: true,
		});

		const withoutCover = analyseSurvivorScenario({
			household,
			assumptions,
			personId: primaryPersonId,
			startDate,
			annualIncomeLost: 100000,
			includeRecordedLifeInsurance: false,
		});

		expect(withCover.resilience.additionalUnfundedNeed).toBeLessThanOrEqual(
			withoutCover.resilience.additionalUnfundedNeed,
		);

		expect(withCover.scenario.summary.totalScenarioSupport).toBeGreaterThan(
			withoutCover.scenario.summary.totalScenarioSupport,
		);
	});

	it("does not silently include income protection in a death scenario", () => {
		const { household, assumptions, primaryPersonId } = createFixture();

		const startDate = nextAnniversary(household.asOfDate);

		const result = analyseSurvivorScenario({
			household,
			assumptions,
			personId: primaryPersonId,
			startDate,
			annualIncomeLost: 100000,
		});

		expect(result.lifeInsuranceProceeds).toBe(500000);

		expect(result.scenario.scenario.effects.annualInsuranceBenefit).toBeUndefined();
	});

	it("rejects invalid negative financial assumptions", () => {
		const { household, assumptions, primaryPersonId } = createFixture();

		const startDate = nextAnniversary(household.asOfDate);

		expect(() =>
			analyseSurvivorScenario({
				household,
				assumptions,
				personId: primaryPersonId,
				startDate,
				annualIncomeLost: -1,
			}),
		).toThrow("Annual income lost must be a non-negative finite number.");
	});

	it("rejects a person who does not belong to the household", () => {
		const { household, assumptions } = createFixture();
		const startDate = nextAnniversary(household.asOfDate);

		expect(() =>
			analyseSurvivorScenario({
				household,
				assumptions,
				personId: "unknown-person",
				startDate,
				annualIncomeLost: 100000,
			}),
		).toThrow('Person "unknown-person" does not exist in the household.');
	});
});

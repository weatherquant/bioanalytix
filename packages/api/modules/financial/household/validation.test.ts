import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "./types";
import { calculateAgeOnDate, validateHouseholdFinancialState } from "./validation";

function validHousehold(): HouseholdFinancialState {
	return {
		id: "household-1",

		asOfDate: "2026-09-01",

		currency: "AUD",

		country: "Australia",

		people: [
			{
				id: "person-1",

				role: "primary",

				dateOfBirth: "1970-09-02",

				employmentStatus: "employed",

				expectedRetirementAge: 65,
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

			discretionaryAnnual: 25000,
		},

		assets: [
			{
				id: "asset-1",

				type: "cash",

				value: 100000,

				ownerPersonIds: ["person-1"],

				liquid: true,

				investable: true,

				incomeProducing: false,
			},
		],

		superannuation: [
			{
				id: "super-1",

				personId: "person-1",

				balance: 500000,

				annualContribution: 18000,

				preserved: true,
			},
		],

		liabilities: [
			{
				id: "liability-1",

				type: "mortgage",

				balance: 300000,

				annualInterestRate: 0.06,

				annualRepayment: 30000,

				ownerPersonIds: ["person-1"],
			},
		],

		insurance: [
			{
				id: "insurance-1",

				personId: "person-1",

				type: "life",

				sumInsured: 500000,

				annualPremium: 1800,

				endAge: 65,
			},
		],

		estate: {
			hasWill: true,

			intendedEstateValue: 750000,
		},

		goals: [
			{
				id: "goal-1",

				type: "retirement",

				targetAge: 65,

				priority: "high",
			},
		],

		assumptions: {
			inflationRate: 0.025,

			wageGrowthRate: 0.03,

			investmentReturnRate: 0.06,

			cashReturnRate: 0.03,

			superReturnRate: 0.06,

			projectionEndAge: 100,
		},
	};
}

describe("validateHouseholdFinancialState", () => {
	it("accepts a coherent household financial state", () => {
		const result = validateHouseholdFinancialState(validHousehold());

		expect(result.valid).toBe(true);

		expect(result.errors).toHaveLength(0);
	});

	it("requires at least one household member", () => {
		const household = validHousehold();

		household.people = [];

		const result = validateHouseholdFinancialState(household);

		expect(result.valid).toBe(false);

		expect(result.errors.some((issue) => issue.code === "missing_people")).toBe(true);
	});

	it("rejects negative financial balances and cash flows", () => {
		const household = validHousehold();

		household.assets[0]!.value = -1;

		household.expenses.essentialAnnual = -500;

		household.liabilities[0]!.balance = -100;

		const result = validateHouseholdFinancialState(household);

		expect(result.valid).toBe(false);

		expect(result.errors.map((issue) => issue.code)).toEqual(
			expect.arrayContaining([
				"invalid_asset_value",
				"invalid_expense_amount",
				"invalid_liability_balance",
			]),
		);
	});

	it("rejects references to unknown household members", () => {
		const household = validHousehold();

		household.income[0]!.personId = "missing-person";

		household.superannuation[0]!.personId = "missing-person";

		household.insurance[0]!.personId = "missing-person";

		const result = validateHouseholdFinancialState(household);

		expect(result.valid).toBe(false);

		expect(
			result.errors.filter((issue) => issue.code === "unknown_person_reference").length,
		).toBeGreaterThanOrEqual(3);
	});

	it("rejects duplicate identifiers within a financial collection", () => {
		const household = validHousehold();

		household.assets.push({
			...household.assets[0]!,
		});

		const result = validateHouseholdFinancialState(household);

		expect(result.valid).toBe(false);

		expect(result.errors.some((issue) => issue.code === "duplicate_id")).toBe(true);
	});

	it("rejects a projection horizon that does not extend beyond current age", () => {
		const household = validHousehold();

		household.assumptions.projectionEndAge = 55;

		const result = validateHouseholdFinancialState(household);

		expect(result.valid).toBe(false);

		expect(result.errors.some((issue) => issue.code === "projection_horizon_not_future")).toBe(
			true,
		);
	});

	it("rejects reversed income age ranges", () => {
		const household = validHousehold();

		household.income[0]!.startAge = 60;

		household.income[0]!.endAge = 50;

		const result = validateHouseholdFinancialState(household);

		expect(result.errors.some((issue) => issue.code === "income_age_range_reversed")).toBe(
			true,
		);
	});

	it("treats a past expected retirement age as a warning rather than corrupting the household", () => {
		const household = validHousehold();

		household.people[0]!.expectedRetirementAge = 50;

		const result = validateHouseholdFinancialState(household);

		expect(result.valid).toBe(true);

		expect(
			result.warnings.some((issue) => issue.code === "retirement_age_before_current_age"),
		).toBe(true);
	});
});

describe("calculateAgeOnDate", () => {
	it("calculates age without rounding before a birthday", () => {
		expect(calculateAgeOnDate("1970-09-02", "2026-09-01")).toBe(55);
	});

	it("increments age on the birthday", () => {
		expect(calculateAgeOnDate("1970-09-02", "2026-09-02")).toBe(56);
	});
});

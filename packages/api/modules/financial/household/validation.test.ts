import { describe, expect, it } from "vitest";

import type { HouseholdFinancialState } from "./types";
import { calculateAgeOnDate, validateHouseholdFinancialState } from "./validation";

function household(): HouseholdFinancialState {
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
			},
		],

		income: [
			{
				id: "income-1",

				personId: "person-1",

				type: "employment",

				annualAmount: 100000,

				taxable: true,
			},
		],

		expenses: {
			essentialAnnual: 40000,

			discretionaryAnnual: 10000,
		},

		assets: [
			{
				id: "cash-1",

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

				balance: 300000,

				annualContribution: 10000,

				preserved: true,
			},
		],

		liabilities: [
			{
				id: "mortgage-1",

				type: "mortgage",

				balance: 100000,

				annualInterestRate: 0.05,

				annualRepayment: 20000,

				ownerPersonIds: ["person-1"],
			},
		],

		insurance: [
			{
				id: "life-1",

				personId: "person-1",

				type: "life",

				sumInsured: 500000,

				annualPremium: 1000,

				endAge: 65,
			},
		],

		estate: {
			hasWill: true,
		},

		goals: [
			{
				id: "retirement-person-1",

				type: "retirement",

				personId: "person-1",

				targetAge: 60,

				priority: "high",
			},
		],
	};
}

describe("validateHouseholdFinancialState", () => {
	it("accepts a coherent household financial state", () => {
		const result = validateHouseholdFinancialState(household());

		expect(result.valid).toBe(true);

		expect(result.errors).toHaveLength(0);
	});

	it("requires at least one person and exactly one primary person", () => {
		const empty = household();

		empty.people = [];

		const emptyResult = validateHouseholdFinancialState(empty);

		expect(emptyResult.errors.some((item) => item.code === "missing_people")).toBe(true);

		const twoPrimary = household();

		twoPrimary.people.push({
			id: "person-2",

			role: "primary",

			dateOfBirth: "1980-01-01",

			employmentStatus: "employed",
		});

		const primaryResult = validateHouseholdFinancialState(twoPrimary);

		expect(primaryResult.errors.some((item) => item.code === "invalid_primary_count")).toBe(
			true,
		);
	});

	it("rejects invalid dates and future dates of birth", () => {
		const invalid = household();

		invalid.people[0]!.dateOfBirth = "1970-13-99";

		const invalidResult = validateHouseholdFinancialState(invalid);

		expect(invalidResult.errors.some((item) => item.code === "invalid_date_of_birth")).toBe(
			true,
		);

		const future = household();

		future.people[0]!.dateOfBirth = "2030-01-01";

		const futureResult = validateHouseholdFinancialState(future);

		expect(futureResult.errors.some((item) => item.code === "future_date_of_birth")).toBe(true);
	});

	it("rejects duplicate identifiers within entity collections", () => {
		const input = household();

		input.assets.push({
			...input.assets[0]!,

			value: 50000,
		});

		const result = validateHouseholdFinancialState(input);

		expect(result.errors.some((item) => item.code === "duplicate_id")).toBe(true);
	});

	it("rejects negative and non-finite financial amounts", () => {
		const input = household();

		input.income[0]!.annualAmount = -1;

		input.assets[0]!.value = Number.NaN;

		const result = validateHouseholdFinancialState(input);

		expect(result.errors.some((item) => item.code === "invalid_income_amount")).toBe(true);

		expect(result.errors.some((item) => item.code === "invalid_asset_value")).toBe(true);
	});

	it("rejects references to people who do not exist", () => {
		const input = household();

		input.superannuation[0]!.personId = "unknown-person";

		input.goals[0]!.personId = "unknown-person";

		const result = validateHouseholdFinancialState(input);

		expect(
			result.errors.filter((item) => item.code === "unknown_person_reference").length,
		).toBeGreaterThanOrEqual(2);
	});

	it("rejects duplicate ownership references", () => {
		const input = household();

		input.assets[0]!.ownerPersonIds = ["person-1", "person-1"];

		const result = validateHouseholdFinancialState(input);

		expect(result.errors.some((item) => item.code === "duplicate_person_reference")).toBe(true);
	});

	it("validates insurance and goal age fields", () => {
		const input = household();

		input.insurance[0]!.endAge = 121;

		input.goals[0]!.targetAge = 55.5;

		const result = validateHouseholdFinancialState(input);

		expect(result.errors.filter((item) => item.code === "invalid_age")).toHaveLength(2);
	});

	it("requires employment income to reference a person", () => {
		const input = household();

		delete input.income[0]!.personId;

		const result = validateHouseholdFinancialState(input);

		expect(
			result.errors.some((item) => item.code === "employment_income_requires_person"),
		).toBe(true);
	});

	it("returns review warnings without making an otherwise valid household invalid", () => {
		const input = household();

		input.people[0]!.dateOfBirth = "1900-01-01";

		input.liabilities[0]!.annualInterestRate = 1.2;

		const result = validateHouseholdFinancialState(input);

		expect(result.valid).toBe(true);

		expect(result.warnings.some((item) => item.code === "unusually_high_age")).toBe(true);

		expect(result.warnings.some((item) => item.code === "unusually_high_interest_rate")).toBe(
			true,
		);

		expect(calculateAgeOnDate("1970-09-02", "2026-09-01")).toBe(55);
	});
});

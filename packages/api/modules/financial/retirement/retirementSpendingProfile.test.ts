import { describe, expect, it } from "vitest";

import { retirementLifestyleFactor, retirementSpendingForAge } from "./retirementSpendingProfile";

describe("retirement spending profile", () => {
	it("keeps flat spending unchanged", () => {
		const result = retirementSpendingForAge({
			baseAnnualRetirementSpending: 80_000,
			age: 90,
			retirementAge: 67,
			profile: {
				type: "flat",
			},
		});

		expect(result.lifestyleFactor).toBe(1);
		expect(result.lifestyleSpending).toBe(80_000);
		expect(result.laterLifeCareCost).toBe(0);
		expect(result.totalAnnualSpending).toBe(80_000);
	});

	it("uses the illustrative age-adjusted spending profile", () => {
		expect(retirementLifestyleFactor(67)).toBe(1);
		expect(retirementLifestyleFactor(74)).toBe(1);
		expect(retirementLifestyleFactor(75)).toBe(0.9);
		expect(retirementLifestyleFactor(84)).toBe(0.9);
		expect(retirementLifestyleFactor(85)).toBe(0.8);
		expect(retirementLifestyleFactor(95)).toBe(0.8);
	});

	it("reduces lifestyle spending in later retirement", () => {
		const result = retirementSpendingForAge({
			baseAnnualRetirementSpending: 80_000,
			age: 85,
			retirementAge: 67,
			profile: {
				type: "age_adjusted",
			},
		});

		expect(result.lifestyleSpending).toBe(64_000);
		expect(result.totalAnnualSpending).toBe(64_000);
	});

	it("adds an explicit later-life care scenario", () => {
		const result = retirementSpendingForAge({
			baseAnnualRetirementSpending: 80_000,
			age: 87,
			retirementAge: 67,
			profile: {
				type: "age_adjusted",
				laterLifeCare: {
					startAge: 85,
					annualCost: 50_000,
				},
			},
		});

		expect(result.lifestyleSpending).toBe(64_000);
		expect(result.laterLifeCareCost).toBe(50_000);
		expect(result.totalAnnualSpending).toBe(114_000);
	});

	it("does not apply care costs before the selected start age", () => {
		const result = retirementSpendingForAge({
			baseAnnualRetirementSpending: 80_000,
			age: 84,
			retirementAge: 67,
			profile: {
				type: "age_adjusted",
				laterLifeCare: {
					startAge: 85,
					annualCost: 50_000,
				},
			},
		});

		expect(result.laterLifeCareCost).toBe(0);
		expect(result.totalAnnualSpending).toBe(72_000);
	});

	it("stops a time-limited care scenario after its duration", () => {
		const active = retirementSpendingForAge({
			baseAnnualRetirementSpending: 80_000,
			age: 87,
			retirementAge: 67,
			profile: {
				type: "age_adjusted",
				laterLifeCare: {
					startAge: 85,
					annualCost: 50_000,
					durationYears: 3,
				},
			},
		});

		const finished = retirementSpendingForAge({
			baseAnnualRetirementSpending: 80_000,
			age: 88,
			retirementAge: 67,
			profile: {
				type: "age_adjusted",
				laterLifeCare: {
					startAge: 85,
					annualCost: 50_000,
					durationYears: 3,
				},
			},
		});

		expect(active.laterLifeCareCost).toBe(50_000);
		expect(finished.laterLifeCareCost).toBe(0);
	});

	it("rejects invalid care assumptions", () => {
		expect(() =>
			retirementSpendingForAge({
				baseAnnualRetirementSpending: 80_000,
				age: 90,
				retirementAge: 67,
				profile: {
					type: "age_adjusted",
					laterLifeCare: {
						startAge: 85,
						annualCost: -1,
					},
				},
			}),
		).toThrow("Later-life annual care cost must be a non-negative finite number.");
	});
});

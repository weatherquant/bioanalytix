import { describe, expect, it } from "vitest";

import { calculateAustralianAgePension, calculateDeemedIncome } from "./australianAgePension";
import {
	AGE_PENSION_ASSETS_TEST,
	AGE_PENSION_DEEMING,
	AGE_PENSION_MAXIMUM_RATE,
	AUSTRALIAN_AGE_PENSION_POLICY_2026_07,
} from "./australianAgePensionPolicy";
import { AgePensionCalculationError, type AgePensionAssessmentInput } from "./types";

function singleInput(
	overrides: Partial<AgePensionAssessmentInput> = {},
): AgePensionAssessmentInput {
	return {
		age: 67,

		relationshipStatus: "single",

		homeownershipStatus: "homeowner",

		eligibleRecipients: 1,

		assessableAssets: 200000,

		financialAssets: 100000,

		otherAssessableAnnualIncome: 0,

		residencyEligible: true,

		...overrides,
	};
}

describe("Australian Age Pension policy", () => {
	it("uses the published policy snapshot for September 2026", () => {
		expect(AUSTRALIAN_AGE_PENSION_POLICY_2026_07.agePensionAge).toBe(67);

		expect(AGE_PENSION_MAXIMUM_RATE.singleFortnightly).toBe(1200.9);

		expect(AGE_PENSION_MAXIMUM_RATE.coupleEachFortnightly).toBe(905.2);

		expect(AGE_PENSION_ASSETS_TEST.fullPensionThresholds.single.homeowner).toBe(333000);

		expect(AGE_PENSION_ASSETS_TEST.fullPensionThresholds.couple.homeowner).toBe(499000);

		expect(AGE_PENSION_DEEMING.lowerRate).toBe(0.0125);

		expect(AGE_PENSION_DEEMING.upperRate).toBe(0.0325);
	});

	it("calculates the maximum single Age Pension when both means tests are below their free areas", () => {
		const result = calculateAustralianAgePension(
			singleInput({
				assessableAssets: 100000,

				financialAssets: 0,
			}),
		);

		expect(result.fortnightlyEntitlement).toBeCloseTo(1200.9, 8);

		expect(result.annualEntitlement).toBeCloseTo(31223.4, 8);

		expect(result.limitingTest).toBe("maximum_rate");
	});

	it("does not pay Age Pension before Age Pension age", () => {
		const result = calculateAustralianAgePension(
			singleInput({
				age: 66,
			}),
		);

		expect(result.fortnightlyEntitlement).toBe(0);

		expect(result.limitingTest).toBe("age");
	});

	it("does not pay Age Pension when residency eligibility is false", () => {
		const result = calculateAustralianAgePension(
			singleInput({
				residencyEligible: false,
			}),
		);

		expect(result.fortnightlyEntitlement).toBe(0);

		expect(result.limitingTest).toBe("residency");
	});

	it("applies the single homeowner asset taper above the full pension threshold", () => {
		const result = calculateAustralianAgePension(
			singleInput({
				assessableAssets: 433000,

				financialAssets: 0,
			}),
		);

		/**
		 * $100,000 above the $333,000 free area.
		 *
		 * 100 × $3 = $300 reduction per fortnight.
		 */
		expect(result.assetsTest.reductionPerFortnight).toBeCloseTo(300, 8);

		expect(result.assetsTest.fortnightlyRateAfterTest).toBeCloseTo(900.9, 8);
	});

	it("reduces the asset-test pension to zero at the published single homeowner cutoff", () => {
		const result = calculateAustralianAgePension(
			singleInput({
				assessableAssets: 733500,

				financialAssets: 0,
			}),
		);

		expect(result.assetsTest.fortnightlyRateAfterTest).toBe(0);

		expect(result.fortnightlyEntitlement).toBe(0);
	});

	it("applies the standard single income taper above the free area", () => {
		const annualOtherIncome = 326 * 26;

		const result = calculateAustralianAgePension(
			singleInput({
				assessableAssets: 100000,

				financialAssets: 0,

				otherAssessableAnnualIncome: annualOtherIncome,
			}),
		);

		/**
		 * Income is $326 per fortnight.
		 *
		 * Free area is $226.
		 *
		 * $100 excess × $0.50 = $50 reduction.
		 */
		expect(result.incomeTest.reductionPerFortnight).toBeCloseTo(50, 8);

		expect(result.incomeTest.fortnightlyRateAfterTest).toBeCloseTo(1150.9, 8);
	});

	it("calculates deemed income using the single threshold and two published deeming rates", () => {
		const result = calculateDeemedIncome({
			relationshipStatus: "single",

			financialAssets: 100000,
		});

		const expected = 66800 * 0.0125 + 33200 * 0.0325;

		expect(result.annualDeemedIncome).toBeCloseTo(expected, 8);
	});

	it("uses combined couple assets and provides the couple combined maximum where both are eligible", () => {
		const result = calculateAustralianAgePension({
			age: 67,

			relationshipStatus: "couple",

			homeownershipStatus: "homeowner",

			eligibleRecipients: 2,

			assessableAssets: 200000,

			financialAssets: 0,

			otherAssessableAnnualIncome: 0,

			residencyEligible: true,
		});

		expect(result.maximumFortnightlyRate).toBeCloseTo(1810.4, 8);

		expect(result.annualEntitlement).toBeCloseTo(47070.4, 8);
	});

	it("uses one couple-rate pension where only one partner is eligible", () => {
		const result = calculateAustralianAgePension({
			age: 67,

			relationshipStatus: "couple",

			homeownershipStatus: "homeowner",

			eligibleRecipients: 1,

			assessableAssets: 200000,

			financialAssets: 0,

			otherAssessableAnnualIncome: 0,

			residencyEligible: true,
		});

		expect(result.maximumFortnightlyRate).toBeCloseTo(905.2, 8);

		expect(result.annualEntitlement).toBeCloseTo(23535.2, 8);
	});

	it("uses whichever means test produces the lower pension rate", () => {
		const result = calculateAustralianAgePension(
			singleInput({
				assessableAssets: 533000,

				financialAssets: 100000,

				otherAssessableAnnualIncome: 0,
			}),
		);

		expect(result.fortnightlyEntitlement).toBe(
			Math.min(
				result.incomeTest.fortnightlyRateAfterTest,

				result.assetsTest.fortnightlyRateAfterTest,
			),
		);
	});

	it("fails closed when financial assets exceed assessable assets", () => {
		expect(() =>
			calculateAustralianAgePension(
				singleInput({
					assessableAssets: 100000,

					financialAssets: 150000,
				}),
			),
		).toThrow(AgePensionCalculationError);
	});

	it("fails closed when a single household claims two eligible recipients", () => {
		expect(() =>
			calculateAustralianAgePension(
				singleInput({
					eligibleRecipients: 2,
				}),
			),
		).toThrow(AgePensionCalculationError);
	});

	it("preserves modelling qualifications in the result", () => {
		const result = calculateAustralianAgePension(singleInput());

		expect(result.qualifications.length).toBeGreaterThan(0);

		expect(result.qualifications.some((value) => value.includes("Work Bonus"))).toBe(true);

		expect(result.qualifications.some((value) => value.includes("principal residence"))).toBe(
			true,
		);
	});
});

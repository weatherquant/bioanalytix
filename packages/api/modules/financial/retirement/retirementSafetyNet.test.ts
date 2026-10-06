import { describe, expect, it } from "vitest";

import { createAustralianAgePensionSafetyNet } from "./australianAgePensionSafetyNet";
import { NO_RETIREMENT_SAFETY_NET, type RetirementSafetyNetInput } from "./retirementSafetyNet";
import { AgePensionCalculationError } from "./types";

function baseInput(overrides: Partial<RetirementSafetyNetInput> = {}): RetirementSafetyNetInput {
	return {
		assessmentDate: "2026-09-03",

		age: 67,

		householdType: "single",

		assessableAssets: 100000,

		financialAssets: 0,

		otherAssessableAnnualIncome: 0,

		...overrides,
	};
}

describe("Retirement safety net", () => {
	it("supports a jurisdiction with no public retirement safety net", () => {
		const result = NO_RETIREMENT_SAFETY_NET.calculate(baseInput());

		expect(result.annualIncome).toBe(0);

		expect(result.eligible).toBe(false);

		expect(result.countryCode).toBe("NONE");
	});

	it("adapts Australian Age Pension into the generic safety-net contract", () => {
		const policy = createAustralianAgePensionSafetyNet({
			homeownershipStatus: "homeowner",

			eligibleRecipients: 1,

			residencyEligible: true,
		});

		const result = policy.calculate(baseInput());

		expect(result.countryCode).toBe("AU");

		expect(result.source).toBe("Australian Age Pension");

		expect(result.annualIncome).toBeCloseTo(31223.4, 8);

		expect(result.eligible).toBe(true);
	});

	it("returns zero Australian safety-net income below pension age", () => {
		const policy = createAustralianAgePensionSafetyNet({
			homeownershipStatus: "homeowner",

			eligibleRecipients: 1,

			residencyEligible: true,
		});

		const result = policy.calculate(
			baseInput({
				age: 66,
			}),
		);

		expect(result.annualIncome).toBe(0);

		expect(result.eligible).toBe(false);
	});

	it("returns zero Australian safety-net income where residency eligibility is not satisfied", () => {
		const policy = createAustralianAgePensionSafetyNet({
			homeownershipStatus: "homeowner",

			eligibleRecipients: 1,

			residencyEligible: false,
		});

		const result = policy.calculate(baseInput());

		expect(result.annualIncome).toBe(0);

		expect(result.eligible).toBe(false);
	});

	it("fails closed when the Australian policy snapshot is used outside its effective period", () => {
		const policy = createAustralianAgePensionSafetyNet({
			homeownershipStatus: "homeowner",

			eligibleRecipients: 1,

			residencyEligible: true,
		});

		expect(() =>
			policy.calculate(
				baseInput({
					assessmentDate: "2026-09-20",
				}),
			),
		).toThrow(AgePensionCalculationError);
	});
});

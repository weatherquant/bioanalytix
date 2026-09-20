export type RetirementSpendingProfileType = "flat" | "age_adjusted";

export interface LaterLifeCareScenario {
	startAge: number;
	annualCost: number;
	durationYears?: number;
}

export interface RetirementSpendingProfile {
	type: RetirementSpendingProfileType;

	/**
	 * Optional explicit later-life care scenario.
	 *
	 * This is a user-selected financial planning assumption.
	 * It must not be inferred automatically from genetics.
	 */
	laterLifeCare?: LaterLifeCareScenario;
}

export interface RetirementSpendingForAgeInput {
	baseAnnualRetirementSpending: number;
	age: number;
	retirementAge: number;
	profile?: RetirementSpendingProfile;
}

export interface RetirementSpendingForAgeResult {
	age: number;

	baseAnnualRetirementSpending: number;

	lifestyleFactor: number;

	lifestyleSpending: number;

	laterLifeCareCost: number;

	totalAnnualSpending: number;
}

/**
 * MVP evidence-informed retirement lifestyle spending curve.
 *
 * IMPORTANT:
 *
 * These factors are illustrative financial-planning assumptions.
 * They describe a broad age-related spending pattern and are not
 * predictions of an individual household's future expenditure.
 *
 * The factors should be methodology-reviewed and calibrated against
 * Australian retirement expenditure evidence before production use.
 *
 * Genetics must never alter these factors automatically.
 */
export function retirementLifestyleFactor(age: number): number {
	if (!Number.isFinite(age) || age < 0) {
		throw new Error("Age must be a non-negative finite number.");
	}

	if (age < 75) {
		return 1;
	}

	if (age < 85) {
		return 0.9;
	}

	return 0.8;
}

function validateCareScenario(scenario: LaterLifeCareScenario): void {
	if (!Number.isInteger(scenario.startAge) || scenario.startAge < 0 || scenario.startAge > 120) {
		throw new Error("Later-life care start age must be an integer between 0 and 120.");
	}

	if (!Number.isFinite(scenario.annualCost) || scenario.annualCost < 0) {
		throw new Error("Later-life annual care cost must be a non-negative finite number.");
	}

	if (
		scenario.durationYears !== undefined &&
		(!Number.isInteger(scenario.durationYears) || scenario.durationYears <= 0)
	) {
		throw new Error("Later-life care duration must be a positive integer when supplied.");
	}
}

function laterLifeCareCostForAge(age: number, scenario?: LaterLifeCareScenario): number {
	if (!scenario) {
		return 0;
	}

	validateCareScenario(scenario);

	if (age < scenario.startAge) {
		return 0;
	}

	if (scenario.durationYears !== undefined && age >= scenario.startAge + scenario.durationYears) {
		return 0;
	}

	return scenario.annualCost;
}

export function retirementSpendingForAge(
	input: RetirementSpendingForAgeInput,
): RetirementSpendingForAgeResult {
	if (
		!Number.isFinite(input.baseAnnualRetirementSpending) ||
		input.baseAnnualRetirementSpending < 0
	) {
		throw new Error("Base annual retirement spending must be a non-negative finite number.");
	}

	if (!Number.isFinite(input.age) || input.age < 0) {
		throw new Error("Age must be a non-negative finite number.");
	}

	if (!Number.isFinite(input.retirementAge) || input.retirementAge < 0) {
		throw new Error("Retirement age must be a non-negative finite number.");
	}

	const profile = input.profile ?? { type: "flat" as const };

	const lifestyleFactor =
		profile.type === "age_adjusted" ? retirementLifestyleFactor(input.age) : 1;

	const lifestyleSpending = input.baseAnnualRetirementSpending * lifestyleFactor;

	const laterLifeCareCost = laterLifeCareCostForAge(input.age, profile.laterLifeCare);

	return {
		age: input.age,

		baseAnnualRetirementSpending: input.baseAnnualRetirementSpending,

		lifestyleFactor,

		lifestyleSpending,

		laterLifeCareCost,

		totalAnnualSpending: lifestyleSpending + laterLifeCareCost,
	};
}

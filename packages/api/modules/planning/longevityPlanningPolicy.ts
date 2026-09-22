import type { HouseholdFinancialState } from "../financial/household/types";
import type { LongevityPlanningRange } from "../financial/views/wealthViewModel";

export const LONGEVITY_PLANNING_POLICY_VERSION = "1.0.0";

/**
 * MVP financial-planning horizons.
 *
 * These ages are scenario horizons used to stress-test retirement and
 * later-life financial resilience. They are not predictions of an
 * individual's lifespan and must not be altered automatically by genetics.
 */
const MVP_LONGEVITY_PLANNING_RANGE: LongevityPlanningRange = {
	lowerAge: 85,
	centralAge: 95,
	upperAge: 100,
};

export interface LongevityPlanningPolicy {
	version: string;
	range: LongevityPlanningRange;
	projectionYears: number;
	qualifications: string[];
}

function primaryAge(household: HouseholdFinancialState): number {
	const primary = household.people.find((person) => person.role === "primary");

	if (!primary) {
		throw new Error("Longevity planning policy requires a primary household member.");
	}

	const dateOfBirth = new Date(primary.dateOfBirth);

	if (Number.isNaN(dateOfBirth.getTime())) {
		throw new Error("Longevity planning policy requires a valid primary date of birth.");
	}

	const asOfDate = new Date(household.asOfDate);

	if (Number.isNaN(asOfDate.getTime())) {
		throw new Error("Longevity planning policy requires a valid household as-of date.");
	}

	let age = asOfDate.getUTCFullYear() - dateOfBirth.getUTCFullYear();

	const birthdayThisYear = new Date(
		Date.UTC(asOfDate.getUTCFullYear(), dateOfBirth.getUTCMonth(), dateOfBirth.getUTCDate()),
	);

	if (asOfDate < birthdayThisYear) {
		age -= 1;
	}

	return age;
}

export function buildLongevityPlanningPolicy(
	household: HouseholdFinancialState,
): LongevityPlanningPolicy {
	const age = primaryAge(household);

	const range = {
		...MVP_LONGEVITY_PLANNING_RANGE,
	};

	/*
	 * Lifecycle projections include the current year as year zero.
	 * The projection therefore needs enough years to reach the upper
	 * planning age from the primary person's current age.
	 */
	const projectionYears = Math.max(1, range.upperAge - age + 1);

	return {
		version: LONGEVITY_PLANNING_POLICY_VERSION,
		range,
		projectionYears,
		qualifications: [
			"Longevity ages are financial planning horizons rather than predictions of individual lifespan.",
			"The upper planning age is used to ensure retirement simulations test long-life financial resilience.",
			"Genetic evidence may make longevity scenarios worth exploring but does not automatically alter these planning ages.",
		],
	};
}

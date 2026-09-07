import type { HouseholdFinancialState } from "../financial/household/types";
import type { ProjectionAssumptions } from "../financial/projection/types";

export const BIOANALYTIX_PROJECTION_POLICY_VERSION = "1.0.0";

/**
 * Development / MVP projection policy.
 *
 * These are explicit financial-model assumptions.
 * They are not inferred from genetics.
 *
 * They should later become configurable and methodology-reviewed.
 */
export const BIOANALYTIX_DEFAULT_RATES = {
	inflationRate: 0.025,
	wageGrowthRate: 0.03,
	spendingGrowthRate: 0.025,
	cashReturnRate: 0.03,
	investmentReturnRate: 0.06,
	superReturnRate: 0.06,
	effectiveTaxRate: 0.25,
} as const;

export const BIOANALYTIX_DEFAULT_PROJECTION_YEARS = 40;

function addYearsToIsoDate(date: string, years: number): string {
	const [year, month, day] = date.split("-").map(Number);

	if (year === undefined || month === undefined || day === undefined) {
		throw new Error(`Invalid household as-of date: ${date}`);
	}

	const targetYear = year + years;

	const lastDayOfMonth = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();

	const targetDay = Math.min(day, lastDayOfMonth);

	return [
		String(targetYear).padStart(4, "0"),
		String(month).padStart(2, "0"),
		String(targetDay).padStart(2, "0"),
	].join("-");
}

export function buildBioanalytixProjectionAssumptions(
	household: HouseholdFinancialState,
	overrides: Partial<ProjectionAssumptions> = {},
): ProjectionAssumptions {
	const projectionEndDate = addYearsToIsoDate(
		household.asOfDate,
		BIOANALYTIX_DEFAULT_PROJECTION_YEARS,
	);

	return {
		...BIOANALYTIX_DEFAULT_RATES,

		projectionEndDate,

		...overrides,
	};
}

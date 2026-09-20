import type { RetirementSpendingProfileComparisonResult } from "../retirement/compareRetirementSpendingProfiles";

export interface LongevityJourneyPoint {
	age: number;

	projectionDate: string;

	flatSpending: number;

	ageAdjustedSpending: number;

	ageAdjustedWithCareSpending?: number;

	flatNetWorth: number;

	ageAdjustedNetWorth: number;

	ageAdjustedWithCareNetWorth?: number;
}

export interface LongevityViewModel {
	simulationCount: number;

	strategy: {
		id: string;
		name: string;
	};

	retirement: {
		age: number;
		baseAnnualSpending: number;
	};

	journey: LongevityJourneyPoint[];

	laterLifeCare?: {
		startAge: number;
		annualCost: number;
		durationYears?: number;
	};

	questionsWorthExploring: string[];

	qualifications: string[];
}

export class LongevityViewModelError extends Error {
	readonly reasons: string[];

	constructor(message: string, reasons: string[]) {
		super(message);

		this.name = "LongevityViewModelError";

		this.reasons = reasons;
	}
}

/**
 * Convert deterministic financial-model outputs into the small
 * consumer-facing model required by the Longevity experience.
 *
 * No financial calculations are performed here. The view model
 * presents distributions already calculated by the lifecycle
 * simulation and retirement spending-profile comparison.
 */
export function buildLongevityViewModel(
	result: RetirementSpendingProfileComparisonResult,
): LongevityViewModel {
	const flatYears = result.flat.summary.years;

	const ageAdjustedYears = result.ageAdjusted.summary.years;

	if (flatYears.length === 0 || ageAdjustedYears.length === 0) {
		throw new LongevityViewModelError("Longevity view cannot be created.", [
			"Retirement spending comparison does not contain projection years.",
		]);
	}

	if (flatYears.length !== ageAdjustedYears.length) {
		throw new LongevityViewModelError("Longevity view cannot be created.", [
			"Flat and age-adjusted projections do not contain the same number of years.",
		]);
	}

	const careYears = result.ageAdjustedWithCare?.summary.years;

	if (careYears && careYears.length !== flatYears.length) {
		throw new LongevityViewModelError("Longevity view cannot be created.", [
			"Later-life care projection does not contain the same number of years.",
		]);
	}

	const journey = flatYears.map((flatYear, index) => {
		const ageAdjustedYear = ageAdjustedYears[index];

		const careYear = careYears?.[index];

		if (
			!ageAdjustedYear ||
			ageAdjustedYear.projectionDate !== flatYear.projectionDate ||
			ageAdjustedYear.primaryAge !== flatYear.primaryAge
		) {
			throw new LongevityViewModelError("Longevity view cannot be created.", [
				"Flat and age-adjusted projection years are not aligned.",
			]);
		}

		if (
			careYear &&
			(careYear.projectionDate !== flatYear.projectionDate ||
				careYear.primaryAge !== flatYear.primaryAge)
		) {
			throw new LongevityViewModelError("Longevity view cannot be created.", [
				"Later-life care projection years are not aligned.",
			]);
		}

		return {
			age: flatYear.primaryAge,

			projectionDate: flatYear.projectionDate,

			flatSpending: flatYear.retirementSpending.percentiles.p50,

			ageAdjustedSpending: ageAdjustedYear.retirementSpending.percentiles.p50,

			...(careYear
				? {
						ageAdjustedWithCareSpending: careYear.retirementSpending.percentiles.p50,
					}
				: {}),

			flatNetWorth: flatYear.netWorth.percentiles.p50,

			ageAdjustedNetWorth: ageAdjustedYear.netWorth.percentiles.p50,

			...(careYear
				? {
						ageAdjustedWithCareNetWorth: careYear.netWorth.percentiles.p50,
					}
				: {}),
		};
	});

	return {
		simulationCount: result.simulationCount,

		strategy: {
			id: result.strategyId,

			name: result.strategyName,
		},

		retirement: {
			age: result.retirementAge,

			baseAnnualSpending: result.annualRetirementSpending,
		},

		journey,

		...(result.laterLifeCare
			? {
					laterLifeCare: {
						startAge: result.laterLifeCare.startAge,

						annualCost: result.laterLifeCare.annualCost,

						...(result.laterLifeCare.durationYears !== undefined
							? {
									durationYears: result.laterLifeCare.durationYears,
								}
							: {}),
					},
				}
			: {}),

		questionsWorthExploring: [
			"What if I live longer than I expect?",
			"What if my spending falls as I get older?",
			"What if I need additional care later in life?",
			"What happens financially if one of us dies first?",
		],

		qualifications: [
			"These scenarios are illustrations of different financial planning assumptions, not predictions of how you will age or spend.",
			"Age-adjusted spending is an illustrative planning assumption and should not be interpreted as a forecast of your future household spending.",
			"Later-life care costs are included only when explicitly selected as a scenario assumption; Bioanalytix does not predict whether you will need care.",
			"Genetic information may identify questions worth exploring but does not automatically change lifespan, spending or care assumptions.",
			"Financial projections describe simulated outcomes under the supplied household, market and planning assumptions.",
		],
	};
}

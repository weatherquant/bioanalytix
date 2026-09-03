import type { LifecycleSimulationResult } from "../simulation/lifecycleTypes";
import { summarizeLifecycleSimulations } from "../simulation/summarizeLifecycle";

export interface LongevityPlanningRange {
	lowerAge: number;

	centralAge: number;

	upperAge: number;
}

export interface WealthProjectionPoint {
	age: number;

	projectionDate: string;

	p25NetWealth: number;

	medianNetWealth: number;

	p75NetWealth: number;

	p25LiquidWealth: number;

	medianLiquidWealth: number;

	p75LiquidWealth: number;

	p25Superannuation: number;

	medianSuperannuation: number;

	p75Superannuation: number;
}

export interface WealthViewModel {
	simulationCount: number;

	strategyId: string;

	current: {
		netWealth: number;

		liquidWealth: number;

		superannuation: number;
	};

	longevity: LongevityPlanningRange;

	projection: WealthProjectionPoint[];

	atPlanningAge: {
		age: number;

		projectionDate: string;

		p25NetWealth: number;

		medianNetWealth: number;

		p75NetWealth: number;

		p25LiquidWealth: number;

		medianLiquidWealth: number;

		p75LiquidWealth: number;
	};

	resilience: {
		probabilityOfAnyUnfundedCashFlow: number;
	};

	qualifications: string[];
}

export class WealthViewModelError extends Error {
	readonly reasons: string[];

	constructor(message: string, reasons: string[]) {
		super(message);

		this.name = "WealthViewModelError";

		this.reasons = reasons;
	}
}

function validateLongevityRange(range: LongevityPlanningRange): void {
	const reasons: string[] = [];

	for (const [label, age] of Object.entries(range)) {
		if (!Number.isFinite(age) || age < 0 || age > 120) {
			reasons.push(`${label} must be a finite age between 0 and 120.`);
		}
	}

	if (range.lowerAge > range.centralAge) {
		reasons.push("lowerAge cannot exceed centralAge.");
	}

	if (range.centralAge > range.upperAge) {
		reasons.push("centralAge cannot exceed upperAge.");
	}

	if (reasons.length > 0) {
		throw new WealthViewModelError("Longevity planning range is invalid.", reasons);
	}
}

function findClosestProjectionYear<
	T extends {
		primaryAge: number;
	},
>(years: T[], targetAge: number): T {
	if (years.length === 0) {
		throw new WealthViewModelError("Wealth projection cannot be created.", [
			"At least one projection year is required.",
		]);
	}

	return years.reduce((closest, year) => {
		const closestDistance = Math.abs(closest.primaryAge - targetAge);

		const yearDistance = Math.abs(year.primaryAge - targetAge);

		return yearDistance < closestDistance ? year : closest;
	});
}

export function buildWealthViewModel(
	results: LifecycleSimulationResult[],
	longevity: LongevityPlanningRange,
): WealthViewModel {
	validateLongevityRange(longevity);

	const summary = summarizeLifecycleSimulations(results);

	const firstYear = summary.years[0];

	if (!firstYear) {
		throw new WealthViewModelError("Wealth projection cannot be created.", [
			"Lifecycle summary does not contain any projection years.",
		]);
	}

	const planningYear = findClosestProjectionYear(summary.years, longevity.centralAge);

	return {
		simulationCount: summary.simulationCount,

		strategyId: summary.strategyId,

		current: {
			netWealth: firstYear.netWorth.percentiles.p50,

			liquidWealth: firstYear.liquidWealth.percentiles.p50,

			superannuation: firstYear.superannuation.percentiles.p50,
		},

		longevity,

		projection: summary.years.map((year) => ({
			age: year.primaryAge,

			projectionDate: year.projectionDate,

			p25NetWealth: year.netWorth.percentiles.p25,

			medianNetWealth: year.netWorth.percentiles.p50,

			p75NetWealth: year.netWorth.percentiles.p75,

			p25LiquidWealth: year.liquidWealth.percentiles.p25,

			medianLiquidWealth: year.liquidWealth.percentiles.p50,

			p75LiquidWealth: year.liquidWealth.percentiles.p75,

			p25Superannuation: year.superannuation.percentiles.p25,

			medianSuperannuation: year.superannuation.percentiles.p50,

			p75Superannuation: year.superannuation.percentiles.p75,
		})),

		atPlanningAge: {
			age: planningYear.primaryAge,

			projectionDate: planningYear.projectionDate,

			p25NetWealth: planningYear.netWorth.percentiles.p25,

			medianNetWealth: planningYear.netWorth.percentiles.p50,

			p75NetWealth: planningYear.netWorth.percentiles.p75,

			p25LiquidWealth: planningYear.liquidWealth.percentiles.p25,

			medianLiquidWealth: planningYear.liquidWealth.percentiles.p50,

			p75LiquidWealth: planningYear.liquidWealth.percentiles.p75,
		},

		resilience: {
			probabilityOfAnyUnfundedCashFlow: summary.probabilityOfAnyUnfundedCashFlow,
		},

		qualifications: [
			"Financial projections describe simulated outcomes under the supplied household, market and planning assumptions.",
			"Longevity ages are planning horizons rather than predictions of individual lifespan.",
			"Bioanalytix does not prescribe an investment product, portfolio, insurer or retirement strategy.",
		],
	};
}

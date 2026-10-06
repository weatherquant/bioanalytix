import type { FinancialGoal, HouseholdFinancialState } from "../household/types";
import type { LifecycleSimulationResult } from "../simulation/lifecycleTypes";
import { summarizeLifecycleSimulations } from "../simulation/summarizeLifecycle";
import type { LongevityPlanningRange } from "./wealthViewModel";

export interface EstateProjectionPoint {
	age: number;

	projectionDate: string;

	p25Estate: number;

	medianEstate: number;

	p75Estate: number;
}

export interface EstateViewModel {
	simulationCount: number;

	currency: string;

	longevity: LongevityPlanningRange;

	current: {
		netEstate: number;

		liabilities: number;

		lifeInsuranceCover: number;
	};

	planning: {
		hasWill: boolean | null;

		hasEnduringPowerOfAttorney: boolean | null;

		hasSuperBeneficiaryNomination: boolean | null;
	};

	inheritanceGoal: {
		targetAmount: number | null;

		priority: "low" | "medium" | "high" | null;
	};

	projection: EstateProjectionPoint[];

	atCentralLongevityAge: {
		age: number;

		p25Estate: number;

		medianEstate: number;

		p75Estate: number;
	};

	atLongLifeAge: {
		age: number;

		p25Estate: number;

		medianEstate: number;

		p75Estate: number;
	};

	goalComparison: {
		targetAmount: number | null;

		medianSurplusOrShortfall: number | null;

		p25SurplusOrShortfall: number | null;
	};

	qualifications: string[];
}

export class EstateViewModelError extends Error {
	readonly reasons: string[];

	constructor(message: string, reasons: string[]) {
		super(message);

		this.name = "EstateViewModelError";

		this.reasons = reasons;
	}
}

function totalLiabilities(household: HouseholdFinancialState): number {
	return household.liabilities.reduce((total, liability) => total + liability.balance, 0);
}

function totalLifeInsurance(household: HouseholdFinancialState): number {
	return household.insurance
		.filter((cover) => cover.type === "life")
		.reduce((total, cover) => total + (cover.sumInsured ?? 0), 0);
}

function findEstateGoal(household: HouseholdFinancialState): FinancialGoal | undefined {
	return household.goals.find(
		(goal) => goal.type === "estate" && goal.targetAmount !== undefined,
	);
}

function findClosestYear<
	T extends {
		primaryAge: number;
	},
>(years: T[], targetAge: number): T {
	if (years.length === 0) {
		throw new EstateViewModelError("Estate projection cannot be created.", [
			"At least one lifecycle projection year is required.",
		]);
	}

	return years.reduce((closest, year) => {
		const closestDistance = Math.abs(closest.primaryAge - targetAge);

		const currentDistance = Math.abs(year.primaryAge - targetAge);

		return currentDistance < closestDistance ? year : closest;
	});
}

function validateLongevity(longevity: LongevityPlanningRange): void {
	const reasons: string[] = [];

	if (
		!Number.isFinite(longevity.lowerAge) ||
		!Number.isFinite(longevity.centralAge) ||
		!Number.isFinite(longevity.upperAge)
	) {
		reasons.push("All longevity planning ages must be finite.");
	}

	if (longevity.lowerAge > longevity.centralAge || longevity.centralAge > longevity.upperAge) {
		reasons.push("Longevity planning ages must be ordered lower, central, upper.");
	}

	if (reasons.length > 0) {
		throw new EstateViewModelError("Longevity planning range is invalid.", reasons);
	}
}

export function buildEstateViewModel(
	household: HouseholdFinancialState,
	results: LifecycleSimulationResult[],
	longevity: LongevityPlanningRange,
): EstateViewModel {
	validateLongevity(longevity);

	const summary = summarizeLifecycleSimulations(results);

	const firstYear = summary.years[0];

	if (!firstYear) {
		throw new EstateViewModelError("Estate projection cannot be created.", [
			"Lifecycle summary contains no projection years.",
		]);
	}

	const centralYear = findClosestYear(summary.years, longevity.centralAge);

	const longLifeYear = findClosestYear(summary.years, longevity.upperAge);

	const estateGoal = findEstateGoal(household);

	const targetAmount = estateGoal?.targetAmount ?? null;

	const centralMedian = centralYear.netWorth.percentiles.p50;

	const centralP25 = centralYear.netWorth.percentiles.p25;

	return {
		simulationCount: summary.simulationCount,

		currency: household.currency,

		longevity,

		current: {
			netEstate: firstYear.netWorth.percentiles.p50,

			liabilities: totalLiabilities(household),

			lifeInsuranceCover: totalLifeInsurance(household),
		},

		planning: {
			hasWill: household.estate.hasWill ?? null,

			hasEnduringPowerOfAttorney: household.estate.hasEnduringPowerOfAttorney ?? null,

			hasSuperBeneficiaryNomination: household.estate.hasSuperBeneficiaryNomination ?? null,
		},

		inheritanceGoal: {
			targetAmount,

			priority: estateGoal?.priority ?? null,
		},

		projection: summary.years.map((year) => ({
			age: year.primaryAge,

			projectionDate: year.projectionDate,

			p25Estate: year.netWorth.percentiles.p25,

			medianEstate: year.netWorth.percentiles.p50,

			p75Estate: year.netWorth.percentiles.p75,
		})),

		atCentralLongevityAge: {
			age: centralYear.primaryAge,

			p25Estate: centralP25,

			medianEstate: centralMedian,

			p75Estate: centralYear.netWorth.percentiles.p75,
		},

		atLongLifeAge: {
			age: longLifeYear.primaryAge,

			p25Estate: longLifeYear.netWorth.percentiles.p25,

			medianEstate: longLifeYear.netWorth.percentiles.p50,

			p75Estate: longLifeYear.netWorth.percentiles.p75,
		},

		goalComparison: {
			targetAmount,

			medianSurplusOrShortfall: targetAmount === null ? null : centralMedian - targetAmount,

			p25SurplusOrShortfall: targetAmount === null ? null : centralP25 - targetAmount,
		},

		qualifications: [
			"Projected estate is represented by projected household net worth and is a financial planning measure rather than a legal probate-estate calculation.",
			"Estate projections do not model jurisdiction-specific succession law, tax, probate costs, ownership structures or beneficiary entitlements.",
			"Life insurance cover is reported separately and is not automatically added to projected estate values.",
			"Longevity ages are planning horizons rather than predictions of individual lifespan.",
		],
	};
}

import { LifecycleSimulationError, type LifecyclePhase } from "./lifecycleTypes";
import type { AssetClassAllocation, PortfolioStrategy } from "./types";

const ALLOCATION_TOLERANCE = 0.000001;

function validateAllocation(
	allocation: AssetClassAllocation,
	label: string,
	reasons: string[],
): void {
	const values = [allocation.growth, allocation.defensive, allocation.cash];

	if (values.some((value) => !Number.isFinite(value))) {
		reasons.push(`${label} allocation values must be finite.`);

		return;
	}

	if (values.some((value) => value < 0 || value > 1)) {
		reasons.push(`${label} allocation values must be between 0 and 1.`);
	}

	const total = values.reduce((sum, value) => sum + value, 0);

	if (Math.abs(total - 1) > ALLOCATION_TOLERANCE) {
		reasons.push(`${label} allocation must sum to 1.`);
	}
}

export function validatePortfolioStrategy(strategy: PortfolioStrategy): void {
	const reasons: string[] = [];

	if (strategy.id.trim().length === 0) {
		reasons.push("Portfolio strategy identifier must not be empty.");
	}

	if (strategy.name.trim().length === 0) {
		reasons.push("Portfolio strategy name must not be empty.");
	}

	if (
		!Number.isInteger(strategy.transitionYearsBeforeRetirement) ||
		strategy.transitionYearsBeforeRetirement < 0
	) {
		reasons.push("Transition years before retirement must be a non-negative integer.");
	}

	validateAllocation(strategy.workingAllocation, "Working", reasons);

	validateAllocation(strategy.transitionAllocation, "Retirement transition", reasons);

	validateAllocation(strategy.retirementAllocation, "Retirement", reasons);

	if (reasons.length > 0) {
		throw new LifecycleSimulationError("Portfolio strategy is invalid.", reasons);
	}
}

export function lifecyclePhaseForAge(
	age: number,
	retirementAge: number,
	transitionYearsBeforeRetirement: number,
): LifecyclePhase {
	if (age >= retirementAge) {
		return "retired";
	}

	if (age >= retirementAge - transitionYearsBeforeRetirement) {
		return "retirement_transition";
	}

	return "working";
}

export function allocationForPhase(
	strategy: PortfolioStrategy,
	phase: LifecyclePhase,
): AssetClassAllocation {
	switch (phase) {
		case "working":
			return {
				...strategy.workingAllocation,
			};

		case "retirement_transition":
			return {
				...strategy.transitionAllocation,
			};

		case "retired":
			return {
				...strategy.retirementAllocation,
			};
	}
}

export function calculatePortfolioReturn(
	allocation: AssetClassAllocation,
	returns: {
		growthReturn: number;
		defensiveReturn: number;
		cashReturn: number;
	},
): number {
	return (
		allocation.growth * returns.growthReturn +
		allocation.defensive * returns.defensiveReturn +
		allocation.cash * returns.cashReturn
	);
}

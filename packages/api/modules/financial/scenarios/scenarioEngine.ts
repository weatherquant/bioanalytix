import { isValidIsoDate } from "../household/validation";
import { runBaselineProjection } from "../projection/baselineProjection";
import type { ProjectionYear } from "../projection/types";
import {
	ScenarioEngineError,
	type ScenarioAnnualImpact,
	type ScenarioDefinition,
	type ScenarioEffects,
	type ScenarioInput,
	type ScenarioProjectionYear,
	type ScenarioResult,
} from "./types";

function emptyImpact(): ScenarioAnnualImpact {
	return {
		active: false,

		annualIncomeReduction: 0,

		annualAdditionalExpenses: 0,

		oneOffExpense: 0,

		annualInsuranceBenefit: 0,

		oneOffInsuranceProceeds: 0,

		grossScenarioCost: 0,

		scenarioSupport: 0,

		netScenarioCashFlow: 0,
	};
}

function nonNegativeFiniteValue(value: number | undefined, label: string): string | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (!Number.isFinite(value)) {
		return `${label} must be a finite number.`;
	}

	if (value < 0) {
		return `${label} must not be negative.`;
	}

	return undefined;
}

function scenarioHasFinancialEffect(effects: ScenarioEffects): boolean {
	const values = [
		effects.annualIncomeReduction,
		effects.annualAdditionalExpenses,
		effects.oneOffExpense,
		effects.annualInsuranceBenefit,
		effects.oneOffInsuranceProceeds,
	];

	return values.some((value) => value !== undefined && value > 0);
}

function validateScenario(input: ScenarioInput): void {
	const { household, assumptions, scenario } = input;

	const reasons: string[] = [];

	if (scenario.id.trim().length === 0) {
		reasons.push("Scenario identifier must not be empty.");
	}

	if (scenario.name.trim().length === 0) {
		reasons.push("Scenario name must not be empty.");
	}

	if (!isValidIsoDate(scenario.startDate)) {
		reasons.push("Scenario start date must be a valid ISO date in YYYY-MM-DD format.");
	} else {
		if (scenario.startDate < household.asOfDate) {
			reasons.push("Scenario start date must not be before the household as-of date.");
		}

		if (scenario.startDate >= assumptions.projectionEndDate) {
			reasons.push("Scenario start date must be before the projection end date.");
		}

		if (scenario.startDate.slice(5) !== household.asOfDate.slice(5)) {
			reasons.push(
				"Scenario start date must fall on an annual anniversary of the household as-of date for Scenario Engine v1.",
			);
		}
	}

	if (
		scenario.durationYears !== undefined &&
		(!Number.isInteger(scenario.durationYears) || scenario.durationYears <= 0)
	) {
		reasons.push("Scenario duration must be a positive integer number of years.");
	}

	if (
		scenario.affectedPersonId !== undefined &&
		!household.people.some((person) => person.id === scenario.affectedPersonId)
	) {
		reasons.push(
			`Affected person "${scenario.affectedPersonId}" does not exist in the household.`,
		);
	}

	const effectChecks: Array<[number | undefined, string]> = [
		[scenario.effects.annualIncomeReduction, "Annual income reduction"],
		[scenario.effects.annualAdditionalExpenses, "Annual additional expenses"],
		[scenario.effects.oneOffExpense, "One-off expense"],
		[scenario.effects.annualInsuranceBenefit, "Annual insurance benefit"],
		[scenario.effects.oneOffInsuranceProceeds, "One-off insurance proceeds"],
	];

	effectChecks.forEach(([value, label]) => {
		const reason = nonNegativeFiniteValue(value, label);

		if (reason) {
			reasons.push(reason);
		}
	});

	if (!scenarioHasFinancialEffect(scenario.effects)) {
		reasons.push("Scenario must contain at least one non-zero financial effect.");
	}

	if (reasons.length > 0) {
		throw new ScenarioEngineError("Financial scenario cannot be evaluated.", reasons);
	}
}

function wholeYearsBetween(startDate: string, endDate: string): number {
	return Number(endDate.slice(0, 4)) - Number(startDate.slice(0, 4));
}

function periodIsActive(scenario: ScenarioDefinition, periodStartDate: string): boolean {
	if (periodStartDate < scenario.startDate) {
		return false;
	}

	const elapsedYears = wholeYearsBetween(scenario.startDate, periodStartDate);

	if (scenario.durationYears === undefined) {
		return true;
	}

	return elapsedYears < scenario.durationYears;
}

function isFirstActivePeriod(scenario: ScenarioDefinition, periodStartDate: string): boolean {
	return periodStartDate === scenario.startDate;
}

function impactForPeriod(
	scenario: ScenarioDefinition,
	periodStartDate: string,
): ScenarioAnnualImpact {
	if (!periodIsActive(scenario, periodStartDate)) {
		return emptyImpact();
	}

	const firstPeriod = isFirstActivePeriod(scenario, periodStartDate);

	const annualIncomeReduction = scenario.effects.annualIncomeReduction ?? 0;

	const annualAdditionalExpenses = scenario.effects.annualAdditionalExpenses ?? 0;

	const oneOffExpense = firstPeriod ? (scenario.effects.oneOffExpense ?? 0) : 0;

	const annualInsuranceBenefit = scenario.effects.annualInsuranceBenefit ?? 0;

	const oneOffInsuranceProceeds = firstPeriod
		? (scenario.effects.oneOffInsuranceProceeds ?? 0)
		: 0;

	const grossScenarioCost = annualIncomeReduction + annualAdditionalExpenses + oneOffExpense;

	const scenarioSupport = annualInsuranceBenefit + oneOffInsuranceProceeds;

	const netScenarioCashFlow = scenarioSupport - grossScenarioCost;

	return {
		active: true,

		annualIncomeReduction,

		annualAdditionalExpenses,

		oneOffExpense,

		annualInsuranceBenefit,

		oneOffInsuranceProceeds,

		grossScenarioCost,

		scenarioSupport,

		netScenarioCashFlow,
	};
}

function baselineFundingPosition(baseline: ProjectionYear): number {
	return baseline.liquidWealth - baseline.unfundedCashFlow;
}

function createOpeningYear(baseline: ProjectionYear): ScenarioProjectionYear {
	const fundingPosition = baselineFundingPosition(baseline);

	return {
		baseline,

		periodEndDate: baseline.projectionDate,

		scenarioImpact: emptyImpact(),

		baselineFundingPosition: fundingPosition,

		stressedFundingPosition: fundingPosition,

		stressedLiquidWealth: baseline.liquidWealth,

		stressedNetWorth: baseline.netWorth,

		stressedUnfundedCashFlow: baseline.unfundedCashFlow,

		unfundedCashFlowImpact: 0,

		additionalUnfundedCashFlow: 0,

		reducedUnfundedCashFlow: 0,

		liquidWealthImpact: 0,

		netWorthImpact: 0,
	};
}

/**
 * Scenario Engine v1 is a liquidity-resilience overlay
 * on the canonical baseline projection.
 *
 * Scenario effects represent explicit financial planning
 * assumptions. The engine does not infer financial
 * parameters from genetics or biological information.
 *
 * It does not silently alter:
 *
 * - mortality
 * - retirement age
 * - investment allocation
 * - investment return assumptions
 * - debt contractual terms
 * - superannuation assumptions
 * - insurance coverage
 *
 * Unfunded cash flow is a resilience measure, not a debt
 * balance. An unmet requirement is therefore not silently
 * compounded or carried forward as borrowing.
 */
export function runFinancialScenario(input: ScenarioInput): ScenarioResult {
	validateScenario(input);

	const { household, assumptions, scenario } = input;

	const baseline = runBaselineProjection({
		household,
		assumptions,
	});

	const openingBaseline = baseline.years[0];

	if (!openingBaseline) {
		throw new ScenarioEngineError("Baseline projection did not produce an opening state.", [
			"Baseline projection contains no projection years.",
		]);
	}

	const years: ScenarioProjectionYear[] = [createOpeningYear(openingBaseline)];

	let totalIncomeReduction = 0;

	let totalAdditionalExpenses = 0;

	let totalScenarioCost = 0;

	let totalScenarioSupport = 0;

	let totalNetScenarioCashFlow = 0;

	let totalAdditionalUnfundedCashFlow = 0;

	let totalReducedUnfundedCashFlow = 0;

	let totalUnfundedCashFlowImpact = 0;

	let firstAdditionalUnfundedDate: string | undefined;

	for (let index = 1; index < baseline.years.length; index += 1) {
		const currentBaseline = baseline.years[index];

		const previousBaseline = baseline.years[index - 1];

		const previousScenarioYear = years[index - 1];

		if (!currentBaseline || !previousBaseline || !previousScenarioYear) {
			throw new ScenarioEngineError(
				"Scenario projection could not align with the baseline projection.",
				[`Projection row ${index} is missing.`],
			);
		}

		const periodStartDate = previousBaseline.projectionDate;

		const impact = impactForPeriod(scenario, periodStartDate);

		/**
		 * Only actual liquid wealth divergence carries
		 * forward. A prior unmet need is not converted
		 * into invented borrowing.
		 */
		const previousLiquidityImpact =
			previousScenarioYear.stressedLiquidWealth - previousBaseline.liquidWealth;

		const carriedLiquidityImpact = previousLiquidityImpact * (1 + assumptions.cashReturnRate);

		const currentBaselineFundingPosition = baselineFundingPosition(currentBaseline);

		const stressedFundingPosition =
			currentBaselineFundingPosition + carriedLiquidityImpact + impact.netScenarioCashFlow;

		/**
		 * Available liquidity and an unmet requirement
		 * cannot both be positive for the same funding
		 * position.
		 */
		const stressedLiquidWealth = Math.max(0, stressedFundingPosition);

		const stressedUnfundedCashFlow = Math.max(0, -stressedFundingPosition);

		const unfundedCashFlowImpact = stressedUnfundedCashFlow - currentBaseline.unfundedCashFlow;

		const additionalUnfundedCashFlow = Math.max(0, unfundedCashFlowImpact);

		const reducedUnfundedCashFlow = Math.max(0, -unfundedCashFlowImpact);

		const liquidWealthImpact = stressedLiquidWealth - currentBaseline.liquidWealth;

		/**
		 * Removing a baseline funding gap is not itself
		 * wealth creation. Only residual funded liquidity
		 * changes the modelled net worth.
		 */
		const stressedNetWorth = currentBaseline.netWorth + liquidWealthImpact;

		const netWorthImpact = stressedNetWorth - currentBaseline.netWorth;

		totalIncomeReduction += impact.annualIncomeReduction;

		totalAdditionalExpenses += impact.annualAdditionalExpenses + impact.oneOffExpense;

		totalScenarioCost += impact.grossScenarioCost;

		totalScenarioSupport += impact.scenarioSupport;

		totalNetScenarioCashFlow += impact.netScenarioCashFlow;

		totalAdditionalUnfundedCashFlow += additionalUnfundedCashFlow;

		totalReducedUnfundedCashFlow += reducedUnfundedCashFlow;

		totalUnfundedCashFlowImpact += unfundedCashFlowImpact;

		if (additionalUnfundedCashFlow > 0 && firstAdditionalUnfundedDate === undefined) {
			firstAdditionalUnfundedDate = currentBaseline.projectionDate;
		}

		years.push({
			baseline: currentBaseline,

			periodStartDate,

			periodEndDate: currentBaseline.projectionDate,

			scenarioImpact: impact,

			baselineFundingPosition: currentBaselineFundingPosition,

			stressedFundingPosition,

			stressedLiquidWealth,

			stressedNetWorth,

			stressedUnfundedCashFlow,

			unfundedCashFlowImpact,

			additionalUnfundedCashFlow,

			reducedUnfundedCashFlow,

			liquidWealthImpact,

			netWorthImpact,
		});
	}

	const finalYear = years[years.length - 1]!;

	return {
		scenario: {
			...scenario,

			effects: {
				...scenario.effects,
			},
		},

		baseline,

		years,

		summary: {
			totalIncomeReduction,

			totalAdditionalExpenses,

			totalScenarioCost,

			totalScenarioSupport,

			totalInsuranceSupport: totalScenarioSupport,

			totalNetScenarioCashFlow,

			totalAdditionalUnfundedCashFlow,

			totalReducedUnfundedCashFlow,

			totalUnfundedCashFlowImpact,

			endingLiquidWealthImpact: finalYear.liquidWealthImpact,

			endingNetWorthImpact: finalYear.netWorthImpact,

			firstAdditionalUnfundedDate,
		},
	};
}

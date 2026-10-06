import {
	AGE_PENSION_DEEMING,
	assetsCutoff,
	assetsFreeArea,
	assetTaperPerThousand,
	deemingThreshold,
	incomeFreeArea,
	incomeTaper,
	maximumFortnightlyRate,
	AUSTRALIAN_AGE_PENSION_POLICY_2026_07,
} from "./australianAgePensionPolicy";
import {
	AgePensionCalculationError,
	type AgePensionAssessmentInput,
	type AgePensionAssessmentResult,
	type AgePensionLimitingTest,
	type AgePensionTestResult,
	type DeemingResult,
} from "./types";

const FORTNIGHTS_PER_YEAR = 26;

function validateFiniteNonNegative(value: number, name: string, reasons: string[]): void {
	if (!Number.isFinite(value) || value < 0) {
		reasons.push(`${name} must be a finite non-negative number.`);
	}
}

function validateInput(input: AgePensionAssessmentInput): void {
	const reasons: string[] = [];

	if (!Number.isFinite(input.age) || input.age < 0 || input.age > 120) {
		reasons.push("Age must be a finite number between 0 and 120.");
	}

	validateFiniteNonNegative(input.assessableAssets, "Assessable assets", reasons);

	validateFiniteNonNegative(input.financialAssets, "Financial assets", reasons);

	validateFiniteNonNegative(
		input.otherAssessableAnnualIncome,
		"Other assessable annual income",
		reasons,
	);

	if (input.financialAssets > input.assessableAssets) {
		reasons.push("Financial assets cannot exceed total assessable assets.");
	}

	if (input.relationshipStatus === "single" && input.eligibleRecipients !== 1) {
		reasons.push("A single household must have exactly one eligible recipient.");
	}

	if (reasons.length > 0) {
		throw new AgePensionCalculationError("Age Pension assessment input is invalid.", reasons);
	}
}

export function calculateDeemedIncome(
	input: Pick<AgePensionAssessmentInput, "relationshipStatus" | "financialAssets">,
): DeemingResult {
	const threshold = deemingThreshold(input.relationshipStatus);

	const lowerBand = Math.min(input.financialAssets, threshold);

	const upperBand = Math.max(0, input.financialAssets - threshold);

	const annualDeemedIncome =
		lowerBand * AGE_PENSION_DEEMING.lowerRate + upperBand * AGE_PENSION_DEEMING.upperRate;

	return {
		financialAssets: input.financialAssets,

		lowerThreshold: threshold,

		lowerRate: AGE_PENSION_DEEMING.lowerRate,

		upperRate: AGE_PENSION_DEEMING.upperRate,

		annualDeemedIncome,

		fortnightlyDeemedIncome: annualDeemedIncome / FORTNIGHTS_PER_YEAR,
	};
}

function calculateIncomeTest(
	input: AgePensionAssessmentInput,
	maximumRate: number,
	totalFortnightlyIncome: number,
): AgePensionTestResult {
	const freeArea = incomeFreeArea(input.relationshipStatus);

	const taper = incomeTaper(input.relationshipStatus, input.eligibleRecipients);

	const excessIncome = Math.max(0, totalFortnightlyIncome - freeArea);

	const reduction = excessIncome * taper;

	const rate = Math.max(0, maximumRate - reduction);

	return {
		maximumFortnightlyRate: maximumRate,

		fortnightlyRateAfterTest: rate,

		annualRateAfterTest: rate * FORTNIGHTS_PER_YEAR,

		reductionPerFortnight: reduction,
	};
}

function calculateAssetsTest(
	input: AgePensionAssessmentInput,
	maximumRate: number,
): AgePensionTestResult {
	const freeArea = assetsFreeArea(input.relationshipStatus, input.homeownershipStatus);

	const cutoff = assetsCutoff(input.relationshipStatus, input.homeownershipStatus);

	if (input.assessableAssets >= cutoff) {
		return {
			maximumFortnightlyRate: maximumRate,

			fortnightlyRateAfterTest: 0,

			annualRateAfterTest: 0,

			reductionPerFortnight: maximumRate,
		};
	}

	const excessAssets = Math.max(0, input.assessableAssets - freeArea);

	const taper = assetTaperPerThousand(input.relationshipStatus, input.eligibleRecipients);

	const reduction = (excessAssets / 1000) * taper;

	const rate = Math.max(0, maximumRate - reduction);

	return {
		maximumFortnightlyRate: maximumRate,

		fortnightlyRateAfterTest: rate,

		annualRateAfterTest: rate * FORTNIGHTS_PER_YEAR,

		reductionPerFortnight: reduction,
	};
}

function determineLimitingTest(
	eligibleByAge: boolean,
	eligibleByResidency: boolean,
	maximumRate: number,
	incomeRate: number,
	assetsRate: number,
): AgePensionLimitingTest {
	if (!eligibleByAge) {
		return "age";
	}

	if (!eligibleByResidency) {
		return "residency";
	}

	if (incomeRate < assetsRate && incomeRate < maximumRate) {
		return "income";
	}

	if (assetsRate < incomeRate && assetsRate < maximumRate) {
		return "assets";
	}

	if (incomeRate === maximumRate && assetsRate === maximumRate) {
		return "maximum_rate";
	}

	/**
	 * If both means tests result in the same reduced rate,
	 * identifying either as uniquely limiting would be
	 * misleading.
	 *
	 * We report the assets test for this deterministic tie;
	 * downstream UI should rely on the actual test results,
	 * not this label alone.
	 */
	return "assets";
}

export function calculateAustralianAgePension(
	input: AgePensionAssessmentInput,
): AgePensionAssessmentResult {
	validateInput(input);

	const policy = AUSTRALIAN_AGE_PENSION_POLICY_2026_07;

	const eligibleByAge = input.age >= policy.agePensionAge;

	const eligibleByResidency = input.residencyEligible;

	const maximumRate = maximumFortnightlyRate(input.relationshipStatus, input.eligibleRecipients);

	const deeming = calculateDeemedIncome(input);

	const totalAssessableAnnualIncome =
		input.otherAssessableAnnualIncome + deeming.annualDeemedIncome;

	const totalAssessableFortnightlyIncome = totalAssessableAnnualIncome / FORTNIGHTS_PER_YEAR;

	const incomeTest = calculateIncomeTest(input, maximumRate, totalAssessableFortnightlyIncome);

	const assetsTest = calculateAssetsTest(input, maximumRate);

	const meansTestRate = Math.min(
		incomeTest.fortnightlyRateAfterTest,
		assetsTest.fortnightlyRateAfterTest,
	);

	const fortnightlyEntitlement = eligibleByAge && eligibleByResidency ? meansTestRate : 0;

	const limitingTest = determineLimitingTest(
		eligibleByAge,
		eligibleByResidency,
		maximumRate,
		incomeTest.fortnightlyRateAfterTest,
		assetsTest.fortnightlyRateAfterTest,
	);

	return {
		policyId: policy.id,

		eligibleByAge,

		eligibleByResidency,

		maximumFortnightlyRate: maximumRate,

		maximumAnnualRate: maximumRate * FORTNIGHTS_PER_YEAR,

		deeming,

		totalAssessableAnnualIncome,

		totalAssessableFortnightlyIncome,

		incomeTest,

		assetsTest,

		fortnightlyEntitlement,

		annualEntitlement: fortnightlyEntitlement * FORTNIGHTS_PER_YEAR,

		limitingTest,

		receivesAgePension: fortnightlyEntitlement > 0,

		qualifications: [
			"Indicative Australian Age Pension calculation only; not a Centrelink entitlement determination.",

			"Standard Age Pension rules are used; transitional pre-20 September 2009 pension rules are excluded.",

			"Residency and non-financial eligibility are represented only by the residencyEligible input.",

			"Rent Assistance is excluded.",

			"Work Bonus is excluded.",

			"Illness-separated couple rules are excluded.",

			"Overseas pension-rate rules are excluded.",

			"Assessable assets must already exclude the principal residence and other exempt assets where applicable.",

			"Financial assets are deemed using the policy rates applicable to this policy snapshot.",

			"Policy settings are date-versioned and must be replaced after the policy effective period.",
		],
	};
}

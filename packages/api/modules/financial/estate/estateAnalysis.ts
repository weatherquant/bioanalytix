import type {
FinancialGoal,
HouseholdFinancialState,
} from "../household/types";

export type EstateAssessment =
| "strong"
| "comfortable"
| "worth_reviewing"
| "exposed";

export interface EstatePosition {
netHouseholdResources: number;
totalAssets: number;
totalLiabilities: number;

inheritanceGoal: number | null;
currentSurplusOrShortfallToGoal: number | null;

documentation: {
hasWill: boolean | null;
hasEnduringPowerOfAttorney: boolean | null;
hasSuperBeneficiaryNomination: boolean | null;
completed: number;
unknown: number;
};

assessment: EstateAssessment;

economicAssessment: EstateAssessment;
documentationAssessment: EstateAssessment;

reasons: string[];
qualifications: string[];
}

function estateGoal(
household: HouseholdFinancialState,
): FinancialGoal | undefined {
return household.goals.find(
(goal) =>
goal.type === "estate" &&
goal.targetAmount !== undefined,
);
}

function rank(
assessment: EstateAssessment,
): number {
switch (assessment) {
case "exposed":
return 4;
case "worth_reviewing":
return 3;
case "comfortable":
return 2;
case "strong":
return 1;
}
}

function worseOf(
first: EstateAssessment,
second: EstateAssessment,
): EstateAssessment {
return rank(first) >= rank(second)
? first
: second;
}

function assessDocumentation(
household: HouseholdFinancialState,
): {
assessment: EstateAssessment;
completed: number;
unknown: number;
reasons: string[];
} {
const values = [
household.estate.hasWill ?? null,
household.estate.hasEnduringPowerOfAttorney ?? null,
household.estate.hasSuperBeneficiaryNomination ?? null,
];

const completed = values.filter(
(value) => value === true,
).length;

const unknown = values.filter(
(value) => value === null,
).length;

if (completed === 3) {
return {
assessment: "strong",
completed,
unknown,
reasons: [
"Your core will, decision-making and super beneficiary arrangements are recorded as being in place.",
],
};
}

if (completed === 0 && unknown === 0) {
return {
assessment: "exposed",
completed,
unknown,
reasons: [
"Your core estate arrangements are recorded as not currently being in place.",
],
};
}

return {
assessment: "worth_reviewing",
completed,
unknown,
reasons: [
"Some estate arrangements are incomplete or have not yet been confirmed.",
],
};
}

function assessEconomics(
netHouseholdResources: number,
targetAmount: number | null,
): {
assessment: EstateAssessment;
reasons: string[];
} {
if (netHouseholdResources < 0) {
return {
assessment: "exposed",
reasons: [
"Recorded household liabilities exceed recorded household assets.",
],
};
}

if (targetAmount === null) {
return {
assessment: "comfortable",
reasons: [
"Recorded household assets exceed recorded liabilities, but no inheritance objective is currently recorded.",
],
};
}

const surplusOrShortfall =
netHouseholdResources - targetAmount;

if (surplusOrShortfall >= targetAmount * 0.25) {
return {
assessment: "strong",
reasons: [
"Current net household resources are materially above your recorded inheritance objective.",
],
};
}

if (surplusOrShortfall >= 0) {
return {
assessment: "comfortable",
reasons: [
"Current net household resources are above your recorded inheritance objective.",
],
};
}

return {
assessment: "worth_reviewing",
reasons: [
"Your recorded inheritance objective is above current net household resources.",
],
};
}

/**
 * Provides a broad current-position estate and family assessment.
 *
 * This is deliberately not a legal probate-estate calculation and
 * does not replace the projected EstateViewModel.
 */
export function assessEstatePosition(
household: HouseholdFinancialState,
): EstatePosition {
const totalAssets =
household.assets.reduce(
(total, asset) => total + asset.value,
0,
) +
household.superannuation.reduce(
(total, account) => total + account.balance,
0,
);

const totalLiabilities =
household.liabilities.reduce(
(total, liability) =>
total + liability.balance,
0,
);

const netHouseholdResources =
totalAssets - totalLiabilities;

const goal = estateGoal(household);
const targetAmount = goal?.targetAmount ?? null;

const economics = assessEconomics(
netHouseholdResources,
targetAmount,
);

const documentation =
assessDocumentation(household);

const assessment = worseOf(
economics.assessment,
documentation.assessment,
);

return {
netHouseholdResources,
totalAssets,
totalLiabilities,

inheritanceGoal: targetAmount,

currentSurplusOrShortfallToGoal:
targetAmount === null
? null
: netHouseholdResources - targetAmount,

documentation: {
hasWill:
household.estate.hasWill ?? null,
hasEnduringPowerOfAttorney:
household.estate
.hasEnduringPowerOfAttorney ?? null,
hasSuperBeneficiaryNomination:
household.estate
.hasSuperBeneficiaryNomination ?? null,
completed: documentation.completed,
unknown: documentation.unknown,
},

assessment,
economicAssessment: economics.assessment,
documentationAssessment:
documentation.assessment,

reasons: [
...economics.reasons,
...documentation.reasons,
],

qualifications: [
"This assessment uses current household assets, superannuation and liabilities as a broad financial planning measure rather than a legal probate-estate calculation.",
"Superannuation and insurance may pass outside the estate depending on ownership and beneficiary arrangements.",
"The assessment does not model succession law, taxation, probate costs, ownership structures or beneficiary entitlements.",
"Current resources are not a projection of the amount ultimately available to beneficiaries.",
],
};
}

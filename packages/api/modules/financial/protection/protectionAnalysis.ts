import type {
HouseholdFinancialState,
InsuranceCover,
} from "../household/types";

export type ProtectionAssessment =
| "strong"
| "comfortable"
| "worth_reviewing"
| "exposed";

export interface ProtectionPosition {
personId: string;

annualIncomeAtRisk: number;

lifeInsuranceCover: number;

incomeProtectionAnnualBenefit: number;

totalHouseholdLiabilities: number;

liquidAssets: number;

financialAssets: number;

hasFinancialDependants: boolean;

assessment: ProtectionAssessment;

reasons: string[];
}

function coversForPerson(
household: HouseholdFinancialState,
personId: string,
): InsuranceCover[] {
return household.insurance.filter(
(cover) => cover.personId === personId,
);
}

function sumLifeCover(covers: InsuranceCover[]): number {
return covers
.filter((cover) => cover.type === "life")
.reduce((total, cover) => total + (cover.sumInsured ?? 0), 0);
}

function sumIncomeProtection(covers: InsuranceCover[]): number {
return covers
.filter((cover) => cover.type === "income_protection")
.reduce(
(total, cover) => total + (cover.annualBenefit ?? 0),
0,
);
}

function totalLiabilities(
household: HouseholdFinancialState,
): number {
return household.liabilities.reduce(
(total, liability) => total + liability.balance,
0,
);
}

function liquidAssets(
household: HouseholdFinancialState,
): number {
return household.assets
.filter((asset) => asset.liquid)
.reduce((total, asset) => total + asset.value, 0);
}

function financialAssets(
household: HouseholdFinancialState,
): number {
const assets = household.assets
.filter((asset) => asset.liquid || asset.investable)
.reduce((total, asset) => total + asset.value, 0);

const superannuation = household.superannuation.reduce(
(total, account) => total + account.balance,
0,
);

return assets + superannuation;
}

function annualIncomeAtRisk(
household: HouseholdFinancialState,
personId: string,
): number {
return household.income
.filter((income) => income.personId === personId)
.reduce(
(total, income) => total + income.annualAmount,
0,
);
}

function hasFinancialDependants(
household: HouseholdFinancialState,
personId: string,
): boolean {
return household.people.some(
(person) =>
person.id !== personId &&
(person.isFinanciallyDependent === true ||
person.role === "dependant"),
);
}

function classifyProtection({
incomeAtRisk,
lifeCover,
liabilities,
availableFinancialAssets,
dependants,
}: {
incomeAtRisk: number;
lifeCover: number;
liabilities: number;
availableFinancialAssets: number;
dependants: boolean;
}): {
assessment: ProtectionAssessment;
reasons: string[];
} {
const reasons: string[] = [];

const resourcesAfterDebt =
availableFinancialAssets + lifeCover - liabilities;

/*
 * This is deliberately a broad planning classification.
 *
 * It does not calculate an "optimal" amount of insurance.
 * Detailed survivor resilience is evaluated separately
 * through explicit financial scenarios.
 */

if (
!dependants &&
incomeAtRisk === 0 &&
availableFinancialAssets >= liabilities
) {
reasons.push(
"The household does not appear financially dependent on this person's income.",
);

reasons.push(
"Available financial assets are sufficient to cover recorded liabilities.",
);

return {
assessment: "strong",
reasons,
};
}

if (resourcesAfterDebt >= 0 && lifeCover > 0) {
reasons.push(
"Recorded financial assets and life cover exceed recorded household liabilities.",
);

if (incomeAtRisk > 0) {
reasons.push(
"Income would still be lost, so longer-term survivor resilience should be tested separately.",
);
}

return {
assessment: "comfortable",
reasons,
};
}

if (availableFinancialAssets >= liabilities) {
reasons.push(
"Recorded financial assets are sufficient to cover household liabilities without relying on life insurance.",
);

if (incomeAtRisk > 0 || dependants) {
reasons.push(
"The household may still depend on future income, so protection needs are worth testing.",
);

return {
assessment: "worth_reviewing",
reasons,
};
}

return {
assessment: "comfortable",
reasons,
};
}

if (resourcesAfterDebt >= 0) {
reasons.push(
"Life insurance appears to close the immediate gap between financial assets and recorded liabilities.",
);

return {
assessment: "worth_reviewing",
reasons,
};
}

reasons.push(
"Recorded financial assets and life cover do not fully cover recorded household liabilities.",
);

if (incomeAtRisk > 0) {
reasons.push(
"The household would also lose income associated with this person.",
);
}

return {
assessment: "exposed",
reasons,
};
}

export function assessProtectionPosition(
household: HouseholdFinancialState,
personId: string,
): ProtectionPosition {
const person = household.people.find(
(candidate) => candidate.id === personId,
);

if (!person) {
throw new Error(
`Person "${personId}" does not exist in the household.`,
);
}

const covers = coversForPerson(household, personId);

const incomeAtRisk = annualIncomeAtRisk(household, personId);
const lifeCover = sumLifeCover(covers);
const incomeProtection = sumIncomeProtection(covers);
const liabilities = totalLiabilities(household);
const availableLiquidAssets = liquidAssets(household);
const availableFinancialAssets = financialAssets(household);
const dependants = hasFinancialDependants(
household,
personId,
);

const classification = classifyProtection({
incomeAtRisk,
lifeCover,
liabilities,
availableFinancialAssets,
dependants,
});

return {
personId,

annualIncomeAtRisk: incomeAtRisk,

lifeInsuranceCover: lifeCover,

incomeProtectionAnnualBenefit: incomeProtection,

totalHouseholdLiabilities: liabilities,

liquidAssets: availableLiquidAssets,

financialAssets: availableFinancialAssets,

hasFinancialDependants: dependants,

assessment: classification.assessment,

reasons: classification.reasons,
};
}

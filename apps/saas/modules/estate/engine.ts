import { UserFinancialProfile } from "@/types/financial";
import { UserGeneticProfile } from "@/types/genetics";

export interface EstatePlanInput {
	financial: UserFinancialProfile;
	genetics: UserGeneticProfile;
	retirementAge: number;
	includeInsurance: boolean;
	termInsuranceEndAge: number;
	sumInsured: number;
	baseAnnualPremium: number;
	premiumGrowthRate: number; // e.g. 0.05 = 5% per year
}

export interface EstatePlanResult {
	retirementAge: number;
	assumedDeathAge: number;
	estateWithoutInsurance: number;
	estateWithInsurance: number;
	totalPremiumsPaid: number;
	yearlyWealthPath: { age: number; wealth: number }[];
}

export function runEstatePlanModel(input: EstatePlanInput): EstatePlanResult {
	const {
		financial,
		genetics,
		retirementAge,
		includeInsurance,
		termInsuranceEndAge,
		sumInsured,
		baseAnnualPremium,
		premiumGrowthRate,
	} = input;

	const startAge = financial.age;
	const savingsRate = financial.savings_rate / 100;
	const income = financial.income;
	const initialWealth = financial.assets;

	// --- 1. Simple deterministic "death age" from longevity score ---
	// baseline 90, adjust +/- 5 years based on longevity_score (0–100)
	const longevityScore = genetics.longevity_score ?? 50;
	const longevityAdjustment = ((longevityScore - 50) / 50) * 5; // -5 to +5
	const assumedDeathAge = Math.round(90 + longevityAdjustment);

	// --- 2. Wealth projection year by year ---
	const yearlyWealthPath: { age: number; wealth: number }[] = [];
	let wealthNoInsurance = initialWealth;
	let wealthWithInsurance = initialWealth;
	let totalPremiumsPaid = 0;

	// simple deterministic growth assumptions
	const preRetirementReturn = 0.04; // 4% p.a.
	const postRetirementReturn = 0.03; // 3% p.a.
	const retirementSpendingRate = 0.04; // 4% of wealth per year

	for (let age = startAge; age <= assumedDeathAge; age++) {
		const isPreRetirement = age < retirementAge;

		// contributions / withdrawals
		if (isPreRetirement) {
			const annualSavings = income * savingsRate;
			wealthNoInsurance += annualSavings;
			wealthWithInsurance += annualSavings;
		} else {
			const spendingNoIns = wealthNoInsurance * retirementSpendingRate;
			const spendingWithIns = wealthWithInsurance * retirementSpendingRate;
			wealthNoInsurance -= spendingNoIns;
			wealthWithInsurance -= spendingWithIns;
		}

		// investment growth
		const r = isPreRetirement ? preRetirementReturn : postRetirementReturn;
		wealthNoInsurance *= 1 + r;
		wealthWithInsurance *= 1 + r;

		// insurance premiums (if included and before term end)
		if (includeInsurance && age < termInsuranceEndAge) {
			const yearsSinceStart = age - startAge;
			const premiumThisYear =
				baseAnnualPremium * Math.pow(1 + premiumGrowthRate, yearsSinceStart);

			wealthWithInsurance -= premiumThisYear;
			totalPremiumsPaid += premiumThisYear;
		}

		yearlyWealthPath.push({
			age,
			wealth: wealthWithInsurance,
		});
	}

	// --- 3. Estate at death ---
	const estateWithoutInsurance = Math.max(0, wealthNoInsurance);
	const estateWithInsurance =
		Math.max(0, wealthWithInsurance) +
		(includeInsurance && assumedDeathAge <= termInsuranceEndAge ? sumInsured : 0);

	return {
		assumedDeathAge,
		estateWithInsurance,
		estateWithoutInsurance,
		totalPremiumsPaid,
		wealthPath: yearlyWealthPath ?? [],
	};
}

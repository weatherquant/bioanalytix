import type { HouseholdFinancialState, Person } from "./types";

export type FinancialValidationSeverity = "error" | "warning";

export interface FinancialValidationIssue {
	severity: FinancialValidationSeverity;

	code: string;

	path: string;

	message: string;
}

export interface HouseholdValidationResult {
	valid: boolean;

	errors: FinancialValidationIssue[];

	warnings: FinancialValidationIssue[];

	issues: FinancialValidationIssue[];
}

function error(code: string, path: string, message: string): FinancialValidationIssue {
	return {
		severity: "error",
		code,
		path,
		message,
	};
}

function warning(code: string, path: string, message: string): FinancialValidationIssue {
	return {
		severity: "warning",
		code,
		path,
		message,
	};
}

function isFiniteNumber(value: number): boolean {
	return Number.isFinite(value);
}

function isNonNegativeFiniteNumber(value: number): boolean {
	return isFiniteNumber(value) && value >= 0;
}

function isValidIsoDate(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	const parsed = new Date(`${value}T00:00:00Z`);

	if (Number.isNaN(parsed.getTime())) {
		return false;
	}

	return parsed.toISOString().slice(0, 10) === value;
}

export function calculateAgeOnDate(dateOfBirth: string, asOfDate: string): number | undefined {
	if (!isValidIsoDate(dateOfBirth) || !isValidIsoDate(asOfDate)) {
		return undefined;
	}

	const birthDate = new Date(`${dateOfBirth}T00:00:00Z`);

	const referenceDate = new Date(`${asOfDate}T00:00:00Z`);

	if (birthDate.getTime() > referenceDate.getTime()) {
		return undefined;
	}

	let age = referenceDate.getUTCFullYear() - birthDate.getUTCFullYear();

	const birthdayHasOccurred =
		referenceDate.getUTCMonth() > birthDate.getUTCMonth() ||
		(referenceDate.getUTCMonth() === birthDate.getUTCMonth() &&
			referenceDate.getUTCDate() >= birthDate.getUTCDate());

	if (!birthdayHasOccurred) {
		age -= 1;
	}

	return age;
}

function validateUniqueIds(
	items: readonly {
		id: string;
	}[],
	path: string,
	issues: FinancialValidationIssue[],
): void {
	const seen = new Set<string>();

	items.forEach((item, index) => {
		const itemPath = `${path}[${index}].id`;

		if (item.id.trim().length === 0) {
			issues.push(error("missing_id", itemPath, "An identifier is required."));

			return;
		}

		if (seen.has(item.id)) {
			issues.push(error("duplicate_id", itemPath, `Duplicate identifier "${item.id}".`));

			return;
		}

		seen.add(item.id);
	});
}

function validatePerson(
	person: Person,
	index: number,
	asOfDate: string,
	issues: FinancialValidationIssue[],
): void {
	const path = `people[${index}]`;

	const age = calculateAgeOnDate(person.dateOfBirth, asOfDate);

	if (!isValidIsoDate(person.dateOfBirth)) {
		issues.push(
			error(
				"invalid_date_of_birth",
				`${path}.dateOfBirth`,
				"Date of birth must be a valid ISO date in YYYY-MM-DD format.",
			),
		);

		return;
	}

	if (age === undefined) {
		issues.push(
			error(
				"future_date_of_birth",
				`${path}.dateOfBirth`,
				"Date of birth cannot be after the household as-of date.",
			),
		);

		return;
	}

	if (age > 120) {
		issues.push(
			warning(
				"unusual_age",
				`${path}.dateOfBirth`,
				"The calculated age is unusually high and should be reviewed.",
			),
		);
	}

	if (person.expectedRetirementAge !== undefined) {
		const retirementAge = person.expectedRetirementAge;

		if (!Number.isInteger(retirementAge) || retirementAge < 18 || retirementAge > 100) {
			issues.push(
				error(
					"invalid_retirement_age",
					`${path}.expectedRetirementAge`,
					"Expected retirement age must be an integer between 18 and 100.",
				),
			);
		} else if (person.employmentStatus !== "retired" && retirementAge < age) {
			issues.push(
				warning(
					"retirement_age_before_current_age",
					`${path}.expectedRetirementAge`,
					"Expected retirement age is earlier than the person's current age.",
				),
			);
		}
	}
}

export function validateHouseholdFinancialState(
	household: HouseholdFinancialState,
): HouseholdValidationResult {
	const issues: FinancialValidationIssue[] = [];

	if (household.id.trim().length === 0) {
		issues.push(error("missing_household_id", "id", "Household identifier is required."));
	}

	if (!isValidIsoDate(household.asOfDate)) {
		issues.push(
			error(
				"invalid_as_of_date",
				"asOfDate",
				"Household as-of date must be a valid ISO date in YYYY-MM-DD format.",
			),
		);
	}

	if (household.currency.trim().length !== 3) {
		issues.push(
			error(
				"invalid_currency",
				"currency",
				"Currency must use a three-character currency code.",
			),
		);
	}

	if (household.people.length === 0) {
		issues.push(
			error(
				"missing_people",
				"people",
				"A valid household must contain at least one person.",
			),
		);
	}

	validateUniqueIds(household.people, "people", issues);

	validateUniqueIds(household.income, "income", issues);

	validateUniqueIds(household.assets, "assets", issues);

	validateUniqueIds(household.superannuation, "superannuation", issues);

	validateUniqueIds(household.liabilities, "liabilities", issues);

	validateUniqueIds(household.insurance, "insurance", issues);

	validateUniqueIds(household.goals, "goals", issues);

	household.people.forEach((person, index) => {
		validatePerson(person, index, household.asOfDate, issues);
	});

	const personIds = new Set(household.people.map((person) => person.id));

	household.income.forEach((source, index) => {
		const path = `income[${index}]`;

		if (!isNonNegativeFiniteNumber(source.annualAmount)) {
			issues.push(
				error(
					"invalid_income_amount",
					`${path}.annualAmount`,
					"Annual income must be a finite non-negative amount.",
				),
			);
		}

		if (source.personId !== undefined && !personIds.has(source.personId)) {
			issues.push(
				error(
					"unknown_person_reference",
					`${path}.personId`,
					`Income source references unknown person "${source.personId}".`,
				),
			);
		}

		if (
			source.startAge !== undefined &&
			(!Number.isInteger(source.startAge) || source.startAge < 0 || source.startAge > 120)
		) {
			issues.push(
				error(
					"invalid_income_start_age",
					`${path}.startAge`,
					"Income start age must be an integer between 0 and 120.",
				),
			);
		}

		if (
			source.endAge !== undefined &&
			(!Number.isInteger(source.endAge) || source.endAge < 0 || source.endAge > 120)
		) {
			issues.push(
				error(
					"invalid_income_end_age",
					`${path}.endAge`,
					"Income end age must be an integer between 0 and 120.",
				),
			);
		}

		if (
			source.startAge !== undefined &&
			source.endAge !== undefined &&
			source.endAge < source.startAge
		) {
			issues.push(
				error(
					"income_age_range_reversed",
					path,
					"Income end age cannot be earlier than income start age.",
				),
			);
		}
	});

	const expenseEntries = [
		["essentialAnnual", household.expenses.essentialAnnual],
		["discretionaryAnnual", household.expenses.discretionaryAnnual],
		["oneOffAnnual", household.expenses.oneOffAnnual],
	] as const;

	expenseEntries.forEach(([field, value]) => {
		if (value !== undefined && !isNonNegativeFiniteNumber(value)) {
			issues.push(
				error(
					"invalid_expense_amount",
					`expenses.${field}`,
					"Expense amounts must be finite and non-negative.",
				),
			);
		}
	});

	household.assets.forEach((asset, index) => {
		const path = `assets[${index}]`;

		if (!isNonNegativeFiniteNumber(asset.value)) {
			issues.push(
				error(
					"invalid_asset_value",
					`${path}.value`,
					"Asset value must be finite and non-negative.",
				),
			);
		}

		asset.ownerPersonIds?.forEach((personId) => {
			if (!personIds.has(personId)) {
				issues.push(
					error(
						"unknown_person_reference",
						`${path}.ownerPersonIds`,
						`Asset references unknown person "${personId}".`,
					),
				);
			}
		});
	});

	household.superannuation.forEach((account, index) => {
		const path = `superannuation[${index}]`;

		if (!personIds.has(account.personId)) {
			issues.push(
				error(
					"unknown_person_reference",
					`${path}.personId`,
					`Superannuation account references unknown person "${account.personId}".`,
				),
			);
		}

		if (!isNonNegativeFiniteNumber(account.balance)) {
			issues.push(
				error(
					"invalid_super_balance",
					`${path}.balance`,
					"Superannuation balance must be finite and non-negative.",
				),
			);
		}

		if (
			account.annualContribution !== undefined &&
			!isNonNegativeFiniteNumber(account.annualContribution)
		) {
			issues.push(
				error(
					"invalid_super_contribution",
					`${path}.annualContribution`,
					"Annual superannuation contribution must be finite and non-negative.",
				),
			);
		}
	});

	household.liabilities.forEach((liability, index) => {
		const path = `liabilities[${index}]`;

		if (!isNonNegativeFiniteNumber(liability.balance)) {
			issues.push(
				error(
					"invalid_liability_balance",
					`${path}.balance`,
					"Liability balance must be finite and non-negative.",
				),
			);
		}

		if (
			liability.annualInterestRate !== undefined &&
			(!isFiniteNumber(liability.annualInterestRate) || liability.annualInterestRate < 0)
		) {
			issues.push(
				error(
					"invalid_interest_rate",
					`${path}.annualInterestRate`,
					"Liability interest rate must be finite and non-negative.",
				),
			);
		}

		if (
			liability.annualRepayment !== undefined &&
			!isNonNegativeFiniteNumber(liability.annualRepayment)
		) {
			issues.push(
				error(
					"invalid_repayment",
					`${path}.annualRepayment`,
					"Annual liability repayment must be finite and non-negative.",
				),
			);
		}

		liability.ownerPersonIds?.forEach((personId) => {
			if (!personIds.has(personId)) {
				issues.push(
					error(
						"unknown_person_reference",
						`${path}.ownerPersonIds`,
						`Liability references unknown person "${personId}".`,
					),
				);
			}
		});
	});

	household.insurance.forEach((cover, index) => {
		const path = `insurance[${index}]`;

		if (!personIds.has(cover.personId)) {
			issues.push(
				error(
					"unknown_person_reference",
					`${path}.personId`,
					`Insurance cover references unknown person "${cover.personId}".`,
				),
			);
		}

		if (!isNonNegativeFiniteNumber(cover.annualPremium)) {
			issues.push(
				error(
					"invalid_insurance_premium",
					`${path}.annualPremium`,
					"Insurance premium must be finite and non-negative.",
				),
			);
		}

		if (cover.sumInsured !== undefined && !isNonNegativeFiniteNumber(cover.sumInsured)) {
			issues.push(
				error(
					"invalid_sum_insured",
					`${path}.sumInsured`,
					"Sum insured must be finite and non-negative.",
				),
			);
		}

		if (cover.annualBenefit !== undefined && !isNonNegativeFiniteNumber(cover.annualBenefit)) {
			issues.push(
				error(
					"invalid_annual_benefit",
					`${path}.annualBenefit`,
					"Annual insurance benefit must be finite and non-negative.",
				),
			);
		}
	});

	household.goals.forEach((goal, index) => {
		const path = `goals[${index}]`;

		if (goal.targetAmount !== undefined && !isNonNegativeFiniteNumber(goal.targetAmount)) {
			issues.push(
				error(
					"invalid_goal_amount",
					`${path}.targetAmount`,
					"Goal target amount must be finite and non-negative.",
				),
			);
		}

		if (
			goal.targetAge !== undefined &&
			(!Number.isInteger(goal.targetAge) || goal.targetAge < 0 || goal.targetAge > 120)
		) {
			issues.push(
				error(
					"invalid_goal_age",
					`${path}.targetAge`,
					"Goal target age must be an integer between 0 and 120.",
				),
			);
		}
	});

	const assumptionRates = [
		["inflationRate", household.assumptions.inflationRate],
		["wageGrowthRate", household.assumptions.wageGrowthRate],
		["investmentReturnRate", household.assumptions.investmentReturnRate],
		["cashReturnRate", household.assumptions.cashReturnRate],
		["superReturnRate", household.assumptions.superReturnRate],
	] as const;

	assumptionRates.forEach(([field, value]) => {
		if (!isFiniteNumber(value) || value <= -1 || value > 1) {
			issues.push(
				error(
					"invalid_projection_rate",
					`assumptions.${field}`,
					"Projection rates must be finite decimal rates greater than -100% and no greater than 100%.",
				),
			);
		}
	});

	if (
		!Number.isInteger(household.assumptions.projectionEndAge) ||
		household.assumptions.projectionEndAge < 1 ||
		household.assumptions.projectionEndAge > 130
	) {
		issues.push(
			error(
				"invalid_projection_end_age",
				"assumptions.projectionEndAge",
				"Projection end age must be an integer between 1 and 130.",
			),
		);
	}

	const currentAges = household.people
		.map((person) => calculateAgeOnDate(person.dateOfBirth, household.asOfDate))
		.filter((age): age is number => age !== undefined);

	if (currentAges.length > 0) {
		const oldestCurrentAge = Math.max(...currentAges);

		if (household.assumptions.projectionEndAge <= oldestCurrentAge) {
			issues.push(
				error(
					"projection_horizon_not_future",
					"assumptions.projectionEndAge",
					"Projection end age must extend beyond the current age of every household member.",
				),
			);
		}
	}

	const errors = issues.filter((issue) => issue.severity === "error");

	const warnings = issues.filter((issue) => issue.severity === "warning");

	return {
		valid: errors.length === 0,

		errors,

		warnings,

		issues,
	};
}

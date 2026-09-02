import type {
	Asset,
	FinancialGoal,
	HouseholdFinancialState,
	InsuranceCover,
	Liability,
	Person,
	SuperAccount,
} from "./types";

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

function issue(
	severity: FinancialValidationSeverity,
	code: string,
	path: string,
	message: string,
): FinancialValidationIssue {
	return {
		severity,
		code,
		path,
		message,
	};
}

function error(code: string, path: string, message: string): FinancialValidationIssue {
	return issue("error", code, path, message);
}

function warning(code: string, path: string, message: string): FinancialValidationIssue {
	return issue("warning", code, path, message);
}

function isNonEmptyString(value: string): boolean {
	return value.trim().length > 0;
}

export function isValidIsoDate(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	const parsed = new Date(`${value}T00:00:00Z`);

	return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function calculateAgeOnDate(dateOfBirth: string, onDate: string): number | undefined {
	if (!isValidIsoDate(dateOfBirth) || !isValidIsoDate(onDate)) {
		return undefined;
	}

	const [birthYear, birthMonth, birthDay] = dateOfBirth.split("-").map(Number);

	const [currentYear, currentMonth, currentDay] = onDate.split("-").map(Number);

	if (
		birthYear === undefined ||
		birthMonth === undefined ||
		birthDay === undefined ||
		currentYear === undefined ||
		currentMonth === undefined ||
		currentDay === undefined
	) {
		return undefined;
	}

	let age = currentYear - birthYear;

	if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
		age -= 1;
	}

	return age;
}

function validateNonNegativeFinite(
	value: number | undefined,
	path: string,
	code: string,
	label: string,
): FinancialValidationIssue[] {
	if (value === undefined) {
		return [];
	}

	if (!Number.isFinite(value)) {
		return [error(code, path, `${label} must be a finite number.`)];
	}

	if (value < 0) {
		return [error(code, path, `${label} must not be negative.`)];
	}

	return [];
}

function validateAgeField(
	value: number | undefined,
	path: string,
	label: string,
): FinancialValidationIssue[] {
	if (value === undefined) {
		return [];
	}

	if (!Number.isInteger(value) || value < 0 || value > 120) {
		return [error("invalid_age", path, `${label} must be an integer between 0 and 120.`)];
	}

	return [];
}

function validateUniqueIds<
	T extends {
		id: string;
	},
>(items: readonly T[], path: string): FinancialValidationIssue[] {
	const issues: FinancialValidationIssue[] = [];

	const seen = new Set<string>();

	items.forEach((item, index) => {
		if (!isNonEmptyString(item.id)) {
			issues.push(
				error("missing_id", `${path}[${index}].id`, "Identifier must not be empty."),
			);

			return;
		}

		if (seen.has(item.id)) {
			issues.push(
				error("duplicate_id", `${path}[${index}].id`, `Duplicate identifier "${item.id}".`),
			);
		}

		seen.add(item.id);
	});

	return issues;
}

function validateOwnerReferences(
	item: Asset | Liability,
	path: string,
	personIds: ReadonlySet<string>,
): FinancialValidationIssue[] {
	const issues: FinancialValidationIssue[] = [];

	if (item.ownerPersonIds === undefined) {
		return issues;
	}

	const seenOwners = new Set<string>();

	item.ownerPersonIds.forEach((personId, index) => {
		if (seenOwners.has(personId)) {
			issues.push(
				error(
					"duplicate_person_reference",
					`${path}.ownerPersonIds[${index}]`,
					`Person "${personId}" is listed more than once.`,
				),
			);
		}

		seenOwners.add(personId);

		if (!personIds.has(personId)) {
			issues.push(
				error(
					"unknown_person_reference",
					`${path}.ownerPersonIds[${index}]`,
					`Person "${personId}" does not exist in the household.`,
				),
			);
		}
	});

	return issues;
}

function validatePerson(
	person: Person,
	index: number,
	asOfDate: string,
): FinancialValidationIssue[] {
	const issues: FinancialValidationIssue[] = [];

	const path = `people[${index}]`;

	if (!isValidIsoDate(person.dateOfBirth)) {
		issues.push(
			error(
				"invalid_date_of_birth",
				`${path}.dateOfBirth`,
				"Date of birth must be a valid ISO date in YYYY-MM-DD format.",
			),
		);

		return issues;
	}

	if (isValidIsoDate(asOfDate) && person.dateOfBirth > asOfDate) {
		issues.push(
			error(
				"future_date_of_birth",
				`${path}.dateOfBirth`,
				"Date of birth cannot be after the household as-of date.",
			),
		);

		return issues;
	}

	const age = calculateAgeOnDate(person.dateOfBirth, asOfDate);

	if (age !== undefined && age > 110) {
		issues.push(
			warning(
				"unusually_high_age",
				`${path}.dateOfBirth`,
				"Calculated age is unusually high and should be reviewed.",
			),
		);
	}

	return issues;
}

function validateSuperAccount(
	account: SuperAccount,
	index: number,
	personIds: ReadonlySet<string>,
): FinancialValidationIssue[] {
	const path = `superannuation[${index}]`;

	const issues: FinancialValidationIssue[] = [
		...validateNonNegativeFinite(
			account.balance,
			`${path}.balance`,
			"invalid_super_balance",
			"Superannuation balance",
		),

		...validateNonNegativeFinite(
			account.annualContribution,
			`${path}.annualContribution`,
			"invalid_super_contribution",
			"Annual superannuation contribution",
		),
	];

	if (!personIds.has(account.personId)) {
		issues.push(
			error(
				"unknown_person_reference",
				`${path}.personId`,
				`Person "${account.personId}" does not exist in the household.`,
			),
		);
	}

	return issues;
}

function validateLiability(
	liability: Liability,
	index: number,
	personIds: ReadonlySet<string>,
): FinancialValidationIssue[] {
	const path = `liabilities[${index}]`;

	const issues: FinancialValidationIssue[] = [
		...validateNonNegativeFinite(
			liability.balance,
			`${path}.balance`,
			"invalid_liability_balance",
			"Liability balance",
		),

		...validateNonNegativeFinite(
			liability.annualInterestRate,
			`${path}.annualInterestRate`,
			"invalid_interest_rate",
			"Annual interest rate",
		),

		...validateNonNegativeFinite(
			liability.annualRepayment,
			`${path}.annualRepayment`,
			"invalid_liability_repayment",
			"Annual repayment",
		),

		...validateOwnerReferences(liability, path, personIds),
	];

	if (
		liability.annualInterestRate !== undefined &&
		Number.isFinite(liability.annualInterestRate) &&
		liability.annualInterestRate > 1
	) {
		issues.push(
			warning(
				"unusually_high_interest_rate",
				`${path}.annualInterestRate`,
				"Annual interest rate exceeds 100% and should be reviewed.",
			),
		);
	}

	return issues;
}

function validateInsuranceCover(
	cover: InsuranceCover,
	index: number,
	personIds: ReadonlySet<string>,
): FinancialValidationIssue[] {
	const path = `insurance[${index}]`;

	const issues: FinancialValidationIssue[] = [
		...validateNonNegativeFinite(
			cover.sumInsured,
			`${path}.sumInsured`,
			"invalid_sum_insured",
			"Sum insured",
		),

		...validateNonNegativeFinite(
			cover.annualBenefit,
			`${path}.annualBenefit`,
			"invalid_annual_benefit",
			"Annual benefit",
		),

		...validateNonNegativeFinite(
			cover.annualPremium,
			`${path}.annualPremium`,
			"invalid_insurance_premium",
			"Annual premium",
		),

		...validateAgeField(cover.endAge, `${path}.endAge`, "Insurance end age"),
	];

	if (!personIds.has(cover.personId)) {
		issues.push(
			error(
				"unknown_person_reference",
				`${path}.personId`,
				`Person "${cover.personId}" does not exist in the household.`,
			),
		);
	}

	return issues;
}

function validateGoal(
	goal: FinancialGoal,
	index: number,
	personIds: ReadonlySet<string>,
): FinancialValidationIssue[] {
	const path = `goals[${index}]`;

	const issues: FinancialValidationIssue[] = [
		...validateNonNegativeFinite(
			goal.targetAmount,
			`${path}.targetAmount`,
			"invalid_goal_target_amount",
			"Goal target amount",
		),

		...validateAgeField(goal.targetAge, `${path}.targetAge`, "Goal target age"),
	];

	if (goal.personId !== undefined && !personIds.has(goal.personId)) {
		issues.push(
			error(
				"unknown_person_reference",
				`${path}.personId`,
				`Person "${goal.personId}" does not exist in the household.`,
			),
		);
	}

	return issues;
}

export function validateHouseholdFinancialState(
	household: HouseholdFinancialState,
): HouseholdValidationResult {
	const issues: FinancialValidationIssue[] = [];

	if (!isNonEmptyString(household.id)) {
		issues.push(error("missing_household_id", "id", "Household identifier must not be empty."));
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

	if (!/^[A-Z]{3}$/.test(household.currency)) {
		issues.push(
			error(
				"invalid_currency",
				"currency",
				"Currency must be a three-letter uppercase code.",
			),
		);
	}

	if (household.people.length === 0) {
		issues.push(
			error("missing_people", "people", "Household must contain at least one person."),
		);
	}

	const primaryCount = household.people.filter((person) => person.role === "primary").length;

	if (primaryCount !== 1) {
		issues.push(
			error(
				"invalid_primary_count",
				"people",
				`Household must contain exactly one primary person; found ${primaryCount}.`,
			),
		);
	}

	issues.push(
		...validateUniqueIds(household.people, "people"),

		...validateUniqueIds(household.income, "income"),

		...validateUniqueIds(household.assets, "assets"),

		...validateUniqueIds(household.superannuation, "superannuation"),

		...validateUniqueIds(household.liabilities, "liabilities"),

		...validateUniqueIds(household.insurance, "insurance"),

		...validateUniqueIds(household.goals, "goals"),
	);

	const personIds = new Set(household.people.map((person) => person.id));

	household.people.forEach((person, index) => {
		issues.push(...validatePerson(person, index, household.asOfDate));
	});

	household.income.forEach((source, index) => {
		const path = `income[${index}]`;

		issues.push(
			...validateNonNegativeFinite(
				source.annualAmount,
				`${path}.annualAmount`,
				"invalid_income_amount",
				"Annual income",
			),
		);

		if (source.type === "employment" && source.personId === undefined) {
			issues.push(
				error(
					"employment_income_requires_person",
					`${path}.personId`,
					"Employment income must reference a household person.",
				),
			);
		}

		if (source.personId !== undefined && !personIds.has(source.personId)) {
			issues.push(
				error(
					"unknown_person_reference",
					`${path}.personId`,
					`Person "${source.personId}" does not exist in the household.`,
				),
			);
		}
	});

	issues.push(
		...validateNonNegativeFinite(
			household.expenses.essentialAnnual,
			"expenses.essentialAnnual",
			"invalid_essential_expenses",
			"Essential annual expenses",
		),

		...validateNonNegativeFinite(
			household.expenses.discretionaryAnnual,
			"expenses.discretionaryAnnual",
			"invalid_discretionary_expenses",
			"Discretionary annual expenses",
		),

		...validateNonNegativeFinite(
			household.expenses.oneOffAnnual,
			"expenses.oneOffAnnual",
			"invalid_one_off_expenses",
			"One-off annual expenses",
		),
	);

	household.assets.forEach((asset, index) => {
		issues.push(
			...validateNonNegativeFinite(
				asset.value,
				`assets[${index}].value`,
				"invalid_asset_value",
				"Asset value",
			),

			...validateOwnerReferences(asset, `assets[${index}]`, personIds),
		);
	});

	household.superannuation.forEach((account, index) => {
		issues.push(...validateSuperAccount(account, index, personIds));
	});

	household.liabilities.forEach((liability, index) => {
		issues.push(...validateLiability(liability, index, personIds));
	});

	household.insurance.forEach((cover, index) => {
		issues.push(...validateInsuranceCover(cover, index, personIds));
	});

	household.goals.forEach((goal, index) => {
		issues.push(...validateGoal(goal, index, personIds));
	});

	const errors = issues.filter((item) => item.severity === "error");

	const warnings = issues.filter((item) => item.severity === "warning");

	return {
		valid: errors.length === 0,

		errors,

		warnings,

		issues,
	};
}

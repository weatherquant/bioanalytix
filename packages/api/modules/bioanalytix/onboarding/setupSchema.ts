import { z } from "zod";

export const bioanalytixSetupSchema = z.object({
	dateOfBirth: z.string().min(1),

	country: z.string().min(2),

	currency: z
		.string()
		.length(3)
		.transform((value) => value.toUpperCase()),

	employmentStatus: z.enum([
		"employed",
		"self_employed",
		"not_employed",
		"retired",
		"student",
		"other",
	]),

	hasPartner: z.boolean(),

	hasDependants: z.boolean(),

	annualHouseholdIncome: z.number().finite().nonnegative(),

	cashAndSavings: z.number().finite().nonnegative(),

	investments: z.number().finite().nonnegative(),

	propertyAndOtherAssets: z.number().finite().nonnegative(),

	retirementSavings: z.number().finite().nonnegative(),

	totalDebt: z.number().finite().nonnegative(),

	annualHouseholdSpending: z.number().finite().nonnegative(),

	lifeInsuranceCover: z.number().finite().nonnegative(),

	incomeProtectionAnnualBenefit: z.number().finite().nonnegative(),

	desiredInheritance: z.number().finite().nonnegative().optional(),

	expectedRetirementAge: z.number().int().min(40).max(100),
});

export type BioanalytixSetupInput = z.infer<typeof bioanalytixSetupSchema>;

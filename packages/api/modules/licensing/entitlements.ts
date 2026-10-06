export const BIOANALYTIX_ENTITLEMENTS = [
	"profile.dna",
	"profile.associations",
	"profile.evidence",

	"scenario.genetic",
	"scenario.longevity",

	"simulation.wealth",
	"simulation.protection",
	"simulation.estate",

	"household.partner",

	"professional.multi_household",

	"enterprise.api",
] as const;

export type BioanalytixEntitlement = (typeof BIOANALYTIX_ENTITLEMENTS)[number];

export const CONSUMER_TRIAL_ENTITLEMENTS: BioanalytixEntitlement[] = [
	"profile.dna",
	"profile.associations",
	"scenario.longevity",
	"simulation.wealth",
];

export const CONSUMER_PLUS_ENTITLEMENTS: BioanalytixEntitlement[] = [
	"profile.dna",
	"profile.associations",
	"profile.evidence",

	"scenario.genetic",
	"scenario.longevity",

	"simulation.wealth",
	"simulation.protection",
	"simulation.estate",

	"household.partner",
];

export function hasEntitlement(
	entitlements: readonly string[],
	required: BioanalytixEntitlement,
): boolean {
	return entitlements.includes(required);
}

export function hasAllEntitlements(
	entitlements: readonly string[],
	required: readonly BioanalytixEntitlement[],
): boolean {
	return required.every((entitlement) => hasEntitlement(entitlements, entitlement));
}

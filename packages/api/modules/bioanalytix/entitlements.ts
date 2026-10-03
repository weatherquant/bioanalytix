export type BioanalytixTier = "free" | "individual" | "professional";

export type BioanalytixCapability =
	| "financialPlanning"
	| "wealthPlanning"
	| "longevityPlanning"
	| "estatePlanning"
	| "askBioanalytix"
	| "dnaUpload"
	| "geneticProfile"
	| "personalisedResearch"
	| "clientManagement"
	| "organizationWorkspace";

export interface BioanalytixEntitlements {
	tier: BioanalytixTier;
	capabilities: Readonly<Record<BioanalytixCapability, boolean>>;
}

const FREE_CAPABILITIES: Readonly<Record<BioanalytixCapability, boolean>> = {
	financialPlanning: true,
	wealthPlanning: true,
	longevityPlanning: true,
	estatePlanning: true,
	askBioanalytix: true,
	dnaUpload: false,
	geneticProfile: false,
	personalisedResearch: false,
	clientManagement: false,
	organizationWorkspace: false,
};

const INDIVIDUAL_CAPABILITIES: Readonly<Record<BioanalytixCapability, boolean>> = {
	...FREE_CAPABILITIES,
	dnaUpload: true,
	geneticProfile: true,
	personalisedResearch: true,
};

const PROFESSIONAL_CAPABILITIES: Readonly<Record<BioanalytixCapability, boolean>> = {
	...INDIVIDUAL_CAPABILITIES,
	clientManagement: true,
	organizationWorkspace: true,
};

const CAPABILITIES_BY_TIER: Readonly<
	Record<BioanalytixTier, Readonly<Record<BioanalytixCapability, boolean>>>
> = {
	free: FREE_CAPABILITIES,
	individual: INDIVIDUAL_CAPABILITIES,
	professional: PROFESSIONAL_CAPABILITIES,
};

export function getBioanalytixEntitlements(tier: BioanalytixTier): BioanalytixEntitlements {
	return {
		tier,
		capabilities: CAPABILITIES_BY_TIER[tier],
	};
}

export function hasBioanalytixCapability(
	entitlements: BioanalytixEntitlements,
	capability: BioanalytixCapability,
): boolean {
	return entitlements.capabilities[capability];
}

/**
 * Translates the current billing plan identifier into Bioanalytix product
 * semantics.
 *
 * Billing identifiers are deliberately kept separate from Bioanalytix tier
 * names so the commercial provider/configuration can evolve independently of
 * product entitlements.
 *
 * Unknown, legacy, or unsupported billing plans fail closed to the free tier.
 */

function getDevelopmentTierOverride(): BioanalytixTier | null {
	if (process.env.NODE_ENV === "production") {
		return null;
	}

	const tier = process.env.BIOANALYTIX_DEV_TIER;

	switch (tier) {
		case "free":
		case "individual":
		case "professional":
			return tier;

		default:
			return null;
	}
}

export function resolveBioanalytixTierFromPlanId(
	planId: string | null | undefined,
): BioanalytixTier {
	const developmentTierOverride = getDevelopmentTierOverride();

	if (developmentTierOverride) {
		return developmentTierOverride;
	}

	switch (planId) {
		case "pro":
			return "individual";

		default:
			return "free";
	}
}

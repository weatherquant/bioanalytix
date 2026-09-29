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

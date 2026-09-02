import type {
	AgePensionHomeownershipStatus,
	AgePensionPolicyPeriod,
	AgePensionRelationshipStatus,
} from "./types";

/**
 * Australian Age Pension policy snapshot used by
 * Bioanalytix.
 *
 * Effective modelling period:
 * 1 July 2026 to 19 September 2026.
 *
 * The standard Age Pension maximum rates in this snapshot
 * are the rates published by Services Australia before
 * the scheduled 20 September 2026 indexation.
 *
 * Asset thresholds, income thresholds and deeming settings
 * reflect the current published settings applicable during
 * this period.
 *
 * This policy snapshot MUST NOT be silently reused after
 * its effectiveTo date.
 */
export const AUSTRALIAN_AGE_PENSION_POLICY_2026_07: AgePensionPolicyPeriod = {
	id: "AU_AGE_PENSION_2026-07-01_TO_2026-09-19",

	effectiveFrom: "2026-07-01",

	effectiveTo: "2026-09-19",

	sourceJurisdiction: "Australia",

	agePensionAge: 67,
};

/**
 * Standard Age Pension maximum TOTAL rates per fortnight.
 *
 * These include:
 * - maximum basic rate
 * - maximum Pension Supplement
 * - Energy Supplement
 *
 * Single:
 * $1,200.90 per fortnight.
 *
 * Couple:
 * $905.20 each per fortnight.
 */
export const AGE_PENSION_MAXIMUM_RATE = {
	singleFortnightly: 1200.9,

	coupleEachFortnightly: 905.2,

	coupleCombinedFortnightly: 1810.4,
} as const;

/**
 * Standard pension income test.
 *
 * Single:
 * - $226 per fortnight income free area
 * - pension reduces by $0.50 for every $1 above it.
 *
 * Couple:
 * - $396 combined per fortnight income free area
 * - each eligible person's pension reduces by $0.25
 *   for every $1 of combined income above it.
 *
 * Therefore, where both members of a couple are eligible,
 * the combined pension reduction is $0.50 per excess $1.
 */
export const AGE_PENSION_INCOME_TEST = {
	singleFreeAreaFortnightly: 226,

	coupleFreeAreaFortnightly: 396,

	singleTaper: 0.5,

	coupleEachTaper: 0.25,

	singleCutoffFortnightly: 2627.8,

	coupleCombinedCutoffFortnightly: 4016.8,
} as const;

/**
 * Standard pension assets test.
 *
 * Assets above the relevant free area reduce pension by
 * $3 per fortnight for every $1,000 of excess assets for
 * a single pension rate / couple combined entitlement.
 *
 * For a couple where only one member is eligible, that
 * person's individual pension reduces by $1.50 per
 * fortnight per $1,000 of excess combined assets.
 */
export const AGE_PENSION_ASSETS_TEST = {
	taperPerThousandSingle: 3,

	taperPerThousandCoupleEach: 1.5,

	fullPensionThresholds: {
		single: {
			homeowner: 333000,

			non_homeowner: 600000,
		},

		couple: {
			homeowner: 499000,

			non_homeowner: 766000,
		},
	},

	partPensionCutoffs: {
		single: {
			homeowner: 733500,

			non_homeowner: 1000500,
		},

		couple: {
			homeowner: 1102500,

			non_homeowner: 1369500,
		},
	},
} as const;

/**
 * Current deeming settings.
 *
 * Single:
 * first $66,800 at 1.25%, balance above at 3.25%.
 *
 * Couple where at least one member receives a pension:
 * first $110,600 combined at 1.25%, balance above at 3.25%.
 */
export const AGE_PENSION_DEEMING = {
	singleThreshold: 66800,

	coupleThreshold: 110600,

	lowerRate: 0.0125,

	upperRate: 0.0325,
} as const;

export function maximumFortnightlyRate(
	relationshipStatus: AgePensionRelationshipStatus,
	eligibleRecipients: 1 | 2,
): number {
	if (relationshipStatus === "single") {
		return AGE_PENSION_MAXIMUM_RATE.singleFortnightly;
	}

	return AGE_PENSION_MAXIMUM_RATE.coupleEachFortnightly * eligibleRecipients;
}

export function incomeFreeArea(relationshipStatus: AgePensionRelationshipStatus): number {
	return relationshipStatus === "single"
		? AGE_PENSION_INCOME_TEST.singleFreeAreaFortnightly
		: AGE_PENSION_INCOME_TEST.coupleFreeAreaFortnightly;
}

export function incomeTaper(
	relationshipStatus: AgePensionRelationshipStatus,
	eligibleRecipients: 1 | 2,
): number {
	if (relationshipStatus === "single") {
		return AGE_PENSION_INCOME_TEST.singleTaper;
	}

	return AGE_PENSION_INCOME_TEST.coupleEachTaper * eligibleRecipients;
}

export function assetsFreeArea(
	relationshipStatus: AgePensionRelationshipStatus,
	homeownershipStatus: AgePensionHomeownershipStatus,
): number {
	return AGE_PENSION_ASSETS_TEST.fullPensionThresholds[relationshipStatus][homeownershipStatus];
}

export function assetsCutoff(
	relationshipStatus: AgePensionRelationshipStatus,
	homeownershipStatus: AgePensionHomeownershipStatus,
): number {
	return AGE_PENSION_ASSETS_TEST.partPensionCutoffs[relationshipStatus][homeownershipStatus];
}

export function assetTaperPerThousand(
	relationshipStatus: AgePensionRelationshipStatus,
	eligibleRecipients: 1 | 2,
): number {
	if (relationshipStatus === "single") {
		return AGE_PENSION_ASSETS_TEST.taperPerThousandSingle;
	}

	return AGE_PENSION_ASSETS_TEST.taperPerThousandCoupleEach * eligibleRecipients;
}

export function deemingThreshold(relationshipStatus: AgePensionRelationshipStatus): number {
	return relationshipStatus === "single"
		? AGE_PENSION_DEEMING.singleThreshold
		: AGE_PENSION_DEEMING.coupleThreshold;
}

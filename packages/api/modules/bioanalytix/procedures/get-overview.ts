import {
	getBioPlanForHousehold,
	getCurrentBioPlanningProfile,
	getOrCreatePrimaryBioHousehold,
} from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";
import type { HouseholdFinancialState } from "../../financial/household/types";
import { buildLongevityPlanningPolicy } from "../../planning/longevityPlanningPolicy";
import {
	refreshPlanningProfileHouseholdContext,
	type BioanalytixPlanningProfileV1,
} from "../../planning/planningProfile";
import { buildPlanningSummary } from "../../planning/planningSummary";
import { emptySavedPlan, type SavedBioanalytixPlanV1 } from "../../planning/savedPlan";

export const getBioanalytixOverview = protectedProcedure
	.route({
		method: "GET",
		path: "/bioanalytix/overview",
		tags: ["Bioanalytix"],
		summary: "Get Bioanalytix overview",
		description:
			"Return a lightweight summary of the authenticated household's biological and financial planning position.",
	})
	.handler(async ({ context }) => {
		const household = await getOrCreatePrimaryBioHousehold({
			userId: context.user.id,
			name: context.user.name ? `${context.user.name}'s household` : "My household",
		});

		const savedRecord = await getBioPlanForHousehold(household.id);
		const planningProfileRecord = await getCurrentBioPlanningProfile(household.id);

		const savedPlan =
			(savedRecord?.plan as unknown as SavedBioanalytixPlanV1 | null) ?? emptySavedPlan();

		const storedProfile =
			(planningProfileRecord?.profile as unknown as BioanalytixPlanningProfileV1 | null) ??
			null;

		const financialState = household.financialState
			? (household.financialState as unknown as HouseholdFinancialState)
			: null;

		const planningProfile =
			storedProfile && financialState
				? refreshPlanningProfileHouseholdContext({
						profile: storedProfile,
						household: financialState,
					})
				: storedProfile;

		const planningSummary = planningProfile ? buildPlanningSummary(planningProfile) : null;

		const longevityPolicy = financialState
			? buildLongevityPlanningPolicy(financialState)
			: null;

		const geneticHighlights = planningProfile?.geneticHighlights ?? [];

		const planningRelevantHighlights = geneticHighlights.filter(
			(highlight) =>
				highlight.planningRelevance.level === "potential" ||
				highlight.planningRelevance.level === "material",
		);

		const featuredGeneticHighlights = [
			...planningRelevantHighlights,
			...geneticHighlights.filter(
				(highlight) =>
					!planningRelevantHighlights.some((relevant) => relevant.id === highlight.id),
			),
		]
			.slice(0, 2)
			.map((highlight) => ({
				id: highlight.id,
				title: highlight.title,
				summary: highlight.summary,
				evidenceStrength: highlight.evidenceStrength,
				planningRelevance: highlight.planningRelevance,
			}));

		const reviews = savedPlan.areaReviews ?? [];
		const totalPlanningAreas = planningSummary?.areas.length ?? 0;

		const reviewedAreaIds = new Set(
			reviews.filter((review) => review.status === "reviewed").map((review) => review.area),
		);

		const addressedAreas = planningSummary
			? planningSummary.areas.filter(
					(area) => area.coverage === "covered" || reviewedAreaIds.has(area.area),
				).length
			: 0;

		const currentNetWealth =
			planningProfile?.householdContext.estatePosition.netHouseholdResources ?? null;

		let nextAction = {
			title: "Complete your profile",
			description:
				"Add your household information to begin building your Bioanalytix planning profile.",
			href: "/v2/setup",
		};

		if (financialState && !planningProfile) {
			nextAction = {
				title: "Add your DNA",
				description:
					"Connect your genetic evidence to identify the planning questions most relevant to explore.",
				href: "/v2/dna",
			};
		} else if (planningProfile && addressedAreas < totalPlanningAreas) {
			nextAction = {
				title: "Continue your plan",
				description:
					"Review the planning areas that Bioanalytix has brought together for you.",
				href: "/v2/plan",
			};
		} else if (planningProfile) {
			nextAction = {
				title: "Explore your plan",
				description:
					"Use your completed planning profile to explore the questions and scenarios that matter to you.",
				href: "/v2/plan",
			};
		}

		return {
			householdId: household.id,

			profile: {
				setupComplete: financialState !== null,
				hasGeneticProfile: planningProfile !== null,
			},

			dna: {
				totalHighlights: geneticHighlights.length,
				planningRelevantHighlights: planningRelevantHighlights.length,
				featuredHighlights: featuredGeneticHighlights,
			},

			longevity: longevityPolicy
				? {
						range: longevityPolicy.range,
						qualification: longevityPolicy.qualifications[0],
					}
				: null,

			wealth: planningProfile
				? {
						currency: planningProfile.householdContext.currency,
						currentNetWealth,
					}
				: null,

			plan: planningSummary
				? {
						headline:
							addressedAreas === totalPlanningAreas
								? "Your planning areas are covered"
								: planningSummary.headline,
						summary:
							addressedAreas === totalPlanningAreas
								? "You've reviewed the areas requiring attention and your current Plan covers all five planning areas."
								: planningSummary.summary,
						areas: planningSummary.areas.map((area) => {
							const reviewed = reviewedAreaIds.has(area.area);
							const addressed = area.coverage === "covered" || reviewed;

							return {
								area: area.area,
								title: area.title,
								outcome: area.outcome,
								coverage: area.coverage,
								reviewed,
								addressed,
							};
						}),
						addressedAreas,
						totalAreas: totalPlanningAreas,
						progressPercent:
							totalPlanningAreas > 0
								? Math.round((addressedAreas / totalPlanningAreas) * 100)
								: 0,
					}
				: null,

			nextAction,
		};
	});

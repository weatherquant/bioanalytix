import { getCurrentBioPlanningProfile, getOrCreatePrimaryBioHousehold } from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";
import type { BioanalytixPlanningProfileV1 } from "../../planning/planningProfile";
import {
	BIOANALYTIX_RESEARCH_CATALOG,
	type BioanalytixResearchItem,
} from "../research/researchCatalog";
import { getBioanalytixUserEntitlements } from "../server-entitlements";

function normalise(value: string) {
	return value.trim().toLowerCase();
}

function researchItemMatchesProfile(
	item: BioanalytixResearchItem,
	highlightIds: Set<string>,
	profileText: string,
) {
	if (item.relatedHighlightIds?.some((id) => highlightIds.has(normalise(id)))) {
		return true;
	}

	return item.relatedGenes.some((gene) => profileText.includes(normalise(gene)));
}

export const getBioanalytixResearch = protectedProcedure
	.route({
		method: "GET",
		path: "/bioanalytix/research",
		tags: ["Bioanalytix"],
		summary: "Get Bioanalytix research",
		description:
			"Return curated Bioanalytix research, with profile matching when the authenticated user is entitled to personalised research.",
	})
	.handler(async ({ context }) => {
		const entitlements = await getBioanalytixUserEntitlements(context.user.id);

		const guardrails = {
			title: "How Bioanalytix uses research",
			message:
				"Research shown here does not automatically change your genetic interpretation, health assessment or financial plan. New evidence must be reviewed before it can affect a governed Bioanalytix model.",
		};

		if (!entitlements.capabilities.personalisedResearch) {
			return {
				updatedAt: new Date().toISOString(),

				personalised: false,

				profile: {
					available: false,
					geneticInsights: 0,
					matchedResearch: 0,
					matchedGenes: [],
					matchedTopics: [],
				},

				forYou: [],

				latest: [...BIOANALYTIX_RESEARCH_CATALOG],

				guardrails,
			};
		}

		const household = await getOrCreatePrimaryBioHousehold({
			userId: context.user.id,
			name: context.user.name ? `${context.user.name}'s household` : "My household",
		});

		const planningProfileRecord = await getCurrentBioPlanningProfile(household.id);

		const planningProfile =
			(planningProfileRecord?.profile as unknown as BioanalytixPlanningProfileV1 | null) ??
			null;

		const geneticHighlights = planningProfile?.geneticHighlights ?? [];

		const highlightIds = new Set(geneticHighlights.map((highlight) => normalise(highlight.id)));

		/*
		 * MVP matching deliberately uses only descriptive profile content.
		 *
		 * A match means that a research item concerns a gene or biological
		 * topic represented in the user's governed genetic highlights.
		 * It does NOT mean that the paper's population, genotype, effect
		 * estimate or conclusions apply personally to the user.
		 */
		const profileText = geneticHighlights
			.flatMap((highlight) => [
				highlight.id,
				highlight.title,
				highlight.summary,
				highlight.explanation,
			])
			.filter((value): value is string => Boolean(value))
			.join(" ")
			.toLowerCase();

		const forYou: BioanalytixResearchItem[] = [];
		const latest: BioanalytixResearchItem[] = [];

		for (const item of BIOANALYTIX_RESEARCH_CATALOG) {
			if (researchItemMatchesProfile(item, highlightIds, profileText)) {
				forYou.push(item);
			} else {
				latest.push(item);
			}
		}

		const matchedGenes = Array.from(new Set(forYou.flatMap((item) => item.relatedGenes)));

		const matchedTopics = Array.from(new Set(forYou.flatMap((item) => item.topics)));

		return {
			updatedAt: new Date().toISOString(),

			personalised: true,

			profile: {
				available: planningProfile !== null,
				geneticInsights: geneticHighlights.length,
				matchedResearch: forYou.length,
				matchedGenes,
				matchedTopics,
			},

			forYou,
			latest,

			guardrails,
		};
	});

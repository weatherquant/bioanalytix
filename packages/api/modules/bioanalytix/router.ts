import { publicProcedure } from "../../orpc/procedures";
import { askBioanalytix } from "./procedures/ask";
import { compareBioanalytixEstateLegacy } from "./procedures/compare-estate-legacy";
import { compareBioanalytixLongevitySpending } from "./procedures/compare-longevity-spending";
import { completeBioanalytixOnboarding } from "./procedures/complete-onboarding";
import { getBioanalytixEstate } from "./procedures/get-estate";
import { getBioanalytixOnboarding } from "./procedures/get-onboarding";
import { getBioanalytixPlan } from "./procedures/get-plan";
import { getBioanalytixWealth } from "./procedures/get-wealth";
import { runBioanalytixPlanScenario } from "./procedures/run-plan-scenario";
import { saveBioanalytixOnboardingDraft } from "./procedures/save-onboarding-draft";
import { saveBioanalytixPlan } from "./procedures/save-plan";

export const bioanalytixRouter = publicProcedure.router({
	ask: askBioanalytix,

	estate: publicProcedure.router({
		get: getBioanalytixEstate,
		compareLegacy: compareBioanalytixEstateLegacy,
	}),

	longevity: publicProcedure.router({
		compareSpending: compareBioanalytixLongevitySpending,
	}),

	onboarding: publicProcedure.router({
		get: getBioanalytixOnboarding,
		saveDraft: saveBioanalytixOnboardingDraft,
		complete: completeBioanalytixOnboarding,
	}),

	plan: publicProcedure.router({
		get: getBioanalytixPlan,
		save: saveBioanalytixPlan,
		runScenario: runBioanalytixPlanScenario,
	}),

	wealth: publicProcedure.router({
		get: getBioanalytixWealth,
	}),
});

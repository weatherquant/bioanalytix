import { publicProcedure } from "../../orpc/procedures";
import { completeBioanalytixOnboarding } from "./procedures/complete-onboarding";
import { getBioanalytixOnboarding } from "./procedures/get-onboarding";
import { getBioanalytixPlan } from "./procedures/get-plan";
import { saveBioanalytixOnboardingDraft } from "./procedures/save-onboarding-draft";
import { saveBioanalytixPlan } from "./procedures/save-plan";

export const bioanalytixRouter = publicProcedure.router({
	onboarding: publicProcedure.router({
		get: getBioanalytixOnboarding,
		saveDraft: saveBioanalytixOnboardingDraft,
		complete: completeBioanalytixOnboarding,
	}),

	plan: publicProcedure.router({
		get: getBioanalytixPlan,
		save: saveBioanalytixPlan,
	}),
});

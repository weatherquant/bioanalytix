import { publicProcedure } from "../../orpc/procedures";
import { completeBioanalytixOnboarding } from "./procedures/complete-onboarding";
import { getBioanalytixOnboarding } from "./procedures/get-onboarding";
import { saveBioanalytixOnboardingDraft } from "./procedures/save-onboarding-draft";

export const bioanalytixRouter = publicProcedure.router({
	onboarding: publicProcedure.router({
		get: getBioanalytixOnboarding,
		saveDraft: saveBioanalytixOnboardingDraft,
		complete: completeBioanalytixOnboarding,
	}),
});

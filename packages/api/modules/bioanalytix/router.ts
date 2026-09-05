import { publicProcedure } from "../../orpc/procedures";
import { getBioanalytixOnboarding } from "./procedures/get-onboarding";

export const bioanalytixRouter = publicProcedure.router({
	onboarding: getBioanalytixOnboarding,
});

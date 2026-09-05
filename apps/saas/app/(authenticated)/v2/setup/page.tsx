import { getSession } from "@auth/lib/server";
import { redirect } from "next/navigation";

import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";
import { BioanalytixSetupWizard } from "./BioanalytixSetupWizard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BioanalytixSetupPage() {
	const session = await getSession();

	if (!session) {
		redirect("/login");
	}

	return (
		<>
			<AppHeader
				title="Build your profile"
				description="A few approximate details help Bioanalytix turn biological possibilities into useful financial scenarios."
			/>

			<PageShell>
				<BioanalytixSetupWizard />
			</PageShell>
		</>
	);
}

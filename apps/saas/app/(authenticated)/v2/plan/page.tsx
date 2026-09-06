import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";
import { PlanWorkspace } from "../../../../modules/bioanalytix/planning/PlanWorkspace";

export default function PlanPage() {
	return (
		<>
			<AppHeader
				title="Plan"
				description="Explore the questions that matter, test assumptions and save your plan."
			/>

			<PageShell>
				<PlanWorkspace />
			</PageShell>
		</>
	);
}

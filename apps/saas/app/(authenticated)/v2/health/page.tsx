import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";
import { HealthProfileClient } from "../../../../modules/bioanalytix/health/HealthProfileClient";

export default function HealthPage() {
	return (
		<>
			<AppHeader
				title="Health"
				description="Understand the health factors that may be worth paying attention to over time."
			/>

			<PageShell>
				<HealthProfileClient />
			</PageShell>
		</>
	);
}

import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";

export default function HealthPage() {
	return (
		<>
			<AppHeader
				title="Health"
				description="Understand your health and the factors that influence it."
			/>

			<PageShell>
				<div className="p-8 rounded-2xl border bg-card">
					<h2 className="text-xl font-semibold">Health</h2>

					<p className="mt-2 max-w-2xl text-muted-foreground">
						Your health modelling will be migrated here.
					</p>
				</div>
			</PageShell>
		</>
	);
}

import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";

export default function ResearchPage() {
	return (
		<>
			<AppHeader
				title="Research"
				description="Explore the latest research in longevity and health."
			/>

			<PageShell>
				<div className="p-8 rounded-2xl border bg-card">
					<h2 className="text-xl font-semibold">Research</h2>

					<p className="mt-2 max-w-2xl text-muted-foreground">
						Your research exploration will be migrated here.
					</p>
				</div>
			</PageShell>
		</>
	);
}

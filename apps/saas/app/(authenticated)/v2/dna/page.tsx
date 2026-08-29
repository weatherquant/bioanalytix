import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";

export default function DnaPage() {
	return (
		<>
			<AppHeader title="My DNA" description="Your genetic profile and longevity signals." />

			<PageShell>
				<div className="p-8 rounded-2xl border bg-card">
					<h2 className="text-xl font-semibold">My DNA</h2>

					<p className="mt-2 max-w-2xl text-muted-foreground">
						Your existing genetics capability will be migrated here next.
					</p>
				</div>
			</PageShell>
		</>
	);
}

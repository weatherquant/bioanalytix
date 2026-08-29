import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";

export default function WealthPage() {
	return (
		<>
			<AppHeader title="Wealth" description="Manage your wealth and financial future." />

			<PageShell>
				<div className="p-8 rounded-2xl border bg-card">
					<h2 className="text-xl font-semibold">Wealth</h2>

					<p className="mt-2 max-w-2xl text-muted-foreground">
						Your wealth management will be migrated here.
					</p>
				</div>
			</PageShell>
		</>
	);
}

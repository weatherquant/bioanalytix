import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";

export default function LongevityPage() {
	return (
		<>
			<AppHeader
				title="Longevity"
				description="Understand your longevity range and the factors that influence it."
			/>

			<PageShell>
				<div className="p-8 rounded-2xl border bg-card">
					<h2 className="text-xl font-semibold">Longevity</h2>

					<p className="mt-2 max-w-2xl text-muted-foreground">
						Your longevity modelling will be migrated here.
					</p>
				</div>
			</PageShell>
		</>
	);
}

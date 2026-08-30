import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";
import { DnaProfileClient } from "../../../../modules/bioanalytix/genetics/DnaProfileClient";

export default function DnaPage() {
	return (
		<>
			<AppHeader title="My DNA" description="Your genetic profile and longevity signals." />

			<PageShell>
				<DnaProfileClient />
			</PageShell>
		</>
	);
}

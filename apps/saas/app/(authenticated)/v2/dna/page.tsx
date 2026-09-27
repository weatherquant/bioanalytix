import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";
import { DnaProfileClient } from "../../../../modules/bioanalytix/genetics/DnaProfileClient";

export default function DnaPage() {
	return (
		<>
			<AppHeader
				title="My DNA"
				description="Your genetic evidence and its relevance to your financial plan."
			/>

			<PageShell>
				<DnaProfileClient />
			</PageShell>
		</>
	);
}

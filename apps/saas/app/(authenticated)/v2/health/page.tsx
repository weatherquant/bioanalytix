import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { BioanalytixPageHero } from "../../../../modules/bioanalytix/components/heroes/BioanalytixPageHero";
import { HealthHeroVisual } from "../../../../modules/bioanalytix/components/heroes/HealthHeroVisual";
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
				<div className="space-y-6">
					<BioanalytixPageHero
						eyebrow="Your health. Better informed."
						title="Understand the factors that may shape your health."
						description="Bring your health profile and biological evidence together to see which areas may deserve more attention over time."
						secondaryDescription="Bioanalytix helps turn evidence into context for longer-term planning, without treating individual findings as diagnoses or predictions."
						visual={<HealthHeroVisual />}
					/>

					<HealthProfileClient />
				</div>
			</PageShell>
		</>
	);
}

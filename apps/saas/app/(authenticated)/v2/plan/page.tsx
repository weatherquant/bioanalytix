import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";

export default function PlanPage() {
	return (
		<>
			<AppHeader
				title="Plan"
				description="Test retirement, spending, investment and estate planning choices."
			/>

			<PageShell>
				<div
					style={{
						background: "#ffffff",
						border: "1px solid #e4e4e4",
						borderRadius: 14,
						padding: 28,
					}}
				>
					<h2
						style={{
							margin: 0,
							fontSize: 20,
							fontWeight: 650,
						}}
					>
						Plan
					</h2>

					<p
						style={{
							marginTop: 10,
							marginBottom: 0,
							color: "#777777",
							lineHeight: 1.6,
							maxWidth: 700,
						}}
					>
						Your retirement, spending, investment and estate planning scenarios will be
						migrated here.
					</p>
				</div>
			</PageShell>
		</>
	);
}

import { getSession } from "@auth/lib/server";
import { PricingTable } from "@payments/components/PricingTable";
import { Dna, ShieldCheck, Sparkles } from "lucide-react";

import { getBioanalytixUserEntitlements } from "../../../../../../packages/api/modules/bioanalytix/server-entitlements";
import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";
import { DnaProfileClient } from "../../../../modules/bioanalytix/genetics/DnaProfileClient";

export default async function DnaPage() {
	const session = await getSession();

	if (!session?.user) {
		return null;
	}

	const entitlements = await getBioanalytixUserEntitlements(session.user.id);

	if (entitlements.capabilities.geneticProfile) {
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

	return (
		<>
			<AppHeader
				title="My DNA"
				description="Add your biology to your financial planning picture."
			/>

			<PageShell>
				<div className="space-y-8">
					<section className="p-8 rounded-3xl border bg-card">
						<div className="max-w-3xl">
							<div className="mb-5 size-12 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<Dna className="size-6" />
							</div>

							<p className="text-sm font-medium text-primary">
								Bioanalytix Individual
							</p>

							<h1 className="mt-2 text-3xl font-semibold tracking-tight">
								Personalise your plan with your DNA
							</h1>

							<p className="mt-4 max-w-2xl text-muted-foreground">
								Your financial plan already helps you explore your future.
								Individual Bioanalytix adds your genetic evidence to identify
								health, longevity and resilience questions that may deserve more
								attention.
							</p>

							<div className="mt-8 gap-4 md:grid-cols-2 grid">
								<div className="p-5 rounded-2xl border">
									<Sparkles className="size-5 text-primary" />

									<h2 className="mt-3 font-medium">Personalised evidence</h2>

									<p className="mt-2 text-sm text-muted-foreground">
										Upload supported DNA data and see relevant genetic evidence
										alongside your planning profile.
									</p>
								</div>

								<div className="p-5 rounded-2xl border">
									<ShieldCheck className="size-5 text-primary" />

									<h2 className="mt-3 font-medium">
										Planning context, not prediction
									</h2>

									<p className="mt-2 text-sm text-muted-foreground">
										Genetic evidence can make planning questions more relevant.
										It does not determine your lifespan, retirement age or
										financial decisions.
									</p>
								</div>
							</div>
						</div>
					</section>

					<section>
						<div className="mb-5">
							<h2 className="text-xl font-semibold">
								Choose the Bioanalytix experience for you
							</h2>

							<p className="mt-1 text-sm text-muted-foreground">
								Individual adds your genetic evidence to your own planning.
								Professional extends Bioanalytix to client and organisation
								workflows.
							</p>
						</div>

						<PricingTable userId={session.user.id} activePlanId={entitlements.tier} />
					</section>
				</div>
			</PageShell>
		</>
	);
}

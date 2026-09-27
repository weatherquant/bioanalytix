"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowRight,
	Brain,
	ChartNoAxesCombined,
	Check,
	Circle,
	Dna,
	HeartPulse,
	Sparkles,
} from "lucide-react";
import Link from "next/link";

import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";
import { orpcClient } from "../../../../modules/shared/lib/orpc-client";

function formatCurrency(value: number, currencyCode: string) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: currencyCode,
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(value);
}

function formatEvidenceStrength(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function OverviewPage() {
	const overviewQuery = useQuery({
		queryKey: ["bioanalytix", "overview"],
		queryFn: () => orpcClient.bioanalytix.overview.get(),
	});

	if (overviewQuery.isPending) {
		return (
			<>
				<AppHeader title="Overview" description="Your Bioanalytix planning profile." />

				<PageShell>
					<div className="p-8 text-sm rounded-3xl border bg-card text-muted-foreground">
						Building your overview…
					</div>
				</PageShell>
			</>
		);
	}

	if (overviewQuery.isError) {
		return (
			<>
				<AppHeader title="Overview" description="Your Bioanalytix planning profile." />

				<PageShell>
					<div className="p-8 rounded-3xl border bg-card">
						<p className="font-medium">We couldn&apos;t build your overview.</p>

						<p className="mt-2 text-sm text-muted-foreground">
							Please try again or review your information in Setup.
						</p>
					</div>
				</PageShell>
			</>
		);
	}

	const response = overviewQuery.data;

	const longevityRange = response.longevity?.range;

	const wealthValue =
		response.wealth?.currentNetWealth !== null &&
		response.wealth?.currentNetWealth !== undefined
			? formatCurrency(response.wealth.currentNetWealth, response.wealth.currency)
			: "—";

	const healthValue = response.dna.planningRelevantHighlights;

	return (
		<>
			<AppHeader
				title="Overview"
				description="Your biological evidence, financial position and planning priorities."
			/>

			<PageShell>
				<div className="space-y-6">
					{/* Hero */}
					<section className="px-1 py-5 md:py-8">
						<div className="gap-2 text-sm font-medium flex items-center text-muted-foreground">
							<Dna size={16} />
							<span>Bioanalytix</span>
						</div>

						<h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
							Plan for the life you may actually live.
						</h2>

						<p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
							Your biological evidence helps identify the planning questions worth
							exploring. Your financial model shows what your choices could mean for
							retirement, resilience and the estate you leave behind.
						</p>
					</section>

					{/* Personal DNA */}
					<section className="overflow-hidden rounded-3xl border bg-card">
						<div className="gap-6 p-6 md:p-8 flex flex-col">
							<div className="gap-6 flex items-start justify-between">
								<div>
									<div className="gap-2 text-sm font-medium flex items-center">
										<Dna size={17} />
										<span>Your DNA</span>
									</div>

									{response.profile.hasGeneticProfile ? (
										<div className="mt-3 gap-x-5 gap-y-1 flex flex-wrap items-baseline">
											<span className="text-3xl font-semibold tracking-tight">
												{response.dna.totalHighlights}
											</span>

											<span className="text-sm text-muted-foreground">
												genetic insights
											</span>

											<span className="text-sm font-medium">
												{response.dna.planningRelevantHighlights} increase
												planning attention
											</span>
										</div>
									) : (
										<p className="mt-3 text-lg font-medium">
											Add your DNA to personalise your planning profile.
										</p>
									)}
								</div>

								<Link
									href="/v2/dna"
									className="gap-2 text-sm font-medium flex shrink-0 items-center hover:underline"
								>
									{response.profile.hasGeneticProfile ? "View DNA" : "Add DNA"}
									<ArrowRight size={15} />
								</Link>
							</div>

							{response.profile.hasGeneticProfile &&
							response.dna.featuredHighlights.length > 0 ? (
								<div className="gap-3 md:grid-cols-2 grid">
									{response.dna.featuredHighlights.map((highlight) => (
										<div
											key={highlight.id}
											className="p-5 rounded-2xl border bg-background/50"
										>
											<div className="gap-3 flex items-start">
												<div className="mt-0.5 p-2 rounded-xl border">
													<Sparkles size={16} strokeWidth={1.8} />
												</div>

												<div className="min-w-0">
													<h3 className="font-medium">
														{highlight.title}
													</h3>

													<p className="mt-1 text-xs text-muted-foreground">
														{formatEvidenceStrength(
															highlight.evidenceStrength,
														)}{" "}
														evidence ·{" "}
														{highlight.planningRelevance.label}
													</p>

													<p className="mt-3 text-sm leading-6 text-muted-foreground">
														{highlight.summary}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							) : response.profile.hasGeneticProfile ? (
								<p className="max-w-3xl text-sm leading-6 text-muted-foreground">
									Your current genetic profile does not contain findings that
									require additional planning attention. You can still review your
									full DNA profile and evidence.
								</p>
							) : (
								<p className="max-w-3xl text-sm leading-6 text-muted-foreground">
									Bioanalytix uses your genetic evidence to identify health,
									working-life and later-life questions that may be more relevant
									to explore. It does not use DNA to predict your lifespan or
									automatically change your financial assumptions.
								</p>
							)}
						</div>
					</section>

					{/* Core planning cards */}
					<section className="gap-4 md:grid-cols-3 grid">
						<Link
							href="/v2/longevity"
							className="group p-6 rounded-3xl border bg-card transition-colors hover:bg-muted/30"
						>
							<div className="flex items-center justify-between">
								<div className="p-2.5 rounded-xl border">
									<HeartPulse size={19} strokeWidth={1.8} />
								</div>

								<ArrowRight
									size={16}
									className="group-hover:translate-x-0.5 transition-transform"
								/>
							</div>

							<div className="mt-6 text-sm font-medium text-muted-foreground">
								Longevity
							</div>

							<div className="mt-1 text-3xl font-semibold tracking-tight">
								{longevityRange
									? `${longevityRange.lowerAge}–${longevityRange.upperAge}`
									: "—"}
							</div>

							<div className="mt-1 text-sm font-medium">Long-life planning range</div>

							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								Explore how a longer life could affect retirement and later-life
								resilience.
							</p>
						</Link>

						<Link
							href="/v2/wealth"
							className="group p-6 rounded-3xl border bg-card transition-colors hover:bg-muted/30"
						>
							<div className="flex items-center justify-between">
								<div className="p-2.5 rounded-xl border">
									<ChartNoAxesCombined size={19} strokeWidth={1.8} />
								</div>

								<ArrowRight
									size={16}
									className="group-hover:translate-x-0.5 transition-transform"
								/>
							</div>

							<div className="mt-6 text-sm font-medium text-muted-foreground">
								Wealth
							</div>

							<div className="mt-1 text-3xl font-semibold tracking-tight">
								{wealthValue}
							</div>

							<div className="mt-1 text-sm font-medium">Current net wealth</div>

							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								See how your financial resources behave across longer-life planning
								horizons.
							</p>
						</Link>

						<Link
							href="/v2/health"
							className="group p-6 rounded-3xl border bg-card transition-colors hover:bg-muted/30"
						>
							<div className="flex items-center justify-between">
								<div className="p-2.5 rounded-xl border">
									<Brain size={19} strokeWidth={1.8} />
								</div>

								<ArrowRight
									size={16}
									className="group-hover:translate-x-0.5 transition-transform"
								/>
							</div>

							<div className="mt-6 text-sm font-medium text-muted-foreground">
								Health
							</div>

							<div
								className={
									healthValue === 0 && response.profile.hasGeneticProfile
										? "mt-1 text-2xl font-semibold tracking-tight"
										: "mt-1 text-3xl font-semibold tracking-tight"
								}
							>
								{response.profile.hasGeneticProfile
									? healthValue === 0
										? "No added attention"
										: healthValue
									: "—"}
							</div>

							<div className="mt-1 text-sm font-medium">
								{response.profile.hasGeneticProfile
									? healthValue === 0
										? "From your current genetic evidence"
										: healthValue === 1
											? "Area of added attention"
											: "Areas of added attention"
									: "Add your DNA"}
							</div>

							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								Review your health-related genetic insights and the evidence behind
								them.
							</p>
						</Link>
					</section>

					{/* Plan and next action */}
					<section className="gap-4 lg:grid-cols-[1.6fr_1fr] grid">
						<div className="p-6 md:p-7 rounded-3xl border bg-card">
							<div className="gap-5 flex items-start justify-between">
								<div>
									<div className="text-sm font-medium text-muted-foreground">
										Your plan
									</div>

									<h3 className="mt-2 text-xl font-semibold tracking-tight">
										{response.plan?.headline ?? "Build your planning profile"}
									</h3>

									{response.plan && (
										<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
											{response.plan.summary}
										</p>
									)}
								</div>

								<Link
									href="/v2/plan"
									className="gap-2 text-sm font-medium flex shrink-0 items-center hover:underline"
								>
									View plan
									<ArrowRight size={15} />
								</Link>
							</div>

							{response.plan ? (
								<>
									<div className="mt-6 gap-2 sm:grid-cols-2 grid">
										{response.plan.areas.map((area) => (
											<div
												key={area.area}
												className="gap-2.5 py-1 text-sm flex items-center"
											>
												{area.reviewed ? (
													<Check size={16} className="shrink-0" />
												) : (
													<Circle
														size={14}
														className="shrink-0 text-muted-foreground"
													/>
												)}

												<span
													className={
														area.reviewed ? "" : "text-muted-foreground"
													}
												>
													{area.title}
												</span>
											</div>
										))}
									</div>

									<div className="mt-6 gap-3 pt-5 flex items-center border-t">
										<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
											<div
												className="h-full rounded-full bg-foreground transition-all"
												style={{
													width: `${response.plan.progressPercent}%`,
												}}
											/>
										</div>

										<span className="text-xs font-medium shrink-0 text-muted-foreground">
											{response.plan.reviewedAreas} of{" "}
											{response.plan.totalAreas} reviewed
										</span>
									</div>
								</>
							) : (
								<p className="mt-5 text-sm text-muted-foreground">
									Complete Setup and add your DNA to build your planning profile.
								</p>
							)}
						</div>

						<div className="p-6 md:p-7 flex flex-col rounded-3xl border bg-card">
							<div className="gap-2 text-sm font-medium flex items-center text-muted-foreground">
								<Sparkles size={16} />
								<span>Next step</span>
							</div>

							<h3 className="mt-4 text-xl font-semibold tracking-tight">
								{response.nextAction.title}
							</h3>

							<p className="mt-2 text-sm leading-6 flex-1 text-muted-foreground">
								{response.nextAction.description}
							</p>

							<Link
								href={response.nextAction.href}
								className="mt-6 gap-2 text-sm font-medium inline-flex items-center hover:underline"
							>
								Continue
								<ArrowRight size={15} />
							</Link>
						</div>
					</section>
				</div>
			</PageShell>
		</>
	);
}

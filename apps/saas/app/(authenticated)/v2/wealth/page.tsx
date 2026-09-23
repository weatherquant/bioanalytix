"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowRight,
	ChartNoAxesCombined,
	Clock3,
	Info,
	Landmark,
	ShieldCheck,
	WalletCards,
} from "lucide-react";
import Link from "next/link";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ReferenceArea,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";
import { orpcClient } from "../../../../modules/shared/lib/orpc-client";

const currency = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: "AUD",
	maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: "AUD",
	notation: "compact",
	maximumFractionDigits: 1,
});

export default function WealthPage() {
	const wealthQuery = useQuery({
		queryKey: ["bioanalytix", "wealth"],
		queryFn: () => orpcClient.bioanalytix.wealth.get(),
	});

	if (wealthQuery.isPending) {
		return (
			<>
				<AppHeader
					title="Wealth"
					description="See how your financial position may evolve across your longevity horizon."
				/>
				<PageShell>
					<div className="p-8 text-sm rounded-3xl border bg-card text-muted-foreground">
						Building your wealth projection…
					</div>
				</PageShell>
			</>
		);
	}

	if (wealthQuery.isError) {
		return (
			<>
				<AppHeader
					title="Wealth"
					description="See how your financial position may evolve across your longevity horizon."
				/>
				<PageShell>
					<div className="p-8 rounded-3xl border bg-card">
						<p className="font-medium">
							We couldn&apos;t build your wealth projection.
						</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Please try again or review the information in Setup.
						</p>
					</div>
				</PageShell>
			</>
		);
	}

	const response = wealthQuery.data;

	if (!response.planning || !response.planningHorizon) {
		return (
			<>
				<AppHeader
					title="Wealth"
					description="See how your financial position may evolve across your longevity horizon."
				/>
				<PageShell>
					<div className="p-8 rounded-3xl border bg-card">
						<p className="font-medium">
							Complete Setup to build your wealth projection.
						</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Bioanalytix needs your household financial information before it can run
							the planning analysis.
						</p>

						<Link
							href="/v2/setup"
							className="mt-5 gap-2 px-4 py-2.5 text-sm font-medium inline-flex items-center rounded-xl border transition-colors hover:bg-muted/40"
						>
							Go to Setup
							<ArrowRight size={15} />
						</Link>
					</div>
				</PageShell>
			</>
		);
	}

	const wealth = response.planning.baseline;

	const wealthProjection = wealth.projection.map((point) => ({
		age: point.age,
		p25: point.p25NetWealth,
		median: point.medianNetWealth,
		p75: point.p75NetWealth,
	}));

	const longevityRange = {
		lower: response.planningHorizon.range.lowerAge,
		central: response.planningHorizon.range.centralAge,
		upper: response.planningHorizon.range.upperAge,
	};

	const metrics = [
		{
			label: "Current net wealth",
			value: compactCurrency.format(wealth.current.netWealth),
			description: "Assets less liabilities today",
			icon: WalletCards,
		},
		{
			label: `At planning age ${wealth.atPlanningAge.age}`,
			value: compactCurrency.format(wealth.atPlanningAge.medianNetWealth),
			description: "Median projected wealth",
			icon: Clock3,
		},
		{
			label: "Long-life downside",
			value: compactCurrency.format(wealth.atPlanningAge.p25NetWealth),
			description: `25th percentile at age ${wealth.atPlanningAge.age}`,
			icon: ChartNoAxesCombined,
		},
		{
			label: "Funding pressure",
			value: `${Math.round(wealth.resilience.probabilityOfAnyUnfundedCashFlow * 100)}%`,
			description: "Simulations with any unfunded cash flow",
			icon: ShieldCheck,
		},
	];

	const horizonRows = [
		{
			label: "Planning range begins",
			age: longevityRange.lower,
			detail: "Lower bound of the governed long-life financial planning range.",
		},
		{
			label: "Central planning horizon",
			age: longevityRange.central,
			detail: "The central age used to summarise the long-life wealth projection.",
		},
		{
			label: "Long-life stress horizon",
			age: longevityRange.upper,
			detail: "Upper planning age used to test financial resilience under longer life.",
		},
	];

	return (
		<>
			<AppHeader
				title="Wealth"
				description="See how your financial position may evolve across your longevity horizon."
			/>

			<PageShell>
				<div className="space-y-6">
					<section className="overflow-hidden rounded-3xl border bg-card">
						<div className="px-6 py-5 sm:px-8 border-b">
							<div className="gap-4 lg:flex-row lg:items-start lg:justify-between flex flex-col">
								<div>
									<div className="mb-3 gap-2 text-xs font-medium flex items-center tracking-[0.16em] text-muted-foreground uppercase">
										<ChartNoAxesCombined size={15} />
										Longevity × wealth
									</div>

									<h2 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">
										Will your wealth last for the life you may actually live?
									</h2>

									<p className="mt-3 max-w-3xl text-sm leading-6 sm:text-base text-muted-foreground">
										Bioanalytix connects your longevity planning horizon with
										your financial trajectory so you can see where resilience
										remains strong and where longer life begins to change the
										picture.
									</p>
								</div>

								<div className="gap-2 px-3 py-1.5 text-xs inline-flex w-fit items-center rounded-full border bg-muted/40 text-muted-foreground">
									<Info size={13} />
									{wealth.simulationCount} simulations
								</div>
							</div>
						</div>

						<div className="md:grid-cols-2 xl:grid-cols-4 grid gap-px bg-border">
							{metrics.map((metric) => {
								const Icon = metric.icon;

								return (
									<div key={metric.label} className="p-6 bg-card">
										<div className="mb-5 flex items-center justify-between">
											<div className="p-2.5 rounded-xl border bg-muted/40">
												<Icon size={18} strokeWidth={1.7} />
											</div>
										</div>

										<p className="text-sm text-muted-foreground">
											{metric.label}
										</p>
										<p className="mt-1 text-2xl font-semibold tracking-tight">
											{metric.value}
										</p>
										<p className="mt-2 text-xs leading-5 text-muted-foreground">
											{metric.description}
										</p>
									</div>
								);
							})}
						</div>
					</section>

					<section className="p-5 sm:p-7 rounded-3xl border bg-card">
						<div className="mb-6 gap-3 sm:flex-row sm:items-end sm:justify-between flex flex-col">
							<div>
								<p className="text-sm font-medium">Projected household wealth</p>
								<p className="mt-1 text-sm text-muted-foreground">
									Range of simulated outcomes across your planning horizon.
								</p>
							</div>

							<div className="text-xs text-muted-foreground">
								Values shown in today&apos;s dollars
							</div>
						</div>

						<div className="h-[420px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={wealthProjection}
									margin={{
										top: 10,
										right: 18,
										left: 10,
										bottom: 10,
									}}
								>
									<CartesianGrid
										strokeDasharray="3 3"
										vertical={false}
										opacity={0.25}
									/>

									<XAxis
										dataKey="age"
										tickLine={false}
										axisLine={false}
										tickMargin={10}
										label={{
											value: "Age",
											position: "insideBottomRight",
											offset: -6,
										}}
									/>

									<YAxis
										tickLine={false}
										axisLine={false}
										width={72}
										tickFormatter={(value) => compactCurrency.format(value)}
									/>

									<Tooltip
										formatter={(value) => currency.format(Number(value))}
										labelFormatter={(age) => `Age ${age}`}
										contentStyle={{
											borderRadius: "12px",
										}}
									/>

									<Legend />

									<ReferenceArea
										x1={longevityRange.lower}
										x2={longevityRange.upper}
										fill="currentColor"
										fillOpacity={0.05}
										strokeOpacity={0}
									/>

									<ReferenceLine
										x={longevityRange.central}
										stroke="currentColor"
										strokeDasharray="4 4"
										strokeOpacity={0.45}
										label={{
											value: "Central longevity age",
											position: "insideTopRight",
										}}
									/>

									<Line
										type="monotone"
										dataKey="p75"
										name="75th percentile"
										stroke="currentColor"
										strokeOpacity={0.38}
										strokeWidth={2}
										dot={false}
									/>

									<Line
										type="monotone"
										dataKey="median"
										name="Median"
										stroke="currentColor"
										strokeWidth={3}
										dot={false}
									/>

									<Line
										type="monotone"
										dataKey="p25"
										name="25th percentile"
										stroke="currentColor"
										strokeOpacity={0.38}
										strokeWidth={2}
										dot={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>

						<div className="mt-4 p-4 rounded-2xl border bg-muted/30">
							<div className="gap-3 flex">
								<Info size={17} className="mt-0.5 shrink-0 text-muted-foreground" />

								<p className="text-sm leading-6 text-muted-foreground">
									The shaded region marks the governed longevity planning range of
									ages {longevityRange.lower}–{longevityRange.upper}. The lines
									represent financial outcomes, not predicted personal lifespan or
									investment performance.
								</p>
							</div>
						</div>
					</section>

					<div className="gap-6 xl:grid-cols-[1.35fr_0.65fr] grid">
						<section className="p-5 sm:p-7 rounded-3xl border bg-card">
							<div className="mb-6">
								<p className="text-sm font-medium">If you live longer</p>
								<p className="mt-1 text-sm text-muted-foreground">
									How the same financial plan behaves at progressively longer
									planning horizons.
								</p>
							</div>

							<div className="divide-y">
								{horizonRows.map((row) => (
									<div
										key={row.label}
										className="gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center grid"
									>
										<div>
											<div className="gap-2 flex flex-wrap items-center">
												<p className="font-medium">{row.label}</p>
												<span className="px-2 py-0.5 text-xs rounded-full border text-muted-foreground">
													Age {row.age}
												</span>
											</div>

											<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
												{row.detail}
											</p>
										</div>
									</div>
								))}
							</div>
						</section>

						<section className="p-5 sm:p-7 rounded-3xl border bg-card">
							<div className="mb-5 flex items-start justify-between">
								<div>
									<p className="text-sm font-medium">Planning resilience</p>
									<p className="mt-1 text-sm text-muted-foreground">
										What matters most in the current scenario.
									</p>
								</div>

								<div className="p-2.5 rounded-xl border bg-muted/40">
									<ShieldCheck size={18} />
								</div>
							</div>

							<div className="p-5 rounded-2xl border bg-muted/30">
								<p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
									Long-life case
								</p>

								<p className="mt-2 text-xl font-semibold">Funded, with pressure</p>

								<p className="mt-3 text-sm leading-6 text-muted-foreground">
									The central projection remains funded through the longevity
									range, while weaker outcomes begin to reduce flexibility and the
									estate available later in life.
								</p>
							</div>

							<Link
								href="/v2/plan"
								className="mt-4 px-4 py-3 text-sm font-medium flex items-center justify-between rounded-2xl border transition-colors hover:bg-muted/40"
							>
								<span>Explore planning assumptions</span>
								<ArrowRight size={16} />
							</Link>
						</section>
					</div>

					<section className="p-5 sm:p-7 rounded-3xl border bg-card">
						<div className="gap-5 lg:grid-cols-[1fr_auto] lg:items-center grid">
							<div>
								<p className="text-sm font-medium">What this means</p>

								<h3 className="mt-2 text-xl font-semibold tracking-tight">
									Longer life changes the trade-off between spending today,
									financial resilience and the estate you may leave behind.
								</h3>

								<p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
									Bioanalytix does not prescribe an investment product or
									portfolio. It shows how your existing assumptions behave under
									different longevity and financial scenarios so that the
									consequences are visible before decisions are made.
								</p>
							</div>

							<Link
								href="/v2/longevity"
								className="gap-2 px-4 py-2.5 text-sm font-medium inline-flex items-center justify-center rounded-xl border transition-colors hover:bg-muted/40"
							>
								View longevity
								<ArrowRight size={15} />
							</Link>
						</div>
					</section>
				</div>
			</PageShell>
		</>
	);
}

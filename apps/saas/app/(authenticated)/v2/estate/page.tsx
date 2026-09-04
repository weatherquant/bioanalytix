"use client";

import {
	ArrowRight,
	CheckCircle2,
	FileText,
	HeartHandshake,
	Info,
	Landmark,
	ShieldCheck,
	TriangleAlert,
	Users,
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
import { estateFixture } from "./estateFixture";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: estateFixture.currency,
	maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: estateFixture.currency,
	notation: "compact",
	maximumFractionDigits: 1,
});

function formatSignedCurrency(value: number | null) {
	if (value === null) {
		return "Not set";
	}

	const formatted = compactCurrency.format(Math.abs(value));

	return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

function statusLabel(value: boolean | null) {
	if (value === true) {
		return "In place";
	}

	if (value === false) {
		return "Needs attention";
	}

	return "Not recorded";
}

function statusClass(value: boolean | null) {
	if (value === true) {
		return "text-emerald-700";
	}

	if (value === false) {
		return "text-amber-700";
	}

	return "text-muted-foreground";
}

const chartData = estateFixture.projection.map((point) => ({
	age: point.age,
	p25: point.p25Estate,
	median: point.medianEstate,
	p75: point.p75Estate,
}));

export default function EstatePage() {
	const central = estateFixture.atCentralLongevityAge;
	const longLife = estateFixture.atLongLifeAge;

	return (
		<>
			<AppHeader
				title="Estate"
				description="See how longevity, liabilities and protection may affect what remains for others."
			/>

			<PageShell>
				<div className="space-y-8">
					<section className="p-8 shadow-sm rounded-3xl border bg-card">
						<div className="gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center grid">
							<div>
								<div className="mb-4 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
									Longevity × Estate
								</div>

								<h1 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
									What might remain for the people and purposes you care about?
								</h1>

								<p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
									Bioanalytix tests how your projected estate changes across
									different longevity horizons and financial outcomes. It helps
									distinguish current wealth from what may remain after a longer
									life.
								</p>
							</div>

							<div className="p-5 rounded-2xl border bg-muted/30">
								<div className="gap-3 flex items-center">
									<HeartHandshake className="h-5 w-5" />

									<div>
										<p className="text-sm font-medium">Inheritance goal</p>

										<p className="text-2xl font-semibold">
											{estateFixture.inheritanceGoal.targetAmount === null
												? "Not set"
												: compactCurrency.format(
														estateFixture.inheritanceGoal.targetAmount,
													)}
										</p>
									</div>
								</div>

								<p className="mt-3 text-sm leading-6 text-muted-foreground">
									Compared with projected estate at your central longevity
									planning horizon.
								</p>
							</div>
						</div>
					</section>

					<section className="gap-4 md:grid-cols-2 xl:grid-cols-4 grid">
						<div className="p-5 rounded-2xl border bg-card">
							<div className="flex items-center justify-between">
								<p className="text-sm text-muted-foreground">Current net estate</p>

								<Landmark className="h-4 w-4 text-muted-foreground" />
							</div>

							<p className="mt-3 text-2xl font-semibold">
								{compactCurrency.format(estateFixture.current.netEstate)}
							</p>

							<p className="mt-2 text-sm text-muted-foreground">
								Financial planning estimate
							</p>
						</div>

						<div className="p-5 rounded-2xl border bg-card">
							<div className="flex items-center justify-between">
								<p className="text-sm text-muted-foreground">
									At age {central.age}
								</p>

								<Users className="h-4 w-4 text-muted-foreground" />
							</div>

							<p className="mt-3 text-2xl font-semibold">
								{compactCurrency.format(central.medianEstate)}
							</p>

							<p className="mt-2 text-sm text-muted-foreground">
								Median projected estate
							</p>
						</div>

						<div className="p-5 rounded-2xl border bg-card">
							<div className="flex items-center justify-between">
								<p className="text-sm text-muted-foreground">Long-life estate</p>

								<ShieldCheck className="h-4 w-4 text-muted-foreground" />
							</div>

							<p className="mt-3 text-2xl font-semibold">
								{compactCurrency.format(longLife.medianEstate)}
							</p>

							<p className="mt-2 text-sm text-muted-foreground">
								Median at age {longLife.age}
							</p>
						</div>

						<div className="p-5 rounded-2xl border bg-card">
							<div className="flex items-center justify-between">
								<p className="text-sm text-muted-foreground">Goal position</p>

								{(estateFixture.goalComparison.medianSurplusOrShortfall ?? 0) >=
								0 ? (
									<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
								) : (
									<TriangleAlert className="h-4 w-4 text-muted-foreground" />
								)}
							</div>

							<p className="mt-3 text-2xl font-semibold">
								{formatSignedCurrency(
									estateFixture.goalComparison.medianSurplusOrShortfall,
								)}
							</p>

							<p className="mt-2 text-sm text-muted-foreground">
								Median vs inheritance goal
							</p>
						</div>
					</section>

					<section className="p-6 shadow-sm md:p-8 rounded-3xl border bg-card">
						<div className="gap-4 md:flex-row md:items-start flex flex-col justify-between">
							<div>
								<h2 className="text-xl font-semibold">
									Projected estate across your longevity horizon
								</h2>

								<p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
									The range reflects variation in simulated financial outcomes.
									The shaded area marks your longevity planning range.
								</p>
							</div>

							<div className="px-3 py-1 text-xs rounded-full border text-muted-foreground">
								{estateFixture.simulationCount} simulations
							</div>
						</div>

						<div className="mt-6 h-[380px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={chartData}
									margin={{
										top: 10,
										right: 20,
										left: 10,
										bottom: 10,
									}}
								>
									<CartesianGrid strokeDasharray="3 3" vertical={false} />

									<XAxis
										dataKey="age"
										tickLine={false}
										axisLine={false}
										tickMargin={10}
									/>

									<YAxis
										tickLine={false}
										axisLine={false}
										width={70}
										tickFormatter={(value) =>
											compactCurrency.format(Number(value))
										}
									/>

									<Tooltip
										labelFormatter={(age) => `Age ${age}`}
										formatter={(value, name) => [
											currencyFormatter.format(Number(value)),
											name,
										]}
									/>

									<Legend />

									<ReferenceArea
										x1={estateFixture.longevity.lowerAge}
										x2={estateFixture.longevity.upperAge}
										fill="currentColor"
										fillOpacity={0.04}
										strokeOpacity={0}
									/>

									<ReferenceLine
										x={estateFixture.longevity.centralAge}
										strokeDasharray="4 4"
										label={{
											value: `Planning age ${estateFixture.longevity.centralAge}`,
											position: "insideTopRight",
										}}
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
										strokeOpacity={0.4}
										strokeWidth={1.5}
										dot={false}
									/>

									<Line
										type="monotone"
										dataKey="p75"
										name="75th percentile"
										stroke="currentColor"
										strokeOpacity={0.4}
										strokeWidth={1.5}
										dot={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>

						<div className="mt-5 gap-3 p-4 flex rounded-2xl bg-muted/40">
							<Info className="mt-0.5 h-4 w-4 shrink-0" />

							<p className="text-sm leading-6 text-muted-foreground">
								Projected estate here means projected household net worth. It is not
								a calculation of the legal estate that would pass through probate.
							</p>
						</div>
					</section>

					<section className="gap-6 lg:grid-cols-2 grid">
						<div className="p-6 rounded-3xl border bg-card">
							<h2 className="text-xl font-semibold">Estate resilience</h2>

							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								Your inheritance goal can look very different under central and less
								favourable financial outcomes.
							</p>

							<div className="mt-6 space-y-4">
								<div className="pb-4 flex items-center justify-between border-b">
									<div>
										<p className="font-medium">
											Median estate at age {central.age}
										</p>

										<p className="text-sm text-muted-foreground">
											Central financial outcome
										</p>
									</div>

									<p className="font-semibold">
										{compactCurrency.format(central.medianEstate)}
									</p>
								</div>

								<div className="pb-4 flex items-center justify-between border-b">
									<div>
										<p className="font-medium">
											25th percentile at age {central.age}
										</p>

										<p className="text-sm text-muted-foreground">
											Less favourable simulated outcome
										</p>
									</div>

									<p className="font-semibold">
										{compactCurrency.format(central.p25Estate)}
									</p>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">25th percentile goal position</p>

										<p className="text-sm text-muted-foreground">
											Relative to intended inheritance
										</p>
									</div>

									<p className="font-semibold">
										{formatSignedCurrency(
											estateFixture.goalComparison.p25SurplusOrShortfall,
										)}
									</p>
								</div>
							</div>
						</div>

						<div className="p-6 rounded-3xl border bg-card">
							<h2 className="text-xl font-semibold">Estate readiness</h2>

							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								These are recorded planning arrangements, not legal assessments of
								whether each document is valid or appropriate.
							</p>

							<div className="mt-6 space-y-4">
								<div className="pb-4 flex items-center justify-between border-b">
									<div className="gap-3 flex items-center">
										<FileText className="h-4 w-4 text-muted-foreground" />

										<span>Will</span>
									</div>

									<span
										className={`text-sm font-medium ${statusClass(
											estateFixture.planning.hasWill,
										)}`}
									>
										{statusLabel(estateFixture.planning.hasWill)}
									</span>
								</div>

								<div className="pb-4 flex items-center justify-between border-b">
									<div className="gap-3 flex items-center">
										<FileText className="h-4 w-4 text-muted-foreground" />

										<span>Enduring power of attorney</span>
									</div>

									<span
										className={`text-sm font-medium ${statusClass(
											estateFixture.planning.hasEnduringPowerOfAttorney,
										)}`}
									>
										{statusLabel(
											estateFixture.planning.hasEnduringPowerOfAttorney,
										)}
									</span>
								</div>

								<div className="flex items-center justify-between">
									<div className="gap-3 flex items-center">
										<FileText className="h-4 w-4 text-muted-foreground" />

										<span>Super beneficiary nomination</span>
									</div>

									<span
										className={`text-sm font-medium ${statusClass(
											estateFixture.planning.hasSuperBeneficiaryNomination,
										)}`}
									>
										{statusLabel(
											estateFixture.planning.hasSuperBeneficiaryNomination,
										)}
									</span>
								</div>
							</div>
						</div>
					</section>

					<section className="p-6 md:p-8 rounded-3xl border bg-card">
						<div className="gap-6 lg:grid-cols-3 grid">
							<div>
								<p className="text-sm text-muted-foreground">Current liabilities</p>

								<p className="mt-2 text-2xl font-semibold">
									{compactCurrency.format(estateFixture.current.liabilities)}
								</p>
							</div>

							<div>
								<p className="text-sm text-muted-foreground">Life cover recorded</p>

								<p className="mt-2 text-2xl font-semibold">
									{compactCurrency.format(
										estateFixture.current.lifeInsuranceCover,
									)}
								</p>
							</div>

							<div className="p-4 rounded-2xl bg-muted/40">
								<p className="text-sm font-medium">
									Protection is treated separately
								</p>

								<p className="mt-2 text-sm leading-6 text-muted-foreground">
									Life insurance is not added to your normal longevity estate
									projection. It will be assessed when Bioanalytix tests
									premature-death and dependency scenarios.
								</p>
							</div>
						</div>
					</section>

					<section className="gap-4 p-6 md:flex-row md:items-center md:justify-between flex flex-col rounded-3xl border bg-card">
						<div>
							<h2 className="text-lg font-semibold">Next: test the consequences</h2>

							<p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
								See how premature death, income interruption and a longer life
								affect your household plan.
							</p>
						</div>

						<div className="gap-3 flex flex-wrap">
							<Link
								href="/v2/plan"
								className="gap-2 px-4 py-2 text-sm font-medium inline-flex items-center rounded-xl border"
							>
								Open Plan
								<ArrowRight className="h-4 w-4" />
							</Link>

							<Link
								href="/v2/wealth"
								className="gap-2 px-4 py-2 text-sm font-medium inline-flex items-center rounded-xl border"
							>
								Review Wealth
							</Link>
						</div>
					</section>
				</div>
			</PageShell>
		</>
	);
}

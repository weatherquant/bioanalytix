"use client";

import { Activity, ArrowRight, Dna, Dumbbell, FlaskConical, Gauge, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { GeneticProfile } from "../../../types/genetics";
import { BioanalytixPageHero } from "../components/heroes/BioanalytixPageHero";
import { PerformanceHeroVisual } from "../components/heroes/PerformanceHeroVisual";
import { getGeneticProfile } from "../genetics/api";
import { buildPerformanceProfile, type PerformanceFinding } from "./performanceProfile";

function evidenceLabel(strength: PerformanceFinding["evidenceStrength"]): string {
	switch (strength) {
		case "established":
			return "Established evidence";
		case "strong":
			return "Strong evidence";
		case "moderate":
			return "Moderate evidence";
		case "limited":
			return "Limited evidence";
		case "insufficient":
			return "Insufficient evidence";
	}
}

export function PerformanceProfileClient() {
	const [geneticProfile, setGeneticProfile] = useState<GeneticProfile | null>(null);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		async function load() {
			try {
				const profile = await getGeneticProfile();

				if (active) {
					setGeneticProfile(profile);
				}
			} catch {
				if (active) {
					setError("Unable to load your performance profile.");
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		}

		void load();

		return () => {
			active = false;
		};
	}, []);

	if (loading) {
		return (
			<div className="p-8 text-sm text-muted-foreground">
				Loading your performance evidence…
			</div>
		);
	}

	if (error) {
		return <div className="p-8 text-sm text-muted-foreground">{error}</div>;
	}

	const profile = buildPerformanceProfile(geneticProfile);

	return (
		<div className="space-y-6">
			<BioanalytixPageHero
				eyebrow="YOUR PERFORMANCE. INFORMED BY EVIDENCE."
				title="What might your biology tell you about your performance?"
				description="Explore how governed genetic evidence may contribute to strength, endurance, recovery and other dimensions of physical performance."
				secondaryDescription="Bioanalytix brings these signals together as evidence to explore — not as a verdict on your athletic ability or potential."
				visual={<PerformanceHeroVisual />}
			/>

			{!profile.hasGeneticData ? (
				<section className="p-6 sm:p-8 rounded-3xl border bg-card">
					<div className="max-w-2xl">
						<Dna size={24} />

						<h2 className="mt-5 text-xl font-semibold">
							Add your DNA to explore performance evidence
						</h2>

						<p className="mt-3 text-sm leading-6 text-muted-foreground">
							Performance interpretations are generated only from genetic evidence
							actually available in your Bioanalytix profile.
						</p>

						<Link
							href="/v2/dna"
							className="mt-5 gap-2 text-sm font-medium inline-flex items-center"
						>
							Go to My DNA
							<ArrowRight size={15} />
						</Link>
					</div>
				</section>
			) : profile.findings.length === 0 ? (
				<section className="p-6 sm:p-8 rounded-3xl border bg-card">
					<div className="max-w-2xl">
						<FlaskConical size={24} />

						<h2 className="mt-5 text-xl font-semibold">
							No governed performance findings yet
						</h2>

						<p className="mt-3 text-sm leading-6 text-muted-foreground">
							Your genetic profile is available, but none of the models currently
							approved for the Performance experience produced a finding. Bioanalytix
							does not manufacture performance conclusions from unrelated genetic
							results.
						</p>
					</div>
				</section>
			) : (
				<>
					<section className="gap-4 md:grid-cols-3 grid">
						<div className="p-5 rounded-2xl border bg-card">
							<Dumbbell size={19} />

							<p className="mt-4 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
								Performance findings
							</p>

							<p className="mt-2 text-2xl font-semibold">
								{profile.summary.performanceFindings}
							</p>

							<p className="mt-2 text-xs leading-5 text-muted-foreground">
								Governed genetic findings currently relevant to Performance.
							</p>
						</div>

						<div className="p-5 rounded-2xl border bg-card">
							<Gauge size={19} />

							<p className="mt-4 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
								Strongest evidence
							</p>

							<p className="mt-2 text-2xl font-semibold">
								{profile.summary.establishedOrStrongFindings}
							</p>

							<p className="mt-2 text-xs leading-5 text-muted-foreground">
								Findings currently classified as established or strong.
							</p>
						</div>

						<div className="p-5 rounded-2xl border bg-card">
							<FlaskConical size={19} />

							<p className="mt-4 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
								Moderate evidence
							</p>

							<p className="mt-2 text-2xl font-semibold">
								{profile.summary.moderateFindings}
							</p>

							<p className="mt-2 text-xs leading-5 text-muted-foreground">
								Useful evidence that still requires careful interpretation.
							</p>
						</div>
					</section>

					{profile.areas.map((area) => (
						<section
							key={area.area.id}
							className="p-6 sm:p-8 rounded-3xl border bg-card"
						>
							<div className="mb-6">
								<h2 className="text-xl font-semibold">{area.area.label}</h2>

								<p className="mt-2 text-sm leading-6 text-muted-foreground">
									{area.area.description}
								</p>
							</div>

							<div className="space-y-4">
								{area.findings.map((finding) => (
									<article
										key={finding.id}
										className="p-5 sm:p-6 rounded-2xl border"
									>
										<div className="gap-4 sm:flex-row sm:items-start sm:justify-between flex flex-col">
											<div>
												<h3 className="font-semibold">{finding.title}</h3>

												<p className="mt-2 text-sm leading-6 text-muted-foreground">
													{finding.summary}
												</p>
											</div>

											<span className="px-3 py-1 text-xs shrink-0 rounded-full border text-muted-foreground">
												{evidenceLabel(finding.evidenceStrength)}
											</span>
										</div>

										<div className="mt-5 p-4 rounded-xl bg-muted/40">
											<p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
												What the evidence means
											</p>

											<p className="mt-2 text-sm leading-6">
												{finding.explanation}
											</p>
										</div>

										{finding.limitations.length > 0 ? (
											<div className="mt-5">
												<p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
													Important limitations
												</p>

												<ul className="mt-3 space-y-2">
													{finding.limitations.map((limitation) => (
														<li
															key={limitation}
															className="gap-2 text-sm leading-6 flex text-muted-foreground"
														>
															<Info
																size={15}
																className="mt-1 shrink-0"
															/>
															<span>{limitation}</span>
														</li>
													))}
												</ul>
											</div>
										) : null}

										<div className="mt-5 gap-x-5 gap-y-2 pt-4 text-xs flex flex-wrap border-t text-muted-foreground">
											<span>Model {finding.model.id}</span>
											<span>Version {finding.model.version}</span>
											<span>
												{finding.provenance.evidenceIds.length} evidence
												source(s)
											</span>
										</div>
									</article>
								))}
							</div>
						</section>
					))}
				</>
			)}

			<section className="p-6 sm:p-8 rounded-3xl border bg-card">
				<div className="gap-6 lg:grid-cols-[0.8fr_1.2fr] grid">
					<div>
						<p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
							Beyond genetics
						</p>

						<h2 className="mt-3 text-xl font-semibold">
							Performance is observed, not inferred from DNA alone
						</h2>
					</div>

					<div className="gap-3 sm:grid-cols-2 grid">
						{[
							["Genetics", "Inherited biological evidence"],
							["Performance", "Observed strength, endurance and capacity"],
							["Physiology", "Measurements such as VO₂max and body composition"],
							["Lifestyle", "Training, recovery, sleep and nutrition"],
						].map(([title, description]) => (
							<div key={title} className="p-4 rounded-xl border">
								<p className="text-sm font-medium">{title}</p>
								<p className="mt-1 text-xs leading-5 text-muted-foreground">
									{description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}

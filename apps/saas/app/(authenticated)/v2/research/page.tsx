"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowUpRight,
	BookOpen,
	CircleAlert,
	Dna,
	FlaskConical,
	Lightbulb,
	Microscope,
	Sparkles,
} from "lucide-react";

import { AppHeader } from "../../../../modules/bioanalytix/components/AppHeader";
import { PageShell } from "../../../../modules/bioanalytix/components/PageShell";
import { orpcClient } from "../../../../modules/shared/lib/orpc-client";

function formatSignal(value: string) {
	switch (value) {
		case "worth_following":
			return "Worth following";
		case "established_evidence":
			return "Established evidence";
		default:
			return "Worth knowing";
	}
}

function formatEvidenceType(value: string) {
	switch (value) {
		case "systematic_review":
			return "Systematic review";
		case "meta_analysis":
			return "Meta-analysis";
		case "clinical_guideline":
			return "Clinical guideline";
		case "cohort_study":
			return "Cohort study";
		case "clinical_trial":
			return "Clinical trial";
		default:
			return "Research";
	}
}

type ResearchItem = {
	id: string;
	title: string;
	source: string;
	publicationDate: string;
	url: string;
	summary: string;
	whyItMatters: string;
	takeaway: string;
	topics: string[];
	relatedGenes: string[];
	evidenceType: string;
	signal: string;
	limitations: string[];
};

function ResearchCard({
	item,
	personalised = false,
}: {
	item: ResearchItem;
	personalised?: boolean;
}) {
	return (
		<article className="p-6 flex h-full flex-col rounded-3xl border bg-card">
			<div className="gap-2 flex flex-wrap items-center">
				<span className="gap-1.5 px-2.5 py-1 text-xs font-medium inline-flex items-center rounded-full border">
					{personalised ? (
						<Dna className="size-3.5" />
					) : (
						<Microscope className="size-3.5" />
					)}

					{personalised ? "Related to your profile" : "Research"}
				</span>

				<span className="px-2.5 py-1 text-xs rounded-full bg-muted text-muted-foreground">
					{formatSignal(item.signal)}
				</span>
			</div>

			<div className="mt-5">
				<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					{item.source} · {item.publicationDate} · {formatEvidenceType(item.evidenceType)}
				</p>

				<h3 className="mt-2 text-xl font-semibold leading-snug">{item.title}</h3>

				<p className="mt-3 text-sm leading-6 text-muted-foreground">{item.summary}</p>
			</div>

			{personalised ? (
				<div className="mt-5 p-4 rounded-2xl bg-muted/50">
					<div className="gap-2 text-sm font-medium flex items-center">
						<Lightbulb className="size-4" />
						Why you&apos;re seeing this
					</div>

					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						{item.whyItMatters}
					</p>
				</div>
			) : null}

			<div className="mt-5">
				<p className="text-sm font-medium">What to take from it</p>

				<p className="mt-2 text-sm leading-6 text-muted-foreground">{item.takeaway}</p>
			</div>

			<div className="mt-5 gap-2 flex flex-wrap">
				{item.topics.map((topic) => (
					<span
						key={topic}
						className="px-2.5 py-1 text-xs rounded-full border text-muted-foreground"
					>
						{topic}
					</span>
				))}
			</div>

			<div className="pt-6 mt-auto">
				<a
					href={item.url}
					target="_blank"
					rel="noreferrer"
					className="gap-1.5 text-sm font-medium inline-flex items-center hover:underline"
				>
					Read the research
					<ArrowUpRight className="size-4" />
				</a>
			</div>
		</article>
	);
}

export default function ResearchPage() {
	const researchQuery = useQuery({
		queryKey: ["bioanalytix", "research"],
		queryFn: () => orpcClient.bioanalytix.research.get(),
	});

	if (researchQuery.isPending) {
		return (
			<>
				<AppHeader title="Research" description="Research that may matter to you." />

				<PageShell>
					<div className="p-8 text-sm rounded-3xl border bg-card text-muted-foreground">
						Connecting your profile with current research…
					</div>
				</PageShell>
			</>
		);
	}

	if (researchQuery.isError) {
		return (
			<>
				<AppHeader title="Research" description="Research that may matter to you." />

				<PageShell>
					<div className="p-8 rounded-3xl border bg-card">
						<p className="font-medium">We couldn&apos;t load Research.</p>

						<p className="mt-2 text-sm text-muted-foreground">
							Please try again in a moment.
						</p>
					</div>
				</PageShell>
			</>
		);
	}

	const response = researchQuery.data;

	return (
		<>
			<AppHeader title="Research" description="Research that may matter to you." />

			<PageShell>
				<div className="space-y-8">
					<section className="overflow-hidden rounded-3xl border bg-card">
						<div className="p-8 md:p-10">
							<div className="max-w-3xl gap-2 text-sm font-medium flex items-center text-muted-foreground">
								<Sparkles className="size-4" />
								Your research pathways
							</div>

							<h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
								Follow the science connected to your profile.
							</h1>

							<p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
								Bioanalytix helps you follow research related to your genetic
								profile, health and longevity — in plain language, with the limits
								of the science kept in view.
							</p>

							<div className="mt-8 gap-3 sm:grid-cols-3 grid">
								<div className="p-4 rounded-2xl border bg-background/50">
									<div className="gap-2 text-sm flex items-center text-muted-foreground">
										<Dna className="size-4" />
										Genetic insights
									</div>

									<p className="mt-2 text-2xl font-semibold">
										{response.profile.geneticInsights}
									</p>
								</div>

								<div className="p-4 rounded-2xl border bg-background/50">
									<div className="gap-2 text-sm flex items-center text-muted-foreground">
										<BookOpen className="size-4" />
										Research matches
									</div>

									<p className="mt-2 text-2xl font-semibold">
										{response.profile.matchedResearch}
									</p>
								</div>

								<div className="p-4 rounded-2xl border bg-background/50">
									<div className="gap-2 text-sm flex items-center text-muted-foreground">
										<FlaskConical className="size-4" />
										Related topics
									</div>

									<p className="mt-2 text-2xl font-semibold">
										{response.profile.matchedTopics.length}
									</p>
								</div>
							</div>
						</div>
					</section>

					{response.forYou.length > 0 ? (
						<section>
							<div className="max-w-3xl">
								<p className="text-sm font-medium text-muted-foreground">For you</p>

								<h2 className="mt-1 text-2xl font-semibold">
									Connected to your genetic profile
								</h2>

								<p className="mt-2 text-sm leading-6 text-muted-foreground">
									These research pathways concern genes or biological topics
									represented in your Bioanalytix profile. A match does not mean a
									study&apos;s findings apply personally to you.
								</p>
							</div>

							<div className="mt-5 gap-5 lg:grid-cols-2 grid">
								{response.forYou.map((item) => (
									<ResearchCard key={item.id} item={item} personalised />
								))}
							</div>
						</section>
					) : (
						<section className="p-7 rounded-3xl border bg-card">
							<div className="gap-3 flex items-start">
								<Dna className="mt-0.5 size-5 text-muted-foreground" />

								<div>
									<h2 className="font-semibold">
										No profile-specific research yet
									</h2>

									<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
										As Bioanalytix expands its research library, developments
										related to your genetic profile can appear here.
									</p>
								</div>
							</div>
						</section>
					)}

					{response.latest.length > 0 ? (
						<section>
							<div className="max-w-3xl">
								<p className="text-sm font-medium text-muted-foreground">Explore</p>

								<h2 className="mt-1 text-2xl font-semibold">
									Genetics, healthy ageing & longevity
								</h2>

								<p className="mt-2 text-sm leading-6 text-muted-foreground">
									Broader research Bioanalytix is following because it may shape
									how we think about healthspan, longevity and long-term planning.
								</p>
							</div>

							<div className="mt-5 gap-5 lg:grid-cols-2 grid">
								{response.latest.map((item) => (
									<ResearchCard key={item.id} item={item} />
								))}
							</div>
						</section>
					) : null}

					<section className="p-6 md:p-7 rounded-3xl border bg-card">
						<div className="gap-3 flex items-start">
							<CircleAlert className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

							<div>
								<h2 className="font-semibold">{response.guardrails.title}</h2>

								<p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
									{response.guardrails.message}
								</p>

								<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
									A new paper is a reason to become better informed, not
									automatically a reason to become more worried.
								</p>
							</div>
						</div>
					</section>
				</div>
			</PageShell>
		</>
	);
}

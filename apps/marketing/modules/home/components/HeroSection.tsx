"use client";

import { config } from "@config";
import { Button } from "@repo/ui/components/button";
import {
	ArrowRightIcon,
	BrainCircuitIcon,
	ChartNoAxesCombinedIcon,
	DnaIcon,
	ShieldCheckIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

export function HeroSection() {
	const t = useTranslations();

	const signupUrl = `${config.saasUrl}/signup`;

	return (
		<section className="relative max-w-full overflow-hidden bg-linear-to-t from-background via-primary/5 to-background">
			<div className="py-16 md:py-24 lg:py-28 relative z-20 container text-center">
				<div className="mb-5 flex justify-center">
					<div className="px-3 py-1 text-sm font-medium rounded-full bg-muted text-foreground">
						{t("home.hero.featureBadge")}
					</div>
				</div>

				<h1 className="max-w-4xl text-4xl font-medium leading-tight md:text-5xl lg:text-6xl xl:text-7xl mx-auto text-balance text-foreground">
					{t("home.hero.title")}
				</h1>

				<p className="mt-5 max-w-3xl text-base leading-7 sm:text-lg mx-auto text-balance text-foreground/60">
					{t("home.hero.subtitle")}
				</p>

				<div className="mt-7 gap-3 flex flex-wrap items-center justify-center">
					<Button size="lg" variant="primary" asChild>
						<a href={`${config.saasUrl}/signup?intent=dna`}>
							{t("home.hero.getStarted")}
							<ArrowRightIcon className="ml-2 size-4" />
						</a>
					</Button>

					<Button variant="secondary" size="lg" asChild>
						<a href={signupUrl}>{t("home.hero.learnMore")}</a>
					</Button>
				</div>

				<p className="mt-4 text-sm text-foreground/50">{t("home.hero.noDnaRequired")}</p>

				<div className="mt-14 max-w-5xl gap-4 md:grid-cols-3 mx-auto grid text-left">
					<div className="p-6 rounded-3xl border bg-card">
						<div className="size-10 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
							<ChartNoAxesCombinedIcon className="size-5" />
						</div>
						<p className="mt-5 text-sm font-medium text-muted-foreground">
							01 · Your biology
						</p>
						<h2 className="mt-1 text-xl font-semibold">
							Start with evidence about you
						</h2>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Bring genetic evidence relevant to longevity, health and biological
							resilience into the planning process.
						</p>
					</div>

					<div className="p-6 rounded-3xl border bg-card">
						<div className="size-10 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
							<DnaIcon className="size-5" />
						</div>
						<p className="mt-5 text-sm font-medium text-muted-foreground">
							02 · Longevity
						</p>
						<h2 className="mt-1 text-xl font-semibold">
							Model uncertainty, not certainty
						</h2>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Explore different longevity assumptions without pretending that genetics
							can determine exactly how long you will live.
						</p>
					</div>

					<div className="p-6 rounded-3xl border bg-card">
						<div className="size-10 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
							<BrainCircuitIcon className="size-5" />
						</div>
						<p className="mt-5 text-sm font-medium text-muted-foreground">
							03 · Your finances
						</p>
						<h2 className="mt-1 text-xl font-semibold">
							See what different futures could mean
						</h2>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Explore the implications for retirement, spending, wealth resilience and
							estate planning — then decide which assumptions belong in your plan.
						</p>
					</div>
				</div>

				<div className="mt-5 max-w-5xl gap-3 p-4 mx-auto flex items-start rounded-2xl border bg-background/60 text-left">
					<ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-primary" />
					<p className="text-sm leading-6 text-muted-foreground">
						Genetic evidence can make planning questions more relevant. It does not
						determine your lifespan, retirement age or financial decisions.
					</p>
				</div>
			</div>
		</section>
	);
}

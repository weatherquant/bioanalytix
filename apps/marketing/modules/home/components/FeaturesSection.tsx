"use client";

import {
	BookOpenCheckIcon,
	ChartSplineIcon,
	DnaIcon,
	HeartPulseIcon,
	LandmarkIcon,
	MessageCircleQuestionIcon,
	ShieldCheckIcon,
	SparklesIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

export function FeaturesSection() {
	const t = useTranslations();

	const features = [
		{
			icon: LandmarkIcon,
			title: t("home.features.financial.title"),
			description: t("home.features.financial.description"),
		},
		{
			icon: HeartPulseIcon,
			title: t("home.features.longevity.title"),
			description: t("home.features.longevity.description"),
		},
		{
			icon: ShieldCheckIcon,
			title: t("home.features.estate.title"),
			description: t("home.features.estate.description"),
		},
		{
			icon: DnaIcon,
			title: t("home.features.genetics.title"),
			description: t("home.features.genetics.description"),
		},
		{
			icon: BookOpenCheckIcon,
			title: t("home.features.research.title"),
			description: t("home.features.research.description"),
		},
		{
			icon: MessageCircleQuestionIcon,
			title: t("home.features.ask.title"),
			description: t("home.features.ask.description"),
		},
	];

	return (
		<section id="features" className="scroll-my-20 py-16 lg:py-24">
			<div className="container">
				<div className="mb-20 max-w-5xl mx-auto">
					<div className="max-w-3xl mx-auto text-center">
						<p className="text-xs font-medium tracking-wider text-primary uppercase">
							The longevity problem
						</p>

						<h2 className="mt-4 text-3xl font-medium lg:text-4xl xl:text-5xl">
							Your financial plan already contains a longevity assumption.
						</h2>

						<p className="mt-4 text-lg leading-8 text-muted-foreground">
							The question is how much information should inform it. Long-term
							financial planning often starts with population averages or fixed
							planning ages, while actual longevity varies substantially between
							people.
						</p>
					</div>

					<div className="mt-10 gap-5 md:grid-cols-2 grid">
						<div className="p-7 rounded-3xl border bg-card">
							<p className="text-sm font-medium text-muted-foreground">
								Conventional starting point
							</p>

							<h3 className="mt-2 text-xl font-semibold">Population assumptions</h3>

							<div className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
								<p>Population life expectancy and actuarial averages</p>
								<p>Fixed retirement and planning horizons</p>
								<p>Limited connection to individual biological variability</p>
							</div>
						</div>

						<div className="p-7 rounded-3xl border bg-primary/5">
							<p className="text-sm font-medium text-primary">Bioanalytix</p>

							<h3 className="mt-2 text-xl font-semibold">
								Make longevity uncertainty personal
							</h3>

							<div className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
								<p>Start with evidence relevant to your biology</p>
								<p>Explore alternative longevity assumptions explicitly</p>
								<p>See how those assumptions change long-term financial outcomes</p>
							</div>
						</div>
					</div>
				</div>
				<div className="max-w-3xl mx-auto text-center">
					<small className="mb-4 text-xs font-medium tracking-wider block text-primary uppercase">
						{t("home.features.badge")}
					</small>

					<h2 className="text-3xl font-medium lg:text-4xl xl:text-5xl">
						{t("home.features.title")}
					</h2>

					<p className="mt-3 text-base leading-7 lg:text-lg text-balance text-foreground/60">
						{t("home.features.description")}
					</p>
				</div>

				<div className="mt-10 max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3 mx-auto grid">
					{features.map((feature) => (
						<div key={feature.title} className="p-6 rounded-3xl border bg-card">
							<div className="size-10 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<feature.icon className="size-5" />
							</div>

							<h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>

							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								{feature.description}
							</p>
						</div>
					))}
				</div>

				<div className="mt-20 max-w-5xl mx-auto">
					<div className="max-w-3xl mx-auto text-center">
						<p className="text-xs font-medium tracking-wider text-primary uppercase">
							Your DNA, your choice
						</p>

						<h2 className="mt-4 text-3xl font-medium lg:text-4xl xl:text-5xl">
							Already have your DNA? Put it to work.
						</h2>

						<p className="mt-4 text-lg leading-8 text-muted-foreground">
							Genetic testing can produce information that extends beyond ancestry.
							Bioanalytix connects supported genetic evidence to longevity and
							health-related questions that can matter to long-term planning.
						</p>
					</div>

					<div className="mt-10 gap-4 md:grid-cols-3 grid">
						<div className="p-6 rounded-3xl border bg-card">
							<DnaIcon className="size-5 text-primary" />

							<h3 className="mt-5 text-lg font-semibold">
								I already have DNA results
							</h3>

							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								Bring supported raw genetic data into Bioanalytix Individual and
								connect relevant evidence to your planning picture.
							</p>
						</div>

						<div className="p-6 rounded-3xl border bg-card">
							<HeartPulseIcon className="size-5 text-primary" />

							<h3 className="mt-5 text-lg font-semibold">I need a DNA test</h3>

							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								A future Bioanalytix testing pathway will help you arrange a
								compatible DNA test and bring the resulting data into your profile.
							</p>

							<p className="mt-4 text-xs font-medium tracking-wider text-muted-foreground uppercase">
								Coming soon
							</p>
						</div>

						<div className="p-6 rounded-3xl border bg-card">
							<SparklesIcon className="size-5 text-primary" />

							<h3 className="mt-5 text-lg font-semibold">I'm not ready for DNA</h3>

							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								Start with Bioanalytix Free. Build your financial planning
								foundation now and add biological evidence later.
							</p>
						</div>
					</div>

					<div className="mt-5 p-5 rounded-2xl border bg-background">
						<p className="text-sm leading-6 text-muted-foreground">
							<strong className="font-medium text-foreground">Coming later:</strong>{" "}
							the same governed genetic evidence can support additional perspectives
							such as performance, endurance, metabolism and recovery — without
							treating genetic predisposition as athletic ability.
						</p>
					</div>
				</div>

				<div className="mt-10 max-w-5xl gap-4 lg:grid-cols-2 mx-auto grid">
					<div className="p-7 rounded-3xl border bg-primary/5">
						<SparklesIcon className="size-5 text-primary" />

						<p className="mt-4 text-sm font-medium text-primary">Bioanalytix Free</p>

						<h3 className="mt-1 text-xl font-semibold">
							Start with the financial plan
						</h3>

						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Build the conventional planning foundation first. You don't need DNA to
							begin understanding your wealth, retirement, longevity and estate
							position.
						</p>
					</div>

					<div className="p-7 rounded-3xl border bg-primary/5">
						<ChartSplineIcon className="size-5 text-primary" />

						<p className="mt-4 text-sm font-medium text-primary">
							Bioanalytix Individual
						</p>

						<h3 className="mt-1 text-xl font-semibold">Then add biological context</h3>

						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Connect governed genetic evidence and personalised research to the
							planning questions that may deserve more attention.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

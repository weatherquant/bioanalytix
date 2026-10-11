"use client";

import {
        ArrowRightIcon,
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
                        number: "01",
                },
                {
                        icon: HeartPulseIcon,
                        title: t("home.features.longevity.title"),
                        description: t("home.features.longevity.description"),
                        number: "02",
                },
                {
                        icon: ShieldCheckIcon,
                        title: t("home.features.estate.title"),
                        description: t("home.features.estate.description"),
                        number: "03",
                },
                {
                        icon: DnaIcon,
                        title: t("home.features.genetics.title"),
                        description: t("home.features.genetics.description"),
                        number: "04",
                },
                {
                        icon: BookOpenCheckIcon,
                        title: t("home.features.research.title"),
                        description: t("home.features.research.description"),
                        number: "05",
                },
                {
                        icon: MessageCircleQuestionIcon,
                        title: t("home.features.ask.title"),
                        description: t("home.features.ask.description"),
                        number: "06",
                },
        ];

        return (
                <section id="features" className="scroll-my-20">
                        <div className="border-b py-20 lg:py-28">
                                <div className="container">
                                        <div className="mx-auto max-w-3xl text-center">
                                                <p className="text-xs font-semibold tracking-[0.18em] text-orange-700 uppercase dark:text-orange-400">
                                                        The longevity problem
                                                </p>

                                                <h2 className="mt-4 text-3xl font-medium tracking-tight lg:text-4xl xl:text-5xl">
                                                        Your financial plan already contains a longevity assumption.
                                                </h2>

                                                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                                                        The question is how much information should inform it. Long-term
                                                        financial planning often starts with population averages or fixed
                                                        planning ages, while actual longevity varies substantially between
                                                        people.
                                                </p>
                                        </div>

                                        <div className="mx-auto mt-12 grid max-w-6xl overflow-hidden rounded-3xl border md:grid-cols-2">
                                                <div className="relative bg-muted/25 p-7 md:p-9 lg:p-10">
                                                        <div className="flex items-center gap-3">
                                                                <div className="flex size-10 items-center justify-center rounded-2xl border bg-background text-muted-foreground">
                                                                        <LandmarkIcon className="size-5" />
                                                                </div>
                                                                <p className="text-sm font-medium text-muted-foreground">
                                                                        Conventional starting point
                                                                </p>
                                                        </div>

                                                        <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                                                                Population assumptions
                                                        </h3>

                                                        <div className="mt-7 space-y-5">
                                                                {[
                                                                        "Population life expectancy and actuarial averages",
                                                                        "Fixed retirement and planning horizons",
                                                                        "Limited connection to individual biological variability",
                                                                ].map((item) => (
                                                                        <div key={item} className="flex gap-3">
                                                                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/25" />
                                                                                <p className="text-sm leading-6 text-muted-foreground">
                                                                                        {item}
                                                                                </p>
                                                                        </div>
                                                                ))}
                                                        </div>
                                                </div>

                                                <div className="relative border-t border-orange-500/15 bg-orange-500/[0.045] p-7 md:border-l md:border-t-0 md:p-9 lg:p-10">
                                                        <div
                                                                className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-500/60 to-transparent md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-px md:bg-linear-to-b"
                                                                aria-hidden="true"
                                                        />

                                                        <div className="flex items-center gap-3">
                                                                <div className="flex size-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-700 dark:text-orange-400">
                                                                        <DnaIcon className="size-5" />
                                                                </div>
                                                                <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                                                                        Bioanalytix
                                                                </p>
                                                        </div>

                                                        <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                                                                Make longevity uncertainty personal
                                                        </h3>

                                                        <div className="mt-7 space-y-5">
                                                                {[
                                                                        "Start with evidence relevant to your biology",
                                                                        "Explore alternative longevity assumptions explicitly",
                                                                        "See how those assumptions change long-term financial outcomes",
                                                                ].map((item) => (
                                                                        <div key={item} className="flex gap-3">
                                                                                <ArrowRightIcon className="mt-1 size-4 shrink-0 text-orange-700 dark:text-orange-400" />
                                                                                <p className="text-sm leading-6 text-muted-foreground">
                                                                                        {item}
                                                                                </p>
                                                                        </div>
                                                                ))}
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>

                        <div className="py-20 lg:py-28">
                                <div className="container">
                                        <div className="mx-auto max-w-3xl text-center">
                                                <small className="mb-4 block text-xs font-semibold tracking-[0.18em] text-orange-700 uppercase dark:text-orange-400">
                                                        {t("home.features.badge")}
                                                </small>

                                                <h2 className="text-3xl font-medium tracking-tight lg:text-4xl xl:text-5xl">
                                                        {t("home.features.title")}
                                                </h2>

                                                <p className="mt-4 text-balance text-base leading-7 text-foreground/60 lg:text-lg">
                                                        {t("home.features.description")}
                                                </p>
                                        </div>

                                        <div className="mx-auto mt-12 grid max-w-6xl overflow-hidden rounded-3xl border md:grid-cols-2 lg:grid-cols-3">
                                                {features.map((feature, index) => (
                                                        <div
                                                                key={feature.title}
                                                                className={[
                                                                        "group relative min-h-64 bg-card p-7 transition-colors hover:bg-orange-500/[0.025]",
                                                                        index % 3 !== 2 ? "lg:border-r" : "",
                                                                        index < 3 ? "lg:border-b" : "",
                                                                        index % 2 === 0 ? "md:border-r lg:border-r" : "",
                                                                        index < 4 ? "md:border-b" : "",
                                                                ].join(" ")}
                                                        >
                                                                <div className="flex items-start justify-between">
                                                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-700 dark:text-orange-400">
                                                                                <feature.icon className="size-5" />
                                                                        </div>

                                                                        <span className="font-mono text-xs tracking-[0.16em] text-foreground/25">
                                                                                {feature.number}
                                                                        </span>
                                                                </div>

                                                                <h3 className="mt-7 text-lg font-semibold tracking-tight">
                                                                        {feature.title}
                                                                </h3>

                                                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                                                        {feature.description}
                                                                </p>
                                                        </div>
                                                ))}
                                        </div>
                                </div>
                        </div>

                        <div className="border-y bg-muted/20 py-20 lg:py-28">
                                <div className="container">
                                        <div className="mx-auto max-w-3xl text-center">
                                                <p className="text-xs font-semibold tracking-[0.18em] text-orange-700 uppercase dark:text-orange-400">
                                                        Your DNA, your choice
                                                </p>

                                                <h2 className="mt-4 text-3xl font-medium tracking-tight lg:text-4xl xl:text-5xl">
                                                        Already have your DNA? Put it to work.
                                                </h2>

                                                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                                                        Genetic testing can produce information that extends beyond ancestry.
                                                        Bioanalytix connects supported genetic evidence to longevity and
                                                        health-related questions that can matter to long-term planning.
                                                </p>
                                        </div>

                                        <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
                                                <div className="relative overflow-hidden rounded-3xl border border-orange-500/25 bg-background p-7 shadow-sm">
                                                        <div className="absolute inset-x-0 top-0 h-1 bg-orange-600" />
                                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-700 dark:text-orange-400">
                                                                <DnaIcon className="size-5" />
                                                        </div>

                                                        <p className="mt-7 text-xs font-semibold tracking-[0.14em] text-orange-700 uppercase dark:text-orange-400">
                                                                Ready now
                                                        </p>

                                                        <h3 className="mt-2 text-xl font-semibold">
                                                                I already have DNA results
                                                        </h3>

                                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                                                Bring supported raw genetic data into Bioanalytix Individual and
                                                                connect relevant evidence to your planning picture.
                                                        </p>
                                                </div>

                                                <div className="rounded-3xl border bg-background p-7">
                                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-foreground/5 text-foreground/70">
                                                                <HeartPulseIcon className="size-5" />
                                                        </div>

                                                        <p className="mt-7 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                                                Coming soon
                                                        </p>

                                                        <h3 className="mt-2 text-xl font-semibold">
                                                                I need a DNA test
                                                        </h3>

                                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                                                A future Bioanalytix testing pathway will help you arrange a
                                                                compatible DNA test and bring the resulting data into your profile.
                                                        </p>
                                                </div>

                                                <div className="rounded-3xl border bg-background p-7">
                                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-foreground/5 text-foreground/70">
                                                                <SparklesIcon className="size-5" />
                                                        </div>

                                                        <p className="mt-7 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                                                Start without DNA
                                                        </p>

                                                        <h3 className="mt-2 text-xl font-semibold">
                                                                I'm not ready for DNA
                                                        </h3>

                                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                                                Start with Bioanalytix Free. Build your financial planning
                                                                foundation now and add biological evidence later.
                                                        </p>
                                                </div>
                                        </div>

                                        <div className="mx-auto mt-5 max-w-6xl rounded-2xl border bg-background/80 p-5">
                                                <p className="text-sm leading-6 text-muted-foreground">
                                                        <strong className="font-medium text-foreground">
                                                                A broader biological picture over time:
                                                        </strong>{" "}
                                                        governed genetic evidence can support additional perspectives such as
                                                        performance, endurance, metabolism and recovery - without treating
                                                        genetic predisposition as athletic ability.
                                                </p>
                                        </div>

                                        <div className="mx-auto mt-12 grid max-w-6xl overflow-hidden rounded-3xl border lg:grid-cols-2">
                                                <div className="p-7 md:p-9">
                                                        <div className="flex items-center gap-3">
                                                                <SparklesIcon className="size-5 text-muted-foreground" />
                                                                <p className="text-sm font-medium text-muted-foreground">
                                                                        Bioanalytix Free
                                                                </p>
                                                        </div>

                                                        <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                                                                Start with the financial plan
                                                        </h3>

                                                        <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                                                                Build the conventional planning foundation first. You don't need DNA
                                                                to begin understanding your wealth, retirement, longevity and estate
                                                                position.
                                                        </p>
                                                </div>

                                                <div className="relative border-t bg-orange-500/[0.04] p-7 md:p-9 lg:border-l lg:border-t-0">
                                                        <div className="flex items-center gap-3">
                                                                <ChartSplineIcon className="size-5 text-orange-700 dark:text-orange-400" />
                                                                <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                                                                        Bioanalytix Individual
                                                                </p>
                                                        </div>

                                                        <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                                                                Then add biological context
                                                        </h3>

                                                        <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                                                                Connect governed genetic evidence and personalised research to the
                                                                planning questions that may deserve more attention.
                                                        </p>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </section>
        );
}

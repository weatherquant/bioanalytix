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

const journey = [
        {
                number: "01",
                label: "Your biology",
                title: "Start with evidence about you",
                description:
                        "Bring genetic evidence relevant to longevity, health and biological resilience into the planning process.",
                icon: DnaIcon,
        },
        {
                number: "02",
                label: "Longevity",
                title: "Model uncertainty, not certainty",
                description:
                        "Explore different longevity assumptions without pretending that genetics can determine exactly how long you will live.",
                icon: BrainCircuitIcon,
        },
        {
                number: "03",
                label: "Your finances",
                title: "See what different futures could mean",
                description:
                        "Explore the implications for retirement, spending, wealth resilience and estate planning - then decide which assumptions belong in your plan.",
                icon: ChartNoAxesCombinedIcon,
        },
];

export function HeroSection() {
        const t = useTranslations();
        const signupUrl = `${config.saasUrl}/signup`;

        return (
                <section className="relative max-w-full overflow-hidden border-b bg-background">
                        <div
                                className="pointer-events-none absolute inset-0"
                                aria-hidden="true"
                        >
                                <div className="absolute -left-32 -top-48 size-[34rem] rounded-full bg-orange-500/10 blur-3xl" />
                                <div className="absolute -right-48 top-20 size-[32rem] rounded-full bg-orange-200/20 blur-3xl dark:bg-orange-900/10" />
                                <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-orange-500/30 to-transparent" />
                        </div>

                        <div className="relative z-20 container py-16 text-center md:py-24 lg:py-28">
                                <div className="mb-6 flex justify-center">
                                        <div className="flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-3.5 py-1.5 text-sm font-medium text-foreground">
                                                <span className="size-1.5 rounded-full bg-orange-600" />
                                                {t("home.hero.featureBadge")}
                                        </div>
                                </div>

                                <h1 className="mx-auto max-w-5xl text-balance text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl">
                                        {t("home.hero.title")}
                                </h1>

                                <p className="mx-auto mt-6 max-w-3xl text-balance text-base leading-7 text-foreground/60 sm:text-lg">
                                        {t("home.hero.subtitle")}
                                </p>

                                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                        <Button
                                                size="lg"
                                                className="bg-orange-600 text-white hover:bg-orange-700"
                                                asChild
                                        >
                                                <a href={`${config.saasUrl}/signup?intent=dna`}>
                                                        {t("home.hero.getStarted")}
                                                        <ArrowRightIcon className="ml-2 size-4" />
                                                </a>
                                        </Button>

                                        <Button variant="secondary" size="lg" asChild>
                                                <a href={signupUrl}>{t("home.hero.learnMore")}</a>
                                        </Button>
                                </div>

                                <p className="mt-4 text-sm text-foreground/50">
                                        {t("home.hero.noDnaRequired")}
                                </p>

                                <div className="relative mx-auto mt-16 max-w-6xl">
                                        <div
                                                className="absolute left-[16.67%] right-[16.67%] top-8 hidden h-px bg-linear-to-r from-orange-500/10 via-orange-500/50 to-orange-500/10 md:block"
                                                aria-hidden="true"
                                        />

                                        <div className="relative grid gap-4 text-left md:grid-cols-3">
                                                {journey.map((item) => (
                                                        <div
                                                                key={item.number}
                                                                className="group rounded-3xl border border-foreground/10 bg-background/90 p-6 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-1"
                                                        >
                                                                <div className="flex items-center justify-between">
                                                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-700 dark:text-orange-400">
                                                                                <item.icon className="size-5" />
                                                                        </div>
                                                                        <span className="font-mono text-xs font-medium tracking-[0.18em] text-orange-700/70 dark:text-orange-400/70">
                                                                                {item.number}
                                                                        </span>
                                                                </div>

                                                                <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-orange-700 uppercase dark:text-orange-400">
                                                                        {item.label}
                                                                </p>

                                                                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                                                                        {item.title}
                                                                </h2>

                                                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                                                        {item.description}
                                                                </p>
                                                        </div>
                                                ))}
                                        </div>
                                </div>

                                <div className="mx-auto mt-5 flex max-w-6xl items-start gap-3 rounded-2xl border border-orange-500/15 bg-orange-500/[0.035] p-4 text-left">
                                        <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-orange-700 dark:text-orange-400" />
                                        <p className="text-sm leading-6 text-muted-foreground">
                                                Genetic evidence can make planning questions more relevant. It does not
                                                determine your lifespan, retirement age or financial decisions.
                                        </p>
                                </div>
                        </div>
                </section>
        );
}

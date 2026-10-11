"use client";

import { config } from "@config";
import { LocaleLink } from "@i18n/routing";
import { config as paymentsConfig } from "@repo/payments/config";
import type { PaidPlan } from "@repo/payments/types";
import { cn } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
        ArrowRightIcon,
        BadgePercentIcon,
        CheckIcon,
        StarIcon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export function PricingSection() {
        const t = useTranslations();
        const format = useFormatter();
        const [interval, setBillingInterval] = useState<"month" | "year">("month");

        const signupUrl = useMemo(
                () => config.saasUrl && `${String(config.saasUrl).replace(/\/$/, "")}/signup`,
                [],
        );

        const plans = useMemo(() => {
                const result: Array<{
                        id: string;
                        title: string;
                        description: string;
                        features: string[];
                        cta: string;
                        recommended?: boolean;
                        isEnterprise?: boolean;
                        prices?: PaidPlan["prices"];
                        to: string;
                }> = [];

                if (!paymentsConfig.requireActiveSubscription) {
                        result.push({
                                id: "free",
                                title: "Free",
                                description: "Build and explore your financial plan.",
                                features: [
                                        "Financial and wealth planning",
                                        "Longevity and retirement planning",
                                        "Estate planning",
                                        "Ask Bioanalytix",
                                ],
                                cta: "Get started",
                                to: signupUrl ?? "#",
                        });
                }

                const individualPlan = paymentsConfig.plans.pro;

                if (individualPlan && !individualPlan.hidden && "prices" in individualPlan) {
                        result.push({
                                id: "individual",
                                title: "Individual",
                                description:
                                        "Add your genetic evidence to your financial planning picture.",
                                features: [
                                        "Everything in Free",
                                        "DNA upload and genetic profile",
                                        "Personalised research evidence",
                                        "Genetics-informed planning context",
                                ],
                                cta: "Start Individual",
                                recommended: true,
                                isEnterprise: false,
                                prices: individualPlan.prices,
                                to: signupUrl ?? "#",
                        });
                }

                const professionalPlan = paymentsConfig.plans.enterprise;

                if (
                        professionalPlan &&
                        !professionalPlan.hidden &&
                        "isEnterprise" in professionalPlan &&
                        professionalPlan.isEnterprise
                ) {
                        result.push({
                                id: "professional",
                                title: "Professional",
                                description:
                                        "Longevity analytics for advisers, wealth managers, family offices and organisations.",
                                features: [
                                        "Everything in Individual",
                                        "Client management",
                                        "Organisation workspace",
                                        "Professional planning workflows",
                                ],
                                cta: "Contact us",
                                recommended: false,
                                isEnterprise: true,
                                to: "/contact",
                        });
                }

                return result;
        }, [signupUrl]);

        const hasSubscriptions = plans.some((p) =>
                p.prices?.some((price) => price.type === "subscription"),
        );

        return (
                <section
                        id="pricing"
                        className="scroll-mt-16 border-b bg-background py-20 lg:py-24"
                >
                        <div className="container">
                                <div className="mx-auto mb-8 max-w-3xl text-center">
                                        <p className="text-xs font-semibold tracking-[0.18em] text-orange-700 uppercase dark:text-orange-400">
                                                Simple pricing
                                        </p>

                                        <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl xl:text-5xl">
                                                {t("pricing.title")}
                                        </h2>

                                        <p className="mt-4 text-sm text-foreground/60 sm:text-lg">
                                                {t("pricing.description")}
                                        </p>
                                </div>

                                <div className="@container">
                                        {hasSubscriptions && (
                                                <div className="mb-10 flex justify-center">
                                                        <Tabs
                                                                value={interval}
                                                                onValueChange={(value) =>
                                                                        setBillingInterval(value as "month" | "year")
                                                                }
                                                                data-test="price-table-interval-tabs"
                                                        >
                                                                <TabsList className="border border-foreground/10 bg-muted/40">
                                                                        <TabsTrigger value="month">
                                                                                {t("pricing.monthly")}
                                                                        </TabsTrigger>
                                                                        <TabsTrigger value="year">
                                                                                {t("pricing.yearly")}
                                                                        </TabsTrigger>
                                                                </TabsList>
                                                        </Tabs>
                                                </div>
                                        )}

                                        <div
                                                className={cn(
                                                        "mx-auto grid max-w-6xl grid-cols-1 gap-4",
                                                        plans.length >= 2 && "@xl:grid-cols-2",
                                                        plans.length >= 3 && "@3xl:grid-cols-3",
                                                        plans.length >= 4 && "@4xl:grid-cols-4",
                                                )}
                                        >
                                                {plans.map((plan) => {
                                                        const isFree = !plan.prices && !plan.isEnterprise;
                                                        const price = isFree
                                                                ? undefined
                                                                : plan.prices?.find(
                                                                                (p) =>
                                                                                        p.type === "one-time" ||
                                                                                        p.interval === interval,
                                                                        );

                                                        const trialPeriodDays =
                                                                price &&
                                                                "trialPeriodDays" in price &&
                                                                price.trialPeriodDays
                                                                        ? price.trialPeriodDays
                                                                        : undefined;

                                                        return (
                                                                <div
                                                                        key={plan.id}
                                                                        className={cn(
                                                                                "relative rounded-3xl border bg-card p-7",
                                                                                plan.recommended
                                                                                        ? "border-orange-500/50 bg-orange-500/[0.035] shadow-sm"
                                                                                        : "border-foreground/10",
                                                                        )}
                                                                        data-test="price-table-plan"
                                                                >
                                                                        {plan.recommended && (
                                                                                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full bg-orange-600 px-3 py-1 text-center text-xs font-semibold whitespace-nowrap text-white">
                                                                                        <StarIcon className="mr-1.5 size-3" />
                                                                                        {t("pricing.recommended")}
                                                                                </div>
                                                                        )}

                                                                        <div className="flex h-full flex-col justify-between gap-6">
                                                                                <div>
                                                                                        <h3 className="my-0 text-2xl font-semibold">
                                                                                                {plan.title}
                                                                                        </h3>

                                                                                        {plan.description && (
                                                                                                <div className="mt-2 text-sm leading-6 text-foreground/60">
                                                                                                        {plan.description}
                                                                                                </div>
                                                                                        )}

                                                                                        {!!plan.features?.length && (
                                                                                                <ul className="mt-6 grid list-none gap-3 text-sm">
                                                                                                        {plan.features.map(
                                                                                                                (feature, key) => (
                                                                                                                        <li
                                                                                                                                key={key}
                                                                                                                                className="flex items-start"
                                                                                                                        >
                                                                                                                                <CheckIcon
                                                                                                                                        className={cn(
                                                                                                                                                "mr-2.5 mt-0.5 size-4 shrink-0",
                                                                                                                                                plan.recommended
                                                                                                                                                        ? "text-orange-700 dark:text-orange-400"
                                                                                                                                                        : "text-foreground/60",
                                                                                                                                        )}
                                                                                                                                />
                                                                                                                                <span>
                                                                                                                                        {feature}
                                                                                                                                </span>
                                                                                                                        </li>
                                                                                                                ),
                                                                                                        )}
                                                                                                </ul>
                                                                                        )}

                                                                                        {trialPeriodDays !== undefined &&
                                                                                                trialPeriodDays > 0 && (
                                                                                                        <div className="mt-5 flex items-center justify-start text-sm font-medium text-orange-700 dark:text-orange-400">
                                                                                                                <BadgePercentIcon className="mr-2 size-4" />
                                                                                                                {t(
                                                                                                                        "pricing.trialPeriod",
                                                                                                                        {
                                                                                                                                days: trialPeriodDays,
                                                                                                                        },
                                                                                                                )}
                                                                                                        </div>
                                                                                                )}
                                                                                </div>

                                                                                <div>
                                                                                        {isFree && (
                                                                                                <strong
                                                                                                        className="block text-2xl font-medium lg:text-3xl"
                                                                                                        data-test="price-table-plan-price"
                                                                                                >
                                                                                                        {format.number(0, {
                                                                                                                style: "currency",
                                                                                                                currency: "USD",
                                                                                                        })}
                                                                                                </strong>
                                                                                        )}

                                                                                        {price && (
                                                                                                <strong
                                                                                                        className="block text-2xl font-medium lg:text-3xl"
                                                                                                        data-test="price-table-plan-price"
                                                                                                >
                                                                                                        {format.number(price.amount, {
                                                                                                                style: "currency",
                                                                                                                currency: price.currency,
                                                                                                        })}

                                                                                                        {price.type ===
                                                                                                                "subscription" && (
                                                                                                                <span className="text-xs font-normal opacity-60">
                                                                                                                        /
                                                                                                                        {price.interval ===
                                                                                                                        "year"
                                                                                                                                ? t(
                                                                                                                                                "pricing.year",
                                                                                                                                                {
                                                                                                                                                        count: 1,
                                                                                                                                                },
                                                                                                                                        )
                                                                                                                                : t(
                                                                                                                                                "pricing.month",
                                                                                                                                                {
                                                                                                                                                        count: 1,
                                                                                                                                                },
                                                                                                                                        )}
                                                                                                                </span>
                                                                                                        )}
                                                                                                </strong>
                                                                                        )}

                                                                                        {plan.to.startsWith("/") ? (
                                                                                                <Button
                                                                                                        className={cn(
                                                                                                                "mt-5 w-full",
                                                                                                                plan.recommended &&
                                                                                                                        "bg-orange-600 text-white hover:bg-orange-700",
                                                                                                        )}
                                                                                                        variant={
                                                                                                                plan.recommended
                                                                                                                        ? "primary"
                                                                                                                        : "secondary"
                                                                                                        }
                                                                                                        asChild
                                                                                                >
                                                                                                        <LocaleLink href={plan.to}>
                                                                                                                {plan.cta}
                                                                                                                <ArrowRightIcon className="ml-2 size-4" />
                                                                                                        </LocaleLink>
                                                                                                </Button>
                                                                                        ) : (
                                                                                                <Button
                                                                                                        className={cn(
                                                                                                                "mt-5 w-full",
                                                                                                                plan.recommended &&
                                                                                                                        "bg-orange-600 text-white hover:bg-orange-700",
                                                                                                        )}
                                                                                                        variant={
                                                                                                                plan.recommended
                                                                                                                        ? "primary"
                                                                                                                        : "secondary"
                                                                                                        }
                                                                                                        asChild
                                                                                                >
                                                                                                        <a href={plan.to}>
                                                                                                                {plan.cta}
                                                                                                                <ArrowRightIcon className="ml-2 size-4" />
                                                                                                        </a>
                                                                                                </Button>
                                                                                        )}
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        );
                                                })}
                                        </div>
                                </div>
                        </div>
                </section>
        );
}

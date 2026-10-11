"use client";

import { cn } from "@repo/ui";
import {
        Accordion,
        AccordionContent,
        AccordionItem,
        AccordionTrigger,
} from "@repo/ui/components/accordion";
import { useTranslations } from "next-intl";

const FAQ_ITEM_KEYS = [
        "dnaLifespan",
        "longevityPlanning",
        "existingDna",
        "needDnaTest",
        "professionalAdvice",
        "individualPlan",
] as const;

export function FaqSection({ className }: { className?: string }) {
        const t = useTranslations();

        const items = FAQ_ITEM_KEYS.map((key) => ({
                question: t(`faq.items.${key}.question`),
                answer: t(`faq.items.${key}.answer`),
        }));

        return (
                <section
                        className={cn(
                                "scroll-mt-20 border-b bg-muted/15 py-20 lg:py-24",
                                className,
                        )}
                        id="faq"
                >
                        <div className="container">
                                <div className="mx-auto grid max-w-3xl grid-cols-1 gap-10">
                                        <div className="text-center">
                                                <p className="text-xs font-semibold tracking-[0.18em] text-orange-700 uppercase dark:text-orange-400">
                                                        Questions & answers
                                                </p>

                                                <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl xl:text-5xl">
                                                        {t("faq.title")}
                                                </h2>

                                                <p className="mt-4 text-sm text-foreground/60 sm:text-lg">
                                                        {t("faq.description")}
                                                </p>
                                        </div>

                                        <Accordion
                                                type="single"
                                                collapsible
                                                className="w-full space-y-2 text-left"
                                        >
                                                {items.map((item, i) => (
                                                        <AccordionItem
                                                                key={`faq-item-${i}`}
                                                                value={`item-${i}`}
                                                                className="rounded-2xl border border-foreground/10 bg-background px-5 shadow-none lg:px-6"
                                                        >
                                                                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                                                                        {item.question}
                                                                </AccordionTrigger>

                                                                <AccordionContent className="pr-8 leading-7 text-foreground/60">
                                                                        {item.answer}
                                                                </AccordionContent>
                                                        </AccordionItem>
                                                ))}
                                        </Accordion>
                                </div>
                        </div>
                </section>
        );
}

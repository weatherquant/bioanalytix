"use client";

import { config } from "@config";
import { Button } from "@repo/ui/components/button";
import { ArrowRightIcon, ChartNoAxesCombinedIcon, DnaIcon } from "lucide-react";

export function NewsletterSection() {
        return (
                <section className="relative overflow-hidden py-20 lg:py-28">
                        <div
                                className="pointer-events-none absolute inset-0"
                                aria-hidden="true"
                        >
                                <div className="absolute -bottom-48 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
                        </div>

                        <div className="relative container">
                                <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-orange-500/20 bg-orange-500/[0.035] px-6 py-12 text-center md:px-12 md:py-14">
                                        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-orange-500/20 bg-background/70 px-3 py-1.5">
                                                <DnaIcon className="size-4 text-orange-700 dark:text-orange-400" />
                                                <ArrowRightIcon className="size-3 text-foreground/30" />
                                                <ChartNoAxesCombinedIcon className="size-4 text-orange-700 dark:text-orange-400" />
                                        </div>

                                        <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-orange-700 uppercase dark:text-orange-400">
                                                Biology into planning
                                        </p>

                                        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-medium tracking-tight lg:text-4xl xl:text-5xl">
                                                Your longevity is uncertain. Your planning doesn't have to ignore it.
                                        </h2>

                                        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                                                Start with your financial plan for free, or bring your existing genetic data
                                                into Bioanalytix Individual and begin exploring the longevity questions that
                                                may matter to your future.
                                        </p>

                                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                                                <Button
                                                        size="lg"
                                                        className="bg-orange-600 text-white hover:bg-orange-700"
                                                        asChild
                                                >
                                                        <a href={`${config.saasUrl}/signup?intent=dna`}>
                                                                Use my DNA
                                                                <ArrowRightIcon className="ml-2 size-4" />
                                                        </a>
                                                </Button>

                                                <Button size="lg" variant="secondary" asChild>
                                                        <a href={`${config.saasUrl}/signup`}>
                                                                Start planning free
                                                        </a>
                                                </Button>
                                        </div>

                                        <p className="mt-5 text-sm text-muted-foreground">
                                                Don't have DNA results? A Bioanalytix testing pathway is coming soon.
                                        </p>
                                </div>
                        </div>
                </section>
        );
}

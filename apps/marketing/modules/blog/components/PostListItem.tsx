"use client";

import type { Post } from "@blog/types";
import { LocaleLink } from "@i18n/routing";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { useLocale } from "next-intl";

export function PostListItem({ post }: { post: Post }) {
        const locale = useLocale();
        const { title, excerpt, authorName, date, path, tags } = post;

        return (
                <article className="group flex h-full flex-col rounded-4xl border bg-card p-7 transition-shadow hover:shadow-md">
                        <div className="mb-6 flex items-center justify-between">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                        <BookOpen size={19} />
                                </div>

                                <p className="text-sm text-muted-foreground">
                                        {Intl.DateTimeFormat(locale, {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                        }).format(new Date(date))}
                                </p>
                        </div>

                        {tags && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                                <span
                                                        key={tag}
                                                        className="font-semibold text-xs tracking-wider text-orange-600 uppercase dark:text-orange-400"
                                                >
                                                        {tag}
                                                </span>
                                        ))}
                                </div>
                        )}

                        <LocaleLink
                                href={`/blog/${path}`}
                                className="flex items-start gap-2 font-semibold text-2xl leading-tight tracking-tight"
                        >
                                <span>{title}</span>
                                <ArrowUpRight
                                        size={18}
                                        className="mt-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-60"
                                />
                        </LocaleLink>

                        {excerpt && (
                                <p className="mt-4 leading-7 text-muted-foreground">
                                        {excerpt}
                                </p>
                        )}

                        <div className="mt-auto pt-7">
                                <div className="border-t pt-4">
                                        <p className="font-medium text-sm">
                                                {authorName ?? "Bioanalytix Research"}
                                        </p>
                                </div>
                        </div>
                </article>
        );
}

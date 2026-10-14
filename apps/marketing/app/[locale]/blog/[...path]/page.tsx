import { PostContent } from "@blog/components/PostContent";
import { getPostBySlug, getPublishedPostPaths } from "@blog/lib/posts";
import { LocaleLink, localeRedirect } from "@i18n/routing";
import { getActivePathFromUrlParam } from "@shared/lib/content";
import { ArrowLeft } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
        const paths = getPublishedPostPaths();
        return paths.map((path) => ({ path: [path] }));
}

type Params = {
        path: string;
        locale: string;
};

export async function generateMetadata(props: { params: Promise<Params> }) {
        const { path, locale } = await props.params;
        const slug = getActivePathFromUrlParam(path);
        const post = await getPostBySlug(slug, { locale });

        if (!post) {
                return {};
        }

        const canonicalPath = `/blog/${slug}`;

        return {
                title: post.title,
                description: post.excerpt,
                alternates: {
                        canonical: canonicalPath,
                },
                openGraph: {
                        type: "article",
                        title: post.title,
                        description: post.excerpt,
                        url: canonicalPath,
                        publishedTime: new Date(post.date).toISOString(),
                        authors: [post.authorName ?? "Bioanalytix Research"],
                        tags: post.tags ?? [],
                },
        };
}

export default async function BlogPostPage(props: { params: Promise<Params> }) {
        const { path, locale } = await props.params;
        setRequestLocale(locale);

        const slug = getActivePathFromUrlParam(path);
        const post = await getPostBySlug(slug, { locale });

        if (!post) {
                return localeRedirect({ href: "/blog", locale });
        }

        const { title, date, authorName, tags, body, excerpt } = post;

        return (
                <div className="container max-w-5xl py-16">
                        <LocaleLink
                                href="/blog"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                                <ArrowLeft size={15} />
                                Bioanalytix Research
                        </LocaleLink>

                        <header className="mx-auto max-w-3xl pb-10 pt-14">
                                {tags && (
                                        <div className="mb-5 flex flex-wrap gap-3">
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

                                <h1 className="font-bold text-4xl leading-tight tracking-tight sm:text-5xl">
                                        {title}
                                </h1>

                                {excerpt && (
                                        <p className="mt-6 text-xl leading-8 text-muted-foreground">
                                                {excerpt}
                                        </p>
                                )}

                                <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-b pb-8 text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">
                                                {authorName ?? "Bioanalytix Research"}
                                        </span>
                                        <span aria-hidden="true">·</span>
                                        <span>
                                                {Intl.DateTimeFormat(locale, {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                }).format(new Date(date))}
                                        </span>
                                </div>
                        </header>

                        <div className="pb-12">
                                <PostContent content={body} />
                        </div>
                </div>
        );
}

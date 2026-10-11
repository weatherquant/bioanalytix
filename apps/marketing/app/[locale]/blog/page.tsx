import { PostListItem } from "@blog/components/PostListItem";
import { getAllPosts } from "@blog/lib/posts";
import { BookOpen, Dna, LineChart } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
        const { locale } = await props.params;
        const t = await getTranslations({ locale, namespace: "blog" });

        return {
                title: t("title"),
                description:
                        "Research and perspectives on genetics, longevity, retirement planning and the economics of longer lives.",
        };
}

export default async function BlogListPage(props: { params: Promise<{ locale: string }> }) {
        const { locale } = await props.params;
        setRequestLocale(locale);

        const posts = await getAllPosts(locale);

        return (
                <div className="container max-w-6xl py-16">
                        <section className="relative overflow-hidden rounded-[2.5rem] border bg-gradient-to-br from-orange-50 via-background to-background px-6 py-14 dark:from-orange-950/20 md:px-12 md:py-20">
                                <div className="absolute -right-20 -top-24 size-72 rounded-full bg-orange-500/10 blur-3xl" />

                                <div className="relative max-w-3xl">
                                        <div className="mb-6 flex items-center gap-2 font-semibold text-sm tracking-wider text-orange-600 uppercase dark:text-orange-400">
                                                <BookOpen size={17} />
                                                Bioanalytix Research
                                        </div>

                                        <h1 className="font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl">
                                                Biology, longevity and the economics of a longer life.
                                        </h1>

                                        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                                                Research and perspectives on what genetic evidence can tell us,
                                                what it cannot, and how uncertainty about health and longevity
                                                changes long-term financial planning.
                                        </p>

                                        <div className="mt-8 flex flex-wrap gap-3">
                                                <div className="flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm">
                                                        <Dna size={15} className="text-orange-600" />
                                                        Genetics & longevity
                                                </div>
                                                <div className="flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm">
                                                        <LineChart size={15} className="text-orange-600" />
                                                        Retirement & portfolio research
                                                </div>
                                        </div>
                                </div>
                        </section>

                        <section className="py-16">
                                <div className="mb-8">
                                        <p className="font-semibold text-sm tracking-wider text-orange-600 uppercase dark:text-orange-400">
                                                Insights
                                        </p>
                                        <h2 className="mt-2 font-semibold text-3xl tracking-tight">
                                                Latest research
                                        </h2>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                        {posts.map((post) => (
                                                <PostListItem post={post} key={post.path} />
                                        ))}
                                </div>
                        </section>
                </div>
        );
}

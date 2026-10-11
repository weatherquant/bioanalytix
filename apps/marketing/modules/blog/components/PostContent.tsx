"use client";

import { mdxComponents } from "@blog/lib/mdx-components";
import { MDXContent } from "@content-collections/mdx/react";

export function PostContent({ content }: { content: string }) {
        return (
                <article className="prose prose-lg dark:prose-invert mx-auto max-w-3xl prose-headings:tracking-tight prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-orange-500 prose-strong:text-foreground">
                        <MDXContent
                                code={content}
                                components={{
                                        a: mdxComponents.a,
                                }}
                        />
                </article>
        );
}

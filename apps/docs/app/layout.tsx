import { Logo } from "@repo/ui";

import "./global.css";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { source } from "@/lib/source";

const inter = Inter({
	subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.bioanalytix.co";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Bioanalytix Knowledge Centre",
		template: "%s | Bioanalytix",
	},
	description:
		"Understand how Bioanalytix connects genetic evidence, longevity uncertainty and long-term financial planning.",
};

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="flex min-h-screen flex-col">
				<RootProvider>
					<DocsLayout
						tree={source.getPageTree()}
						nav={{
							title: <Logo />,
						}}
					>
						{children}
					</DocsLayout>
				</RootProvider>
			</body>
		</html>
	);
}

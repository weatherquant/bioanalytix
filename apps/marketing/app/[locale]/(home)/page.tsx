import { FaqSection } from "@home/components/FaqSection";
import { FeaturesSection } from "@home/components/FeaturesSection";
import { HeroSection } from "@home/components/HeroSection";
import { NewsletterSection } from "@home/components/NewsletterSection";
import { PricingSection } from "@home/components/PricingSection";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
	title: "Genetics, Longevity & Retirement Planning",
	description:
		"Understand how genetics, longevity and financial uncertainty interact in long-term retirement planning. Bioanalytix brings biological and financial evidence together in one planning framework.",
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "Bioanalytix | Genetics, Longevity & Retirement Planning",
		description:
			"Understand how genetics, longevity and financial uncertainty interact in long-term retirement planning.",
		url: "/",
		type: "website",
	},
};

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<>
			<HeroSection />
			<FeaturesSection />
			<PricingSection />
			<FaqSection />
			<NewsletterSection />
		</>
	);
}

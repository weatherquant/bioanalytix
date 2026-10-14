import { config } from "@config";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://bioanalytix.co"),
	title: {
		absolute: config.appName,
		default: config.appName,
		template: `%s | ${config.appName}`,
	},
	description:
		"Understand how genetics, longevity and financial uncertainty interact in long-term retirement planning.",
	applicationName: config.appName,
	openGraph: {
		type: "website",
		siteName: config.appName,
		title: config.appName,
		description:
			"Understand how genetics, longevity and financial uncertainty interact in long-term retirement planning.",
		url: "https://bioanalytix.co",
	},
};

export default function RootLayout({ children }: PropsWithChildren) {
	return children;
}

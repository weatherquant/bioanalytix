import { config } from "@config";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../messages/en";

import "./globals.css";

export const metadata: Metadata = {
	title: {
		absolute: config.appName,
		default: config.appName,
		template: `%s | ${config.appName}`,
	},
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


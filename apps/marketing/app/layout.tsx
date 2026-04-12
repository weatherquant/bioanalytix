import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "../i18n";
import { config } from "@config";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    absolute: config.appName,
    default: config.appName,
    template: `%s | ${config.appName}`,
  },
};

export default async function RootLayout({ children, params }: PropsWithChildren & { params: { locale: string } }) {
  const messages = await getMessages(params.locale);

  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
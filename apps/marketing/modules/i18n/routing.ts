import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

import { config } from "./config";

export const routing = defineRouting({
	locales: [config.defaultLocale],
	defaultLocale: config.defaultLocale,
	localeCookie: {
		name: config.localeCookieName,
	},
	localePrefix: "as-needed",
	localeDetection: false,
});

export const {
	Link: LocaleLink,
	redirect: localeRedirect,
	usePathname: useLocalePathname,
	useRouter: useLocaleRouter,
} = createNavigation(routing);

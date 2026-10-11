import { config } from "@config";
import { LocaleLink } from "@i18n/routing";
import { Logo } from "@repo/ui";
import { useTranslations } from "next-intl";

export function Footer() {
        const t = useTranslations();

        return (
                <footer className="border-t bg-muted/15 py-10 text-sm text-foreground/60">
                        <div className="container grid grid-cols-1 gap-8 lg:grid-cols-3">
                                <div>
                                        <Logo />

                                        <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                                                Bringing biological evidence into long-term financial planning without
                                                turning uncertainty into prediction.
                                        </p>

                                        <p className="mt-4 text-xs text-muted-foreground">
                                                © {new Date().getFullYear()} {config.appName}.
                                        </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                        <p className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">
                                                Explore
                                        </p>

                                        <LocaleLink href="/blog" className="block hover:text-foreground">
                                                {t("common.footer.blog")}
                                        </LocaleLink>

                                        <a href="/#features" className="block hover:text-foreground">
                                                {t("common.footer.features")}
                                        </a>

                                        <a href="/#pricing" className="block hover:text-foreground">
                                                {t("common.footer.pricing")}
                                        </a>

                                        <LocaleLink href="/contact" className="block hover:text-foreground">
                                                Contact
                                        </LocaleLink>

                                        {config.docsUrl && (
                                                <a
                                                        href={config.docsUrl}
                                                        className="block hover:text-foreground"
                                                >
                                                        Knowledge Centre
                                                </a>
                                        )}
                                </div>

                                <div className="flex flex-col gap-3">
                                        <p className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">
                                                Trust
                                        </p>

                                        <LocaleLink
                                                href="/legal/privacy-policy"
                                                className="block hover:text-foreground"
                                        >
                                                {t("common.footer.privacyPolicy")}
                                        </LocaleLink>

                                        <LocaleLink
                                                href="/legal/terms"
                                                className="block hover:text-foreground"
                                        >
                                                {t("common.footer.termsAndConditions")}
                                        </LocaleLink>

                                        <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
                                                Bioanalytix provides planning and research tools. Genetic evidence does
                                                not determine lifespan, health outcomes or financial decisions.
                                        </p>
                                </div>
                        </div>
                </footer>
        );
}

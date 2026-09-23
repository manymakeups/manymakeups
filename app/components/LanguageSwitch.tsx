"use client";

import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import { useI18n } from "@/lib/i18n/context";

type LanguageSwitchProps = {
  current?: Locale;
  path?: string;
  enabled?: boolean;
};

export function LanguageSwitch({
  current = "es",
  path = "/",
  enabled = true,
}: LanguageSwitchProps) {
  const { messages } = useI18n();

  return (
    <nav
      className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] text-ash sm:gap-3 sm:text-[0.65rem] sm:tracking-[0.18em]"
      aria-label={messages.nav.language}
    >
      {locales.map((locale) => {
        const active = locale === current;
        const href = localePath(locale, path);
        if (!enabled && !active) {
          return (
            <span key={locale} className="opacity-40">
              {localeLabels[locale]}
            </span>
          );
        }
        return (
          <a
            key={locale}
            href={href}
            className={active ? "text-ink" : "hover:text-ink"}
            aria-current={active ? "page" : undefined}
            hrefLang={locale}
          >
            {localeLabels[locale]}
          </a>
        );
      })}
    </nav>
  );
}

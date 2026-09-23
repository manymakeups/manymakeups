import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { getLocale, getMessages } from "@/lib/i18n";
import type { ReactNode } from "react";

export async function LegalDoc({
  kicker,
  title,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  const locale = await getLocale();
  const t = getMessages(locale);

  return (
    <div className="min-h-full bg-porcelain text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[800px] px-6 pb-24 pt-6 md:px-10 md:pt-10">
        <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gilt">
          {kicker}
        </p>
        <h1 className="mt-6 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-ash">
          {t.common.legalUpdated}: {updated}
        </p>
        {locale !== "es" ? (
          <p className="mt-6 text-sm leading-relaxed text-ash">
            {t.legal.originalNote}
          </p>
        ) : null}
        <div className="legal-copy mt-10 space-y-8 text-base leading-relaxed text-ash">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

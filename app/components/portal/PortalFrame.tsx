import { BrandLogo } from "../BrandLogo";
import { LanguageSwitch } from "@/app/components/LanguageSwitch";
import { getLocale, getPortalCopy, getRequestPathname, localePath } from "@/lib/i18n";
import { site } from "@/lib/site";
import type { ReactNode } from "react";

export async function PortalFrame({
  kicker,
  title,
  lead,
  aside,
  children,
  localize = false,
}: {
  kicker: string;
  title: string;
  lead?: string;
  aside?: ReactNode;
  children: ReactNode;
  localize?: boolean;
}) {
  const locale = localize ? await getLocale() : "es";
  const copy = getPortalCopy(locale);
  const path = localize ? await getRequestPathname() : "/";

  return (
    <div className="min-h-full bg-porcelain text-ink">
      <header className="border-b border-ink/5">
        <div className="mx-auto flex max-w-[960px] items-center justify-between gap-4 px-5 py-4 md:px-10">
          <a
            href={localize ? localePath(locale, "/") : "/"}
            className="flex items-center gap-3"
            aria-label={site.legalName}
          >
            <BrandLogo size="header" className="size-[4.5rem] sm:size-[5.5rem]" />
            <span className="hidden font-serif text-lg sm:block">Many Makeups</span>
          </a>
          <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
            {localize ? (
              <div className="border-ink/10 pr-0 sm:border-r sm:pr-6">
                <LanguageSwitch current={locale} path={path} enabled />
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-end gap-4">
              {aside}
              <a className="btn-atelier shrink-0" href={localize ? localePath(locale, "/") : "/"}>
                {localize ? copy.backToSite : "Volver a la web"}
              </a>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[960px] px-5 pb-24 pt-10 md:px-10">
        <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gilt">{kicker}</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
          {title}
        </h1>
        {lead ? <p className="mt-4 max-w-2xl text-ash">{lead}</p> : null}
        <div className="mt-10">{children}</div>
      </main>
    </div>
  );
}

export function PortalNotice({ children }: { children: ReactNode }) {
  return (
    <p className="mb-6 border border-gilt/30 bg-linen/60 px-4 py-3 text-sm text-ink">
      {children}
    </p>
  );
}

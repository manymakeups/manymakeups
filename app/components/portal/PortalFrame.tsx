import { BrandLogo } from "../BrandLogo";
import { LanguageSwitch } from "@/app/components/LanguageSwitch";
import { PortalMenu } from "@/app/components/portal/PortalMenu";
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
  pinned = false,
  dense = false,
}: {
  kicker: string;
  title: string;
  lead?: string;
  aside?: ReactNode;
  children: ReactNode;
  localize?: boolean;
  pinned?: boolean;
  dense?: boolean;
}) {
  const locale = localize ? await getLocale() : "es";
  const copy = getPortalCopy(locale);
  const path = localize ? await getRequestPathname() : "/";

  const backHref = localize ? localePath(locale, "/") : "/";
  const backLabel = localize ? copy.backToSite : "Volver a la web";
  const header = (
      <header className="shrink-0 border-b border-ink/5">
        <div className="mx-auto flex max-w-[960px] items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-10 md:py-4">
          <a
            href={backHref}
            className="flex min-w-0 items-center gap-3"
            aria-label={site.legalName}
          >
            <BrandLogo size="header" className="size-16 shrink-0 sm:size-[4.5rem] md:size-[5.5rem]" />
            <span className="hidden font-serif text-lg sm:block">Many Makeups</span>
          </a>
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            {localize ? (
              <div className="border-ink/10 md:border-r md:pr-6">
                <LanguageSwitch current={locale} path={path} enabled />
              </div>
            ) : null}
            {aside ? (
              <PortalMenu label={copy.menu} closeLabel={copy.agendaClose}>
                {aside}
                <a className="btn-atelier mt-6 md:mt-0" href={backHref}>
                  {backLabel}
                </a>
              </PortalMenu>
            ) : (
              <>
                <a
                  className="max-w-[7.5rem] text-right text-[0.62rem] uppercase leading-tight tracking-[0.12em] text-ink md:hidden"
                  href={backHref}
                >
                  {backLabel}
                </a>
                <span className="hidden md:inline-flex">
                  <a className="btn-atelier" href={backHref}>
                    {backLabel}
                  </a>
                </span>
              </>
            )}
          </div>
        </div>
      </header>
  );
  const intro = dense ? (
    <h1 className="font-serif text-2xl leading-tight tracking-tight md:text-3xl">{title}</h1>
  ) : (
    <>
      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-gilt md:text-[0.68rem] md:tracking-[0.32em]">{kicker}</p>
      <h1 className="mt-2 font-serif text-[2rem] leading-tight tracking-tight md:mt-4 md:text-5xl">{title}</h1>
      {lead ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ash md:mt-4 md:text-base">{lead}</p> : null}
    </>
  );

  if (pinned) {
    return (
      <div className="portal-shell flex h-dvh flex-col overflow-hidden bg-porcelain text-ink">
        {header}
        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-[960px] flex-1 flex-col px-4 md:px-10">
          <div className={dense ? "shrink-0 pt-3 md:pt-5" : "shrink-0 pt-5 md:pt-10"}>{intro}</div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="portal-shell min-h-full bg-porcelain text-ink">
      {header}
      <main className="mx-auto max-w-[960px] px-4 pb-[max(5rem,env(safe-area-inset-bottom))] pt-8 md:px-10 md:pt-10">
        {intro}
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

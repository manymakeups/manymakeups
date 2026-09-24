import { BrandLogo } from "./BrandLogo";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileNav } from "./MobileNav";
import { site } from "@/lib/site";
import { getLocale, getMessages, localePath } from "@/lib/i18n";
import { getRequestPathname } from "@/lib/i18n/server";

export async function SiteHeader() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const path = await getRequestPathname();
  const links = [
    { href: localePath(locale, "/#looks"), label: t.nav.looks },
    { href: localePath(locale, "/#lookbook"), label: t.nav.lookbook },
    { href: localePath(locale, "/#servicios"), label: t.nav.atelier },
    { href: localePath(locale, "/#metodo"), label: t.nav.metodo },
    { href: localePath(locale, "/#ana"), label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-porcelain/95">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 md:px-10 md:py-4 md:pt-4">
        <a
          href={localePath(locale, "/")}
          id="site-header-logo"
          className="shrink-0"
          aria-label={site.legalName}
        >
          <BrandLogo
            size="header"
            className="size-[5.5rem] sm:size-[7rem] md:size-[6.75rem] lg:size-[7.5rem]"
          />
        </a>
        <div className="flex min-w-0 items-center gap-3 sm:gap-6 md:gap-10">
          <nav
            className="hidden items-center gap-5 lg:gap-8 md:flex"
            aria-label={t.nav.principal}
          >
            {links.map((link) => (
              <a
                key={link.href}
                className="nav-link text-ash hover:text-ink"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <LanguageSwitch current={locale} path={path} enabled />
          <div className="hidden md:block">
            <a
              className="btn-atelier shrink-0"
              href={localePath(locale, "/#contacto")}
            >
              {t.nav.contact}
            </a>
          </div>
          <MobileNav
            label={t.nav.principal}
            closeLabel={t.common.close}
            contactLabel={t.nav.contact}
            contactHref={localePath(locale, "/#contacto")}
            links={links}
          />
        </div>
      </div>
    </header>
  );
}

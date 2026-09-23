import { BrandLogo } from "./BrandLogo";
import { site } from "@/lib/site";
import { getLocale, getMessages, localePath } from "@/lib/i18n";

export async function SiteFooter() {
  const locale = await getLocale();
  const t = getMessages(locale);

  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-6 py-8 text-[0.7rem] uppercase tracking-[0.18em] text-ash md:px-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo size="footer" />
          <div>
            <p>{site.legalName}</p>
            <p className="mt-1">
              {site.streetAddress} · {site.postalCode} {site.city}, {site.region}
            </p>
            <p className="mt-1">Est. {site.founded}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <a className="hover:text-ink" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <a className="hover:text-ink" href={`tel:${site.phone}`}>
            {site.phoneDisplay}
          </a>
        </div>
      </div>
      <div className="border-t border-ink/10 bg-linen/50">
        <nav
          className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-5 text-sm text-ink md:px-10"
          aria-label={t.footer.legal}
        >
          <a
            className="underline-offset-4 hover:underline"
            href={localePath(locale, "/aviso-legal")}
          >
            {t.footer.notice}
          </a>
          <a
            className="underline-offset-4 hover:underline"
            href={localePath(locale, "/privacidad")}
          >
            {t.footer.privacy}
          </a>
          <a
            className="underline-offset-4 hover:underline"
            href={localePath(locale, "/cookies")}
          >
            {t.footer.cookies}
          </a>
        </nav>
      </div>
    </footer>
  );
}

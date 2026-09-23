import { getLocale, getMessages, localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale());
  return {
    title: t.meta.notFoundTitle,
    robots: { index: false, follow: true },
  };
}

export default async function NotFound() {
  const locale = await getLocale();
  const t = getMessages(locale);

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-porcelain px-6 py-24 text-center text-ink">
      <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gilt">
        404
      </p>
      <h1 className="mt-6 font-serif text-5xl">{t.meta.notFoundHeading}</h1>
      <p className="mt-4 max-w-md text-ash">{t.meta.notFoundBody}</p>
      <a className="btn-atelier mt-10" href={localePath(locale, "/")}>
        {t.meta.notFoundCta}
      </a>
    </div>
  );
}

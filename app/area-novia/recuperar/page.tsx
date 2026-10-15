import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { getLocale, getPortalCopy, localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getPortalCopy(await getLocale());
  return { title: copy.recoverTitle, robots: { index: false, follow: false } };
}

export default async function RecoverPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const locale = await getLocale();
  const t = getPortalCopy(locale);
  const { ok } = await searchParams;

  return (
    <PortalFrame localize kicker={t.kicker} title={t.recover} lead={t.recoverLead}>
      {ok ? <PortalNotice>{t.recoverSent}</PortalNotice> : null}
      <form action="/api/portal/recover" method="post" className="flex max-w-md flex-col gap-4">
        <label className="field-label">
          {t.email}
          <input className="field" name="email" type="email" required autoComplete="email" />
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button className="btn-atelier-solid btn-atelier w-full sm:w-auto" type="submit">
            {t.recoverSend}
          </button>
          <a className="btn-atelier w-full sm:w-auto" href={localePath(locale, "/area-novia")}>
            {t.recoverBack}
          </a>
        </div>
      </form>
    </PortalFrame>
  );
}

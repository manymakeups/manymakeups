import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { getLocale, getPortalCopy } from "@/lib/i18n";
import { unsubscribeMatches } from "@/lib/portal/unsubscribe";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getPortalCopy(await getLocale());
  return { title: copy.unsubTitle, robots: { index: false, follow: false } };
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; tipo?: string; token?: string; ok?: string; error?: string }>;
}) {
  const t = getPortalCopy(await getLocale());
  const { id = "", tipo = "", token = "", ok, error } = await searchParams;
  const valid = unsubscribeMatches(id, tipo, token);
  const lead = !valid || error ? t.unsubBad : tipo === "comercial" ? t.unsubCommercialLead : t.unsubRemindersLead;
  return (
    <PortalFrame localize kicker={t.kicker} title={t.unsubTitle} lead={error ? t.unsubBad : ok ? t.unsubDone : lead}>
      {error ? <PortalNotice>{t.unsubBad}</PortalNotice> : null}
      {ok ? <PortalNotice>{t.unsubDone}</PortalNotice> : null}
      {!ok && !error && valid ? (
        <form action="/api/portal/unsubscribe" method="post" className="mt-8">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="tipo" value={tipo} />
          <input type="hidden" name="token" value={token} />
          <button className="btn-atelier btn-atelier-solid" type="submit">
            {t.unsubButton}
          </button>
        </form>
      ) : null}
    </PortalFrame>
  );
}

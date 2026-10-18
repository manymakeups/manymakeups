import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { getLocale, getPortalCopy } from "@/lib/i18n";
import { hashToken } from "@/lib/portal/crypto";
import { getClient } from "@/lib/portal/store";
import { euros } from "@/lib/portal/types";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getPortalCopy(await getLocale());
  return { title: copy.confirmCitaTitle, robots: { index: false, follow: false } };
}

export default async function ConfirmAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; cita?: string; token?: string; ok?: string; error?: string }>;
}) {
  const t = getPortalCopy(await getLocale());
  const { cliente = "", cita = "", token = "", ok, error } = await searchParams;
  const client = cliente ? await getClient(cliente) : null;
  const appointment = client?.appointments.find((item) => item.id === cita);
  const valid = Boolean(appointment && token && appointment.confirmTokenHash === hashToken(token));
  const done = Boolean(ok) || appointment?.status === "confirmada";
  return (
    <PortalFrame
      localize
      kicker={t.kicker}
      title={valid || done ? t.confirmCitaTitle : t.confirmCitaBad}
      lead={valid ? t.confirmCitaLead : done && !error ? t.confirmCitaDone : t.confirmCitaBad}
    >
      {error ? <PortalNotice>{t.confirmCitaBad}</PortalNotice> : null}
      {done && !error ? <PortalNotice>{t.confirmCitaDone}</PortalNotice> : null}
      {valid && appointment && !done ? (
        <form action="/api/portal/confirm-cita" method="post" className="mt-8 flex max-w-md flex-col gap-3 text-sm">
          <input type="hidden" name="cliente" value={cliente} />
          <input type="hidden" name="cita" value={cita} />
          <input type="hidden" name="token" value={token} />
          <p>
            {appointment.title}
            {appointment.date ? ` · ${appointment.date}` : ""}
            {appointment.time ? ` · ${appointment.time}` : ""}
          </p>
          {appointment.place ? <p>{appointment.place}</p> : null}
          {appointment.amount > 0 ? <p>{euros(appointment.amount)}</p> : null}
          <button className="btn-atelier btn-atelier-solid self-start" type="submit">
            {t.confirmCitaButton}
          </button>
        </form>
      ) : null}
    </PortalFrame>
  );
}

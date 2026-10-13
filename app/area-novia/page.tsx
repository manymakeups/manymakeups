import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { getLocale, getPortalCopy, localePath } from "@/lib/i18n";
import { getSession } from "@/lib/portal/session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getPortalCopy(await getLocale());
  return { title: copy.kicker, robots: { index: false, follow: false } };
}

export default async function BrideLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const locale = await getLocale();
  const t = getPortalCopy(locale);
  const session = await getSession();
  if (session?.role === "client") redirect(localePath(locale, "/area-novia/panel"));
  const { error } = await searchParams;
  const errors: Record<string, string> = {
    datos: t.errorDatos,
    acceso: t.errorAcceso,
    invitacion: t.errorInvitacion,
  };
  const message = error ? errors[error] : null;

  return (
    <PortalFrame localize kicker={t.kicker} title={t.loginTitle} lead={t.loginLead}>
      {message ? <PortalNotice>{message}</PortalNotice> : null}
      <form action="/api/portal/login" method="post" className="flex max-w-md flex-col gap-4">
        <label className="field-label">
          {t.email}
          <input className="field" name="email" type="email" required autoComplete="username" />
        </label>
        <label className="field-label">
          {t.password}
          <input
            className="field"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        <div className="mt-2 flex flex-wrap gap-3">
          <button className="btn-atelier-solid btn-atelier" type="submit">
            {t.enter}
          </button>
          <a className="btn-atelier" href={localePath(locale, "/area-novia/recuperar")}>
            {t.recover}
          </a>
        </div>
      </form>
      <p className="mt-8 max-w-md text-sm text-ash">{t.loginHint}</p>
    </PortalFrame>
  );
}

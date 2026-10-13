import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { getLocale, getPortalCopy, interpolate, localePath } from "@/lib/i18n";
import { hashToken } from "@/lib/portal/crypto";
import { getClientByInviteHash } from "@/lib/portal/store";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getPortalCopy(await getLocale());
  return { title: copy.activateTitle, robots: { index: false, follow: false } };
}

export default async function ActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const locale = await getLocale();
  const t = getPortalCopy(locale);
  const { token = "", error } = await searchParams;
  const client = token ? await getClientByInviteHash(hashToken(token)) : null;
  const errorText =
    error === "clave" ? t.errorMismatch : error === "requisito" ? t.errorRequirement : null;

  return (
    <PortalFrame
      localize
      kicker={t.kicker}
      title={client ? interpolate(t.hello, { name: client.name }) : t.activateBadLink}
      lead={
        client
          ? client.passwordHash
            ? interpolate(t.activateNewPassword, { email: client.email })
            : interpolate(t.activateCreateLead, { email: client.email })
          : t.activateBadLead
      }
    >
      {errorText ? <PortalNotice>{errorText}</PortalNotice> : null}
      {client ? (
        <form action="/api/portal/activate" method="post" className="flex max-w-md flex-col gap-4">
          <input type="hidden" name="token" value={token} />
          <label className="field-label">
            {t.password}
            <input
              className="field"
              name="password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
            />
          </label>
          <label className="field-label">
            {t.confirmPassword}
            <input
              className="field"
              name="confirm"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
            />
          </label>
          <p className="text-sm text-ash">{t.activateRule}</p>
          <button className="btn-atelier-solid btn-atelier mt-2 self-start" type="submit">
            {client.passwordHash ? t.activateSave : t.activateCreate}
          </button>
        </form>
      ) : (
        <a className="btn-atelier inline-flex" href={localePath(locale, "/area-novia")}>
          {t.activateGoLogin}
        </a>
      )}
    </PortalFrame>
  );
}

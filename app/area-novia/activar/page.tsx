import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { hashToken } from "@/lib/portal/crypto";
import { getClientByInviteHash } from "@/lib/portal/store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activar área de novia",
  robots: { index: false, follow: false },
};

export default async function ActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token = "", error } = await searchParams;
  const client = token ? await getClientByInviteHash(hashToken(token)) : null;
  const errorText =
    error === "clave"
      ? "Las dos contraseñas no coinciden."
      : error === "requisito"
        ? "Mínimo 10 caracteres, con letra y número."
        : null;

  return (
    <PortalFrame
      kicker="Invitación"
      title={client ? `Hola, ${client.name}.` : "Este enlace no sirve."}
      lead={
        client
          ? `Tu usuario será ${client.email}. Elige una contraseña que solo tú conozcas; la necesitarás cada vez que entres a tu área.`
          : "Pídeme un enlace nuevo. Caduca a las tres semanas o cuando ya lo hayas usado."
      }
    >
      {errorText ? <PortalNotice>{errorText}</PortalNotice> : null}
      {client ? (
        <form action="/api/portal/activate" method="post" className="flex max-w-md flex-col gap-4">
          <input type="hidden" name="token" value={token} />
          <label className="field-label">
            Contraseña
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
            Repite la contraseña
            <input
              className="field"
              name="confirm"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
            />
          </label>
          <p className="text-sm text-ash">Al menos 10 caracteres, con una letra y un número.</p>
          <button className="btn-atelier-solid btn-atelier mt-2 self-start" type="submit">
            Crear acceso
          </button>
        </form>
      ) : (
        <a className="btn-atelier inline-flex" href="/area-novia">
          Ir al acceso
        </a>
      )}
    </PortalFrame>
  );
}

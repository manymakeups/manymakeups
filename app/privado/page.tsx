import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { getSession } from "@/lib/portal/session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estudio",
  robots: { index: false, follow: false },
};

export default async function StudioLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session?.role === "admin") redirect("/privado/novias");
  const { error } = await searchParams;
  const missing = !process.env.PORTAL_ADMIN_PASSWORD || !process.env.AUTH_SECRET;

  return (
    <PortalFrame
      kicker="Estudio"
      title="Área privada."
      lead="Solo para el atelier. Desde aquí abres cuentas a las clientas y cuelgas contratos o presupuestos."
    >
      {error === "acceso" ? <PortalNotice>Contraseña incorrecta.</PortalNotice> : null}
      {missing ? (
        <PortalNotice>
          Falta configurar AUTH_SECRET y PORTAL_ADMIN_PASSWORD en Vercel antes de poder entrar.
        </PortalNotice>
      ) : null}
      <form action="/api/admin/login" method="post" className="flex max-w-md flex-col gap-4">
        <label className="field-label">
          Clave del estudio
          <input
            className="field"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        <button className="btn-atelier-solid btn-atelier mt-2 self-start" type="submit">
          Entrar
        </button>
      </form>
    </PortalFrame>
  );
}

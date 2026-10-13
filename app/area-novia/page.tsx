import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { getSession } from "@/lib/portal/session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Área clientes",
  robots: { index: false, follow: false },
};

const errors: Record<string, string> = {
  datos: "Revisa el correo y la contraseña.",
  acceso: "No reconocemos esa cuenta. Si acabas de recibir la invitación, actívala primero.",
  invitacion: "Ese enlace ya no es válido. Pídeme uno nuevo por WhatsApp o correo.",
};

export default async function BrideLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session?.role === "client") redirect("/area-novia/panel");
  const { error } = await searchParams;
  const message = error ? errors[error] : null;

  return (
    <PortalFrame
      kicker="Área clientes"
      title="Tu espacio de inspiración"
      lead="Inicia sesión con el correo electrónico que me facilitaste y la contraseña que creaste al activar tu invitación. Aquí encontrarás la ficha de tu evento, tus fotos de inspiración y todos los documentos que vayamos compartiendo."
    >
      {message ? <PortalNotice>{message}</PortalNotice> : null}
      <form action="/api/portal/login" method="post" className="flex max-w-md flex-col gap-4">
        <label className="field-label">
          Correo
          <input className="field" name="email" type="email" required autoComplete="username" />
        </label>
        <label className="field-label">
          Contraseña
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
            Entrar
          </button>
          <a className="btn-atelier" href="/area-novia/recuperar">
            Recuperar contraseña
          </a>
        </div>
      </form>
      <p className="mt-8 max-w-md text-sm text-ash">
        ¿Aún no tienes acceso? Escríbeme y te enviaré tu invitación. Por seguridad y privacidad,
        las cuentas son personales y las gestiono yo misma para cada una de vosotras.
      </p>
    </PortalFrame>
  );
}

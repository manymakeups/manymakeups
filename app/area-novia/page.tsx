import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { getSession } from "@/lib/portal/session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Área de novia",
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
      kicker="Área de novia"
      title="Tu espacio, solo para el día."
      lead="Entras con el correo que me diste y la contraseña que creaste al activar la invitación. Aquí queda la ficha del evento, las fotos de inspiración y los documentos que te cuelgue."
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
        <button className="btn-atelier-solid btn-atelier mt-2 self-start" type="submit">
          Entrar
        </button>
      </form>
      <p className="mt-8 max-w-md text-sm text-ash">
        Si aún no tienes acceso, escríbeme y te envío la invitación. No hay alta pública: cada
        cuenta la abro yo para tu fecha.
      </p>
    </PortalFrame>
  );
}

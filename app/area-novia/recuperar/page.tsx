import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default async function RecoverPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;

  return (
    <PortalFrame
      kicker="Área clientes"
      title="Recuperar contraseña"
      lead="Escribe el correo de tu cuenta. Si está en el sistema, te enviaré un enlace para elegir una nueva."
    >
      {ok ? (
        <PortalNotice>
          Si ese correo tiene cuenta, recibirás un enlace para crear una contraseña nueva. Revisa
          también la carpeta de correo no deseado.
        </PortalNotice>
      ) : null}
      <form action="/api/portal/recover" method="post" className="flex max-w-md flex-col gap-4">
        <label className="field-label">
          Correo
          <input className="field" name="email" type="email" required autoComplete="email" />
        </label>
        <div className="mt-2 flex flex-wrap gap-3">
          <button className="btn-atelier-solid btn-atelier" type="submit">
            Enviar enlace
          </button>
          <a className="btn-atelier" href="/area-novia">
            Volver al acceso
          </a>
        </div>
      </form>
    </PortalFrame>
  );
}

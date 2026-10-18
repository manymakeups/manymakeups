import { MailSetupNotice } from "@/app/components/portal/MailSetupNotice";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { StudioAside } from "@/app/components/portal/StudioAside";
import { fullName } from "@/lib/portal/names";
import { requireAdmin } from "@/lib/portal/session";
import { listClients } from "@/lib/portal/store";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Difusión",
  robots: { index: false, follow: false },
};

export default async function BroadcastPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; sent?: string; failed?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const { error, ok, sent, failed } = await searchParams;
  const clients = await listClients();
  const active = clients.filter((client) => client.passwordHash);
  const audience = active.filter((client) => !client.commercialOptOut);
  const optedOut = active.filter((client) => client.commercialOptOut);

  return (
    <PortalFrame
      pinned
      kicker="Estudio"
      title="Difusión"
      lead="Información comercial para las clientas que ya han activado su área. Quien se da de baja no entra en el envío."
      aside={<StudioAside />}
    >
      <div data-portal-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
        <MailSetupNotice />
        {error === "datos" ? <PortalNotice>Escribe un asunto, un mensaje y elige al menos a una clienta.</PortalNotice> : null}
        {ok === "enviado" ? (
          <PortalNotice>
            Enviado a {sent || "0"}.
            {failed && failed !== "0" ? ` No he podido entregar ${failed}.` : ""}
          </PortalNotice>
        ) : null}
        <form action="/api/admin/broadcast" method="post" className="mt-6 grid max-w-xl gap-4">
          <label className="field-label">
            Asunto
            <input className="field" name="subject" required maxLength={140} />
          </label>
          <label className="field-label">
            Mensaje
            <textarea className="field min-h-40" name="message" required minLength={2} />
          </label>
          <fieldset className="border border-ink/10 p-4">
            <legend className="px-1 text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
              Reciben el correo ({audience.length})
            </legend>
            {audience.length ? (
              <ul className="mt-3 flex flex-col gap-2">
                {audience.map((client) => (
                  <li key={client.id}>
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" name="ids" value={client.id} defaultChecked />
                      <span>
                        {fullName(client.event, client.name)}
                        <span className="text-ash"> · {client.email}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ash">Todavía no hay clientas dadas de alta que acepten estos correos.</p>
            )}
          </fieldset>
          {optedOut.length ? (
            <p className="text-sm text-ash">
              No reciben información comercial: {optedOut.map((client) => fullName(client.event, client.name)).join(", ")}.
            </p>
          ) : null}
          <button className="btn-atelier btn-atelier-solid self-start" type="submit" disabled={!audience.length}>
            Enviar
          </button>
        </form>
      </div>
    </PortalFrame>
  );
}

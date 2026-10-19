import { BroadcastAudience } from "@/app/components/portal/BroadcastAudience";
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
        {error === "datos" ? <PortalNotice>Escribe un asunto y un mensaje.</PortalNotice> : null}
        {error === "vacio" ? <PortalNotice>No hay destinatarias para este envío.</PortalNotice> : null}
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
          <BroadcastAudience
            people={active.map((client) => ({
              id: client.id,
              name: fullName(client.event, client.name),
              email: client.email,
              optedOut: Boolean(client.commercialOptOut),
            }))}
          />
        </form>
      </div>
    </PortalFrame>
  );
}

import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { StudioAside } from "@/app/components/portal/StudioAside";
import { StudioInbox } from "@/app/components/portal/StudioInbox";
import { requireAdmin } from "@/lib/portal/session";
import { listClients, listNotices } from "@/lib/portal/store";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Avisos",
  robots: { index: false, follow: false },
};

export default async function StudioInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const clients = await listClients();
  const notices = await listNotices();
  const unread = notices.filter((notice) => !notice.read).length;
  const { ok, error } = await searchParams;

  return (
    <PortalFrame
      kicker="Estudio"
      title="Avisos"
      lead={
        unread
          ? `Tienes ${unread} aviso${unread === 1 ? "" : "s"} sin leer.`
          : "Cuando una clienta guarda la ficha o pide un cambio, el aviso aparece aquí."
      }
      aside={
        <StudioAside
          extra={
            <a className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" href="/privado/novias">
              Clientas
            </a>
          }
        />
      }
    >
      {ok === "respuesta" ? <PortalNotice>Respuesta enviada.</PortalNotice> : null}
      {error === "respuesta" ? <PortalNotice>Escribe un texto para responder.</PortalNotice> : null}
      {notices.length ? (
        <StudioInbox
          notices={notices}
          clients={clients.map((client) => ({
            id: client.id,
            name: client.event.clientName || client.name,
            email: client.email,
          }))}
        />
      ) : (
        <p className="text-sm text-ash">Todavía no hay avisos.</p>
      )}
    </PortalFrame>
  );
}

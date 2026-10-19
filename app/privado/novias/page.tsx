import { ClientMenu } from "@/app/components/portal/ClientMenu";
import { NewClientModal } from "@/app/components/portal/NewClientModal";
import { InviteModal } from "@/app/components/portal/InviteModal";
import { ClientSearch } from "@/app/components/portal/ClientSearch";
import { MailSetupNotice } from "@/app/components/portal/MailSetupNotice";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { StudioAside } from "@/app/components/portal/StudioAside";
import { clientMatchesSearch, clientSearchMode, presupuestoDocumentNames } from "@/lib/portal/client-search";
import { fullName } from "@/lib/portal/names";
import { requireAdmin } from "@/lib/portal/session";
import { listClients, portalStorageReady } from "@/lib/portal/store";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clientas",
  robots: { index: false, follow: false },
};

function formatEventDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function StudioClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; por?: string; q?: string; partida?: string; invite?: string; client?: string; sent?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const clients = await listClients();
  const { error, ok, por, q, partida, invite, client: inviteClient, sent } = await searchParams;
  const mode = clientSearchMode(por);
  const query = q ?? "";
  const service = partida ?? "";
  const visible = clients.filter((client) => clientMatchesSearch(client, mode, query, service));

  return (
    <PortalFrame
      pinned
      kicker="Estudio"
      title="Área clientes"
      lead="Creas la cuenta con su correo, le envías el enlace y ella elige la contraseña. Luego ves la ficha, las fotos y cuelgas los papeles."
      aside={<StudioAside />}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 pb-3 md:block md:pb-6">
        <NewClientModal />
        <ClientSearch mode={mode} query={query} partida={service} />
      </div>
      <div data-portal-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
      <MailSetupNotice />
      <form action="/api/admin/mail-samples" method="post" className="mb-4">
        <button className="text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink" type="submit">
          Enviarme las muestras de correo
        </button>
      </form>
      {!portalStorageReady() ? (
        <PortalNotice>
          En producción hace falta un almacén Vercel Blob (BLOB_READ_WRITE_TOKEN) para que fotos y
          contratos no se pierdan.
        </PortalNotice>
      ) : null}
      {error === "datos" ? <PortalNotice>Nombre y correo válidos, por favor.</PortalNotice> : null}
      {error === "existe" ? <PortalNotice>Ese correo ya tiene cuenta.</PortalNotice> : null}
      {ok === "eliminada" ? <PortalNotice>Clienta eliminada.</PortalNotice> : null}
      {ok === "muestras" ? (
        <PortalNotice>Muestras enviadas a tu correo ({sent || "0"}).</PortalNotice>
      ) : null}
      {ok === "recordatorio" && error !== "correo" ? (
        <PortalNotice>Recordatorio de activación enviado.</PortalNotice>
      ) : null}
      {ok === "recordatorio" && error === "correo" ? (
        <PortalNotice>
          No he podido enviar el recordatorio. Si acaba de generarse el enlace, cópialo y envíaselo tú.
        </PortalNotice>
      ) : null}

      <ul className="divide-y divide-ink/10 border-t border-ink/10">
        {clients.length === 0 ? (
          <li className="py-6 text-sm text-ash">Todavía no hay clientas en el área.</li>
        ) : visible.length === 0 ? (
          <li className="py-6 text-sm text-ash">Ninguna clienta coincide con la búsqueda.</li>
        ) : (
          visible.map((client) => (
            <li key={client.id} className="relative flex flex-col gap-4 py-5 has-[details[open]]:z-30 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-serif text-2xl">{fullName(client.event, client.name)}</p>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span>Tlf. {client.event.phone || "—"}</span>
                  <span>
                    Presupuesto {presupuestoDocumentNames(client).join(" · ") || "—"}
                  </span>
                  <span>Evento {client.event.eventDate ? formatEventDate(client.event.eventDate) : "—"}</span>
                </p>
                <p className="mt-1 text-sm text-ash">
                  {client.email}
                  {` · ${client.event.peopleCount} persona(s)`}
                  {client.passwordHash ? " · activa" : " · pendiente de activar"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <InviteModal
                  clientId={client.id}
                  invite={inviteClient === client.id ? invite : undefined}
                  sent={
                    inviteClient === client.id && ok === "invitacion" ? (error === "correo" ? "fail" : "ok") : undefined
                  }
                />
                <a className="btn-atelier" href={`/privado/novias/${client.id}`}>
                  Abrir
                </a>
                <ClientMenu
                  id={client.id}
                  name={fullName(client.event, client.name)}
                  phone={client.event.phone}
                  email={client.email}
                  pending={!client.passwordHash}
                />
              </div>
            </li>
          ))
        )}
      </ul>
      </div>
    </PortalFrame>
  );
}

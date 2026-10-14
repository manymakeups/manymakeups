import { ClientMenu } from "@/app/components/portal/ClientMenu";
import { ClientSearch } from "@/app/components/portal/ClientSearch";
import { MailSetupNotice } from "@/app/components/portal/MailSetupNotice";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { StudioAside } from "@/app/components/portal/StudioAside";
import { clientMatchesSearch, clientSearchMode } from "@/lib/portal/client-search";
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

export default async function StudioClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; por?: string; q?: string; partida?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const clients = await listClients();
  const { error, ok, por, q, partida } = await searchParams;
  const mode = clientSearchMode(por);
  const query = q ?? "";
  const service = partida ?? "";
  const visible = clients.filter((client) => clientMatchesSearch(client, mode, query, service));

  return (
    <PortalFrame
      kicker="Estudio"
      title="Área clientes"
      lead="Creas la cuenta con su correo, le envías el enlace y ella elige la contraseña. Luego ves la ficha, las fotos y cuelgas los papeles."
      aside={<StudioAside />}
    >
      <MailSetupNotice />
      {!portalStorageReady() ? (
        <PortalNotice>
          En producción hace falta un almacén Vercel Blob (BLOB_READ_WRITE_TOKEN) para que fotos y
          contratos no se pierdan.
        </PortalNotice>
      ) : null}
      {error === "datos" ? <PortalNotice>Nombre y correo válidos, por favor.</PortalNotice> : null}
      {error === "existe" ? <PortalNotice>Ese correo ya tiene cuenta.</PortalNotice> : null}
      {ok === "eliminada" ? <PortalNotice>Clienta eliminada.</PortalNotice> : null}

      <form action="/api/admin/clients" method="post" className="grid max-w-xl gap-4 sm:grid-cols-2">
        <label className="field-label sm:col-span-1">
          Nombre
          <input className="field" name="name" required />
        </label>
        <label className="field-label sm:col-span-1">
          Correo
          <input className="field" name="email" type="email" required />
        </label>
        <button className="btn-atelier-solid btn-atelier sm:col-span-2 self-start" type="submit">
          Crear invitación
        </button>
      </form>

      <ClientSearch mode={mode} query={query} partida={service} />

      <ul className="mt-12 divide-y divide-ink/10 border-t border-ink/10">
        {clients.length === 0 ? (
          <li className="py-6 text-sm text-ash">Todavía no hay clientas en el área.</li>
        ) : visible.length === 0 ? (
          <li className="py-6 text-sm text-ash">Ninguna clienta coincide con la búsqueda.</li>
        ) : (
          visible.map((client) => (
            <li key={client.id} className="flex flex-wrap items-center justify-between gap-3 py-5">
              <div>
                <p className="font-serif text-2xl">{fullName(client.event, client.name)}</p>
                <p className="mt-1 text-sm text-ash">
                  {client.email}
                  {client.event.eventDate ? ` · ${client.event.eventDate}` : ""}
                  {` · ${client.event.peopleCount} persona(s)`}
                  {client.passwordHash ? " · activa" : " · pendiente de activar"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a className="btn-atelier" href={`/privado/novias/${client.id}`}>
                  Abrir
                </a>
                <ClientMenu
                  id={client.id}
                  name={fullName(client.event, client.name)}
                  phone={client.event.phone}
                />
              </div>
            </li>
          ))
        )}
      </ul>
    </PortalFrame>
  );
}

import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { StudioNotices } from "@/app/components/portal/StudioNotices";
import { requireAdmin } from "@/lib/portal/session";
import { listClients, listNotices, portalStorageReady } from "@/lib/portal/store";
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
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const clients = await listClients();
  const notices = await listNotices();
  const unread = notices.filter((notice) => !notice.read).length;
  const { error } = await searchParams;

  return (
    <PortalFrame
      kicker="Estudio"
      title="Área clientes"
      lead={
        unread
          ? `Tienes ${unread} aviso${unread === 1 ? "" : "s"} nuevo${unread === 1 ? "" : "s"} del área clientas.`
          : "Creas la cuenta con su correo, le envías el enlace y ella elige la contraseña. Luego ves la ficha, las fotos y cuelgas los papeles."
      }
      aside={
        <form action="/api/portal/logout?next=/privado" method="post">
          <button className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" type="submit">
            Salir
          </button>
        </form>
      }
    >
      {!portalStorageReady() ? (
        <PortalNotice>
          En producción hace falta un almacén Vercel Blob (BLOB_READ_WRITE_TOKEN) para que fotos y
          contratos no se pierdan.
        </PortalNotice>
      ) : null}
      {error === "datos" ? <PortalNotice>Nombre y correo válidos, por favor.</PortalNotice> : null}
      {error === "existe" ? <PortalNotice>Ese correo ya tiene cuenta.</PortalNotice> : null}
      <StudioNotices notices={notices} clients={clients} next="/privado/novias" />

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

      <ul className="mt-12 divide-y divide-ink/10 border-t border-ink/10">
        {clients.length === 0 ? (
          <li className="py-6 text-sm text-ash">Todavía no hay clientas en el área.</li>
        ) : (
          clients.map((client) => (
            <li key={client.id} className="flex flex-wrap items-center justify-between gap-3 py-5">
              <div>
                <p className="font-serif text-2xl">{client.event.clientName || client.name}</p>
                <p className="mt-1 text-sm text-ash">
                  {client.email}
                  {client.event.eventDate ? ` · ${client.event.eventDate}` : ""}
                  {` · ${client.event.peopleCount} persona(s)`}
                  {client.passwordHash ? " · activa" : " · pendiente de activar"}
                </p>
              </div>
              <a className="btn-atelier" href={`/privado/novias/${client.id}`}>
                Abrir
              </a>
            </li>
          ))
        )}
      </ul>
    </PortalFrame>
  );
}

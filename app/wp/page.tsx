import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { portalFileHref } from "@/lib/portal/files";
import { plannerService } from "@/lib/portal/planner-view";
import { requirePlanner } from "@/lib/portal/session";
import { getClient } from "@/lib/portal/store";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consulta del servicio",
  robots: { index: false, follow: false },
};

function Schedule({
  title,
  location,
  rows,
  notes,
}: {
  title: string;
  location: string;
  rows: { id: string; when: string; label: string; note: string }[];
  notes: string;
}) {
  const empty = !rows.length && !location && !notes;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-3xl text-ink">{title}</h2>
      {location ? <p className="text-center uppercase tracking-[0.14em] text-ink">{location}</p> : null}
      {empty ? <p className="text-sm text-ash">Todavía no hay planning del día.</p> : null}
      {rows.length ? (
        <ul className="divide-y divide-ink/10 border border-ink/10">
          {rows.map((row) => (
            <li key={row.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[9rem_1fr] sm:items-baseline sm:gap-4">
              <p className="text-[0.72rem] uppercase tracking-[0.14em] text-gilt">{row.when || "—"}</p>
              <div>
                <p className="font-serif text-xl">{row.label}</p>
                {row.note ? <p className="mt-1 whitespace-pre-wrap text-ash">{row.note}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {notes ? <p className="whitespace-pre-wrap text-sm">{notes}</p> : null}
    </section>
  );
}

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const session = await requirePlanner();
  const client = session ? await getClient(session.clientId) : null;
  const planner = client?.planners.find((item) => item.id === session?.sub);
  if (session && (!client || !planner)) redirect("/wp?error=enlace");
  if (!session || !client || !planner) {
    return (
      <PortalFrame
        kicker="Consulta"
        title={error === "enlace" ? "Enlace no válido" : "Acceso de consulta"}
        lead={error === "enlace" ? "Pide a Many Makeups un acceso nuevo." : "Abre el enlace que te he enviado por correo."}
      >
        <PortalNotice>
          {error === "enlace"
            ? "Este enlace ya no sirve. Si te corresponde ver el servicio, escríbeme y te mando otro."
            : "Este acceso es personal y solo sirve para consultar el servicio. Entra desde el correo."}
        </PortalNotice>
      </PortalFrame>
    );
  }

  const service = plannerService(client);
  const quotes = client.documents.filter((file) => file.label === "Presupuesto");
  const contracts = client.documents.filter((file) => file.label === "Contrato");

  return (
    <PortalFrame
      pinned
      kicker="Consulta"
      title={service.name}
      lead="Puedes ver el servicio y descargar el planning, los presupuestos y los contratos. No se puede modificar nada."
      aside={
        <form action="/api/portal/logout?next=/wp" method="post">
          <button className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" type="submit">
            Salir
          </button>
        </form>
      }
    >
      <div data-portal-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
        <dl className="grid max-w-2xl gap-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-ash">Estilista asignado</dt>
            <dd className="mt-1 font-serif text-2xl">{service.stylist || "—"}</dd>
          </div>
          <div>
            <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-ash">Fecha</dt>
            <dd className="mt-1">{service.date || "—"}</dd>
          </div>
          <div>
            <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-ash">Lugar</dt>
            <dd className="mt-1">{service.venue || "—"}</dd>
          </div>
          <div>
            <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-ash">Servicios</dt>
            <dd className="mt-1">{service.services || "—"}</dd>
          </div>
        </dl>

        <div className="mt-10 flex max-w-2xl flex-col gap-10">
          {service.blocks.map((block) => (
            <div key={block.id} className="flex flex-col gap-4">
              <Schedule title={block.title} location={block.location} rows={block.rows} notes={block.notes} />
              {block.policy ? (
                <div className="flex flex-col gap-3 text-sm leading-6 text-ink">
                  <p className="font-serif text-xl">{service.policyTitle}</p>
                  <p>{service.policy}</p>
                  <p>
                    <strong>{service.important}</strong> {service.importantBody}
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <section className="mt-12 max-w-2xl">
          <h2 className="font-serif text-3xl text-ink">Descargas</h2>
          <ul className="mt-4 divide-y divide-ink/10 border border-ink/10">
            <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <p>Planning</p>
              <a className="btn-atelier" href="/api/wp/planning">
                Descargar
              </a>
            </li>
            {quotes.map((file) => (
              <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">Presupuesto</p>
                  <p>{file.name}</p>
                </div>
                <a className="btn-atelier" href={portalFileHref(client.id, file.id, true)}>
                  Descargar
                </a>
              </li>
            ))}
            {contracts.map((file) => (
              <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">Contrato</p>
                  <p>{file.name}</p>
                </div>
                <a className="btn-atelier" href={portalFileHref(client.id, file.id, true)}>
                  Descargar
                </a>
              </li>
            ))}
            {!quotes.length ? <li className="px-4 py-4 text-sm text-ash">Todavía no hay presupuestos.</li> : null}
            {!contracts.length ? <li className="px-4 py-4 text-sm text-ash">Todavía no hay contratos.</li> : null}
          </ul>
        </section>
      </div>
    </PortalFrame>
  );
}

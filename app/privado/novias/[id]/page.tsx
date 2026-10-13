import { CopyInvite, DeleteFileButton } from "@/app/components/portal/FileActions";
import { PaymentsForm } from "@/app/components/portal/PaymentsBlock";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { isImageType } from "@/lib/portal/files";
import { CONTRACTOR_INSPIRATION, DOCUMENT_KINDS, euros } from "@/lib/portal/types";
import { requireAdmin } from "@/lib/portal/session";
import { getClient } from "@/lib/portal/store";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ficha de clienta",
  robots: { index: false, follow: false },
};

function fileHref(clientId: string, id: string, download = false) {
  const extra = download ? "&download=1" : "";
  return `/api/portal/file?client=${clientId}&id=${id}${extra}`;
}

export default async function StudioClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invite?: string; ok?: string; error?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();
  const { invite, ok, error } = await searchParams;
  const event = client.event;

  return (
    <PortalFrame
      kicker="Estudio"
      title={event.clientName || client.name}
      lead={client.email}
      aside={
        <a className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" href="/privado/novias">
          Todas
        </a>
      }
    >
      {ok === "doc" ? <PortalNotice>Documento colgado.</PortalNotice> : null}
      {ok === "pagos" ? <PortalNotice>Pagos actualizados.</PortalNotice> : null}
      {error === "archivo" ? <PortalNotice>Ese archivo no se puede colgar.</PortalNotice> : null}
      {invite ? (
        <PortalNotice>
          Enlace de activación (21 días, un uso). Envíaselo por WhatsApp o correo:
          <span className="mt-3 block break-all normal-case tracking-normal text-sm">{invite}</span>
          <span className="mt-3 block">
            <CopyInvite url={invite} />
          </span>
        </PortalNotice>
      ) : null}

      <form action="/api/admin/invite" method="post" className="mb-10">
        <input type="hidden" name="id" value={client.id} />
        <button className="btn-atelier" type="submit">
          Generar enlace nuevo
        </button>
      </form>

      <section className="border-t border-ink/10 pt-8">
        <h2 className="font-serif text-3xl">Ficha del evento</h2>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ash">Pareja</dt>
            <dd>{event.partnerName || "—"}</dd>
          </div>
          <div>
            <dt className="text-ash">Teléfono</dt>
            <dd>{event.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-ash">Tipo</dt>
            <dd>{event.eventType}</dd>
          </div>
          <div>
            <dt className="text-ash">Fecha</dt>
            <dd>{event.eventDate || "—"}</dd>
          </div>
          <div>
            <dt className="text-ash">Lugar</dt>
            <dd>{event.venue || "—"}</dd>
          </div>
          <div>
            <dt className="text-ash">Preparación</dt>
            <dd>
              {event.gettingReadyPlace || "—"} {event.gettingReadyTime}
            </dd>
          </div>
          <div>
            <dt className="text-ash">Ceremonia</dt>
            <dd>{event.ceremonyTime || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-ash">Servicios de la contratante</dt>
            <dd>
              {[
                event.makeup && "maquillaje",
                event.hair && "peinado",
                event.glitterBar && "glitter bar",
                event.beautyCorner && "beauty corner",
              ]
                .filter(Boolean)
                .join(" · ") || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-ash">Prueba (contratante)</dt>
            <dd className="whitespace-pre-wrap">{event.trialNotes || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-ash">Piel (contratante)</dt>
            <dd className="whitespace-pre-wrap">{event.skinNotes || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-ash">Notas (contratante)</dt>
            <dd className="whitespace-pre-wrap">{event.notes || "—"}</dd>
          </div>
        </dl>
        {event.people.length ? (
          <ul className="mt-8 divide-y divide-ink/10 border border-ink/10">
            {event.people.map((person, i) => (
              <li key={i} className="grid gap-3 px-4 py-4 sm:grid-cols-2">
                <p>
                  <span className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
                    Persona {i + 1}
                  </span>
                  <span className="mt-1 block">{person.who || "—"}</span>
                  <span className="mt-1 block text-sm text-ash">{person.service || "—"}</span>
                </p>
                <div className="text-sm">
                  <p>{person.wantsTrial ? "Quiere prueba" : "Sin prueba"}</p>
                  {person.wantsTrial ? (
                    <div className="mt-2 space-y-2 whitespace-pre-wrap text-ash">
                      {person.trialNotes ? <p>Prueba: {person.trialNotes}</p> : null}
                      {person.skinNotes ? <p>Alergias: {person.skinNotes}</p> : null}
                      {person.notes ? <p>Notas: {person.notes}</p> : null}
                    </div>
                  ) : null}
                  {person.budgetAmount || person.budgetNumber ? (
                    <p className="mt-2">
                      {person.budgetAmount
                        ? euros(Number(person.budgetAmount) || 0)
                        : "—"}{" "}
                      · nº {person.budgetNumber || "—"}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-12 border-t border-ink/10 pt-8">
        <h2 className="font-serif text-3xl">Pagos</h2>
        <p className="mt-3 max-w-2xl text-sm text-ash">
          Indica el importe de la prueba y del evento y marca si está abonado. Lo pendiente se
          calcula solo.
        </p>
        <div className="mt-8">
          <PaymentsForm clientId={client.id} payments={client.payments} />
        </div>
      </section>

      <section className="mt-12 border-t border-ink/10 pt-8">
        <h2 className="font-serif text-3xl">Inspiración</h2>
        {client.inspiration.length ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {client.inspiration.map((file) => {
              const owner =
                file.label === CONTRACTOR_INSPIRATION || file.label === "Inspiración"
                  ? "Contratante"
                  : file.label.startsWith("persona-")
                    ? `Persona ${Number(file.label.slice("persona-".length)) + 1}`
                    : file.label;
              return (
                <li key={file.id}>
                  {isImageType(file.mime) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fileHref(client.id, file.id)} alt="" className="aspect-[4/5] w-full object-cover" />
                  ) : null}
                  <p className="mt-2 text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{owner}</p>
                  <a className="mt-1 inline-block text-sm underline" href={fileHref(client.id, file.id, true)}>
                    {file.name}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ash">Aún no ha subido fotos.</p>
        )}
      </section>

      <section className="mt-12 border-t border-ink/10 pt-8">
        <h2 className="font-serif text-3xl">Documentación</h2>
        <p className="mt-3 max-w-2xl text-sm text-ash">
          Presupuestos, contratos, facturas y el resto de papeles. Ella los ve en su área.
        </p>
        <form
          action="/api/admin/documents"
          method="post"
          encType="multipart/form-data"
          className="mt-6 grid max-w-xl gap-4"
        >
          <input type="hidden" name="clientId" value={client.id} />
          <label className="field-label">
            Tipo
            <select className="field" name="label" required defaultValue="Presupuesto">
              {DOCUMENT_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Archivo (PDF o imagen)
            <input className="field" name="file" type="file" required />
          </label>
          <button className="btn-atelier-solid btn-atelier self-start" type="submit">
            Colgar
          </button>
        </form>
        {client.documents.length ? (
          <ul className="mt-8 divide-y divide-ink/10 border border-ink/10">
            {client.documents.map((file) => (
              <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{file.label}</p>
                  <p>{file.name}</p>
                </div>
                <div className="flex gap-4">
                  <a className="btn-atelier" href={fileHref(client.id, file.id, true)}>
                    Ver
                  </a>
                  <DeleteFileButton
                    id={file.id}
                    clientId={client.id}
                    kind="document"
                    label="Quitar"
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </PortalFrame>
  );
}

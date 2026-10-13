import { AgendaForm } from "@/app/components/portal/AgendaBlock";
import { CopyInvite, DeleteFileButton } from "@/app/components/portal/FileActions";
import { PaymentsForm } from "@/app/components/portal/PaymentsBlock";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { PortalTabs } from "@/app/components/portal/PortalTabs";
import { WorkForm } from "@/app/components/portal/WorkBlock";
import { portalFileHref } from "@/lib/portal/files";
import {
  CONTRACTOR_TRIAL_PHOTOS,
  DOCUMENT_KINDS,
  personTrialPhotoKey,
  portalTab,
} from "@/lib/portal/types";
import { requireAdmin } from "@/lib/portal/session";
import { getClient } from "@/lib/portal/store";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ficha de clienta",
  robots: { index: false, follow: false },
};

export default async function StudioClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invite?: string; ok?: string; error?: string; tab?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();
  const { invite, ok, error, tab: tabRaw } = await searchParams;
  const event = client.event;
  const tab = portalTab(tabRaw);

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
      {ok === "agenda" ? <PortalNotice>Agenda actualizada.</PortalNotice> : null}
      {ok === "estudio" ? <PortalNotice>Productos guardados.</PortalNotice> : null}
      {ok === "fotos" ? <PortalNotice>Fotos de la prueba colgadas.</PortalNotice> : null}
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

      <form action="/api/admin/invite" method="post" className="mb-6">
        <input type="hidden" name="id" value={client.id} />
        <button className="btn-atelier" type="submit">
          Generar enlace nuevo
        </button>
      </form>

      <PortalTabs basePath={`/privado/novias/${client.id}`} active={tab} />

      {tab === "contratante" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">Ficha de la contratante</h2>
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
              <dt className="text-ash">Servicios</dt>
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
              <dt className="text-ash">Prueba</dt>
              <dd className="whitespace-pre-wrap">{event.trialNotes || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-ash">Piel</dt>
              <dd className="whitespace-pre-wrap">{event.skinNotes || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-ash">Notas</dt>
              <dd className="whitespace-pre-wrap">{event.notes || "—"}</dd>
            </div>
          </dl>
          <div className="mt-12 border-t border-ink/10 pt-8">
            <h3 className="font-serif text-3xl">Fotos de la prueba y productos</h3>
            <div className="mt-6">
              <WorkForm
                clientId={client.id}
                personKey={CONTRACTOR_TRIAL_PHOTOS}
                productsName="productsUsed"
                products={event.productsUsed}
                photos={client.workPhotos}
                tab="contratante"
              />
            </div>
          </div>
        </section>
      ) : null}

      {tab === "acompanantes" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">Acompañantes</h2>
          {event.people.length ? (
            <div className="mt-8 flex flex-col gap-10">
              {event.people.map((person, i) => (
                <article key={i} className="border border-ink/10 p-5">
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
                    Persona {i + 1}
                  </p>
                  <p className="mt-2 font-serif text-2xl">{person.who || "—"}</p>
                  <p className="mt-1 text-sm text-ash">{person.service}</p>
                  <div className="mt-4 space-y-2 whitespace-pre-wrap text-sm">
                    <p>Alergias: {person.skinNotes || "—"}</p>
                    <p>Notas: {person.notes || "—"}</p>
                    <p>{person.wantsTrial ? "Quiere prueba" : "Sin prueba"}</p>
                    {person.wantsTrial ? <p>Prueba: {person.trialNotes || "—"}</p> : null}
                  </div>
                  {person.wantsTrial ? (
                    <div className="mt-6 border-t border-ink/10 pt-6">
                      <WorkForm
                        clientId={client.id}
                        personKey={personTrialPhotoKey(i)}
                        productsName={`people.${i}.productsUsed`}
                        products={person.productsUsed}
                        photos={client.workPhotos}
                        tab="acompanantes"
                      />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ash">Todavía no ha añadido acompañantes.</p>
          )}
        </section>
      ) : null}

      {tab === "facturacion" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">Facturación</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">
            Reserva, prueba (si la hay) y día del evento, para ella y para cada acompañante.
          </p>
          <div className="mt-8">
            <PaymentsForm
              clientId={client.id}
              payments={client.payments}
              people={event.people}
            />
          </div>
        </section>
      ) : null}

      {tab === "documentacion" ? (
        <section className="pt-10">
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
              <input className="field" name="file" required type="file" />
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
                    <a className="btn-atelier" href={portalFileHref(client.id, file.id, true)}>
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
      ) : null}

      {tab === "agenda" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">Agenda</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">
            Citas planificadas y las que ya hayáis tenido. Ella las ve en su panel.
          </p>
          <div className="mt-8">
            <AgendaForm clientId={client.id} appointments={client.appointments} />
          </div>
        </section>
      ) : null}
    </PortalFrame>
  );
}

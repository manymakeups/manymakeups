import { AgendaForm } from "@/app/components/portal/AgendaBlock";
import { BudgetView, HistoryForm } from "@/app/components/portal/HistoryBlock";
import { CompanionsForm } from "@/app/components/portal/CompanionsForm";
import { CopyInvite, DeleteFileButton } from "@/app/components/portal/FileActions";
import { EventForm } from "@/app/components/portal/EventForm";
import { MailSetupNotice } from "@/app/components/portal/MailSetupNotice";
import { PaymentsForm } from "@/app/components/portal/PaymentsBlock";
import { PhotoGrid } from "@/app/components/portal/PhotoPicker";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { PortalTabs } from "@/app/components/portal/PortalTabs";
import { EventSections, SubTabs } from "@/app/components/portal/SubTabs";
import { StudioAside } from "@/app/components/portal/StudioAside";
import { WorkForm } from "@/app/components/portal/WorkBlock";
import { portalEs } from "@/lib/i18n/portal-messages";
import { fullName } from "@/lib/portal/names";
import { portalFileHref } from "@/lib/portal/files";
import {
  CONTRACTOR_INSPIRATION,
  CONTRACTOR_TRIAL_PHOTOS,
  DOCUMENT_KINDS,
  filesFor,
  personInspirationKey,
  personTrialPhotoKey,
  portalTab,
} from "@/lib/portal/types";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, listNotices } from "@/lib/portal/store";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ficha de clienta",
  robots: { index: false, follow: false },
};

export default async function StudioClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invite?: string; ok?: string; error?: string; tab?: string; com?: string; sec?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();
  const requests = (await listNotices()).filter((notice) => notice.clientId === client.id && notice.kind === "cambio");
  const { invite, ok, error, tab: tabRaw, com, sec } = await searchParams;
  const event = client.event;
  const tab = portalTab(tabRaw);

  return (
    <PortalFrame
      pinned
      kicker="Estudio"
      title={fullName(event, client.name)}
      lead={client.email}
      aside={
        <StudioAside
          extra={
            <a className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" href="/privado/novias">
              Todas
            </a>
          }
        />
      }
    >
      <div className="shrink-0">
      <form action="/api/admin/invite" method="post" className="mt-8">
        <input type="hidden" name="id" value={client.id} />
        <button className="btn-atelier" type="submit">
          Generar enlace nuevo
        </button>
      </form>

      <PortalTabs basePath={`/privado/novias/${client.id}`} active={tab} />
      </div>
      <div data-portal-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
      <div className="pt-6">
      {ok === "doc" ? <PortalNotice>Documento colgado.</PortalNotice> : null}
      {ok === "pagos" ? <PortalNotice>Pagos actualizados.</PortalNotice> : null}
      {ok === "agenda" ? <PortalNotice>Agenda actualizada.</PortalNotice> : null}
      {ok === "historico" ? <PortalNotice>Histórico actualizado. Ella ya lo ve en su área.</PortalNotice> : null}
      {ok === "estudio" ? <PortalNotice>Productos guardados.</PortalNotice> : null}
      {ok === "fotos" ? <PortalNotice>Fotos de la prueba colgadas.</PortalNotice> : null}
      {ok === "mensaje" ? <PortalNotice>Mensaje enviado. Ella lo ve en comunicaciones.</PortalNotice> : null}
      {error === "mensaje" ? <PortalNotice>Escribe el mensaje antes de enviarlo.</PortalNotice> : null}
      {error === "correo" && ok === "mensaje" ? (
        <PortalNotice>El mensaje está en comunicaciones, pero no he podido enviarle el correo.</PortalNotice>
      ) : null}
      <MailSetupNotice />
      {ok === "ficha" && error !== "correo" ? (
        <PortalNotice>Ficha actualizada. Ella ya ve los cambios y le he enviado un correo.</PortalNotice>
      ) : null}
      {ok === "ficha" && error === "correo" ? (
        <PortalNotice>
          Ficha actualizada y ella ya la ve, pero no he podido enviarle el correo. Falta
          RESEND_API_KEY en Vercel.
        </PortalNotice>
      ) : null}
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
      </div>

      {tab === "contratante" ? (
        <section className="pt-8">
          <EventSections
            section={sec}
            labels={{
              data: "Datos del evento",
              inspirations: "Inspiraciones",
              look: "Maquillaje y Peinado",
              trial: "Prueba",
              photos: "Fotos",
              products: "Productos",
            }}
            details={
              <div>
                <p className="max-w-2xl text-sm text-ash">
                  Si pide un cambio, corrige aquí y guarda. Ella lo verá en su área, sin poder editarlo.
                </p>
                <div className="mt-8">
                  <EventForm
                    event={event}
                    clientId={client.id}
                    inspiration={client.inspiration}
                    action="/api/admin/event"
                    submitLabel="Guardar ficha"
                    copy={portalEs}
                    includeClientId
                    showInspiration={false}
                  />
                </div>
              </div>
            }
            inspiration={
              filesFor(client.inspiration, CONTRACTOR_INSPIRATION).length ? (
                <PhotoGrid
                  files={filesFor(client.inspiration, CONTRACTOR_INSPIRATION)}
                  clientId={client.id}
                  kind="inspiration"
                />
              ) : (
                <p className="text-sm text-ash">Todavía no ha colgado fotos de inspiración.</p>
              )
            }
            photos={
              <WorkForm
                mode="photos"
                clientId={client.id}
                personKey={CONTRACTOR_TRIAL_PHOTOS}
                fieldPrefix="products."
                products={event.productsUsed}
                productLines={event.products}
                photos={client.workPhotos}
                tab="contratante"
              />
            }
            products={
              <WorkForm
                mode="products"
                clientId={client.id}
                personKey={CONTRACTOR_TRIAL_PHOTOS}
                fieldPrefix="products."
                products={event.productsUsed}
                productLines={event.products}
                photos={client.workPhotos}
                tab="contratante"
              />
            }
          />
        </section>
      ) : null}

      {tab === "acompanantes" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">Acompañantes</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">
            Corrige quiénes son, servicios y prueba. Al guardar, ella lo ve actualizado en su área.
          </p>
          <div className="mt-8">
            <CompanionsForm
              event={event}
              clientId={client.id}
              inspiration={client.inspiration}
              workPhotos={client.workPhotos}
              action="/api/admin/companions"
              copy={portalEs}
              includeClientId
              showInspiration={false}
              showTrialWork={false}
              submitLabel="Guardar acompañantes"
            />
          </div>
          {event.people.length ? (
            <div className="mt-12 flex flex-col gap-10 border-t border-ink/10 pt-10">
              {event.people.map((person, i) => (
                <article key={i} className="border border-ink/10 p-5">
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
                    Persona {i + 1} · {person.who || "—"}
                  </p>
                  <div className="mt-6">
                    <p className="text-[0.68rem] uppercase tracking-[0.16em] text-ash">Inspiraciones</p>
                    <div className="mt-3">
                      {filesFor(client.inspiration, personInspirationKey(i)).length ? (
                        <PhotoGrid
                          files={filesFor(client.inspiration, personInspirationKey(i))}
                          clientId={client.id}
                          kind="inspiration"
                        />
                      ) : (
                        <p className="text-sm text-ash">Todavía no ha colgado fotos de inspiración.</p>
                      )}
                    </div>
                  </div>
                  {person.wantsTrial ? (
                    <div className="mt-6 border-t border-ink/10 pt-6">
                      <WorkForm
                        clientId={client.id}
                        personKey={personTrialPhotoKey(i)}
                        fieldPrefix={`people.${i}.products.`}
                        products={person.productsUsed}
                        productLines={person.products}
                        photos={client.workPhotos}
                        tab="acompanantes"
                      />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
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

      {tab === "historico" ? (
        <section className="pt-8">
          <h2 className="font-serif text-3xl">Comunicaciones</h2>
          <div className="mt-8">
            <SubTabs
              initial={com === "nueva" || ok === "mensaje" ? "nueva" : "historico"}
              tabs={[
                {
                  id: "historico",
                  label: "Histórico",
                  body: (
                    <HistoryForm
                      clientId={client.id}
                      entries={client.history}
                      requests={requests}
                      clientName={fullName(event, client.name)}
                    />
                  ),
                },
                {
                  id: "nueva",
                  label: "Nueva comunicación",
                  body: (
                    <form action="/api/admin/notices" method="post" className="flex max-w-xl flex-col gap-3">
                      <input type="hidden" name="intent" value="compose" />
                      <input type="hidden" name="clientId" value={client.id} />
                      <input type="hidden" name="next" value={`/privado/novias/${client.id}?tab=historico&com=nueva`} />
                      <p className="text-sm text-ash">Ella lo lee en comunicaciones, firmado como Ana Zarza.</p>
                      <label className="field-label">
                        Mensaje
                        <textarea className="field min-h-28" name="message" required minLength={2} />
                      </label>
                      <button className="btn-atelier self-start" type="submit">
                        Enviar
                      </button>
                    </form>
                  ),
                },
              ]}
            />
          </div>
        </section>
      ) : null}

      {tab === "budget" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">Budget</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">
            El resumen junta el evento y los otros gastos, estén pagados o pendientes. Ella lo ve igual en su budget.
          </p>
          <div className="mt-8">
            <BudgetView
              entries={client.history}
              event={client.event}
              payments={client.payments}
              billing={<PaymentsForm clientId={client.id} payments={client.payments} people={event.people} />}
            />
          </div>
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
      </div>
    </PortalFrame>
  );
}

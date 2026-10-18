import { AgendaLists, NewAppointmentModal } from "@/app/components/portal/AgendaBlock";
import { BudgetView, HistoryComposer, HistoryForm } from "@/app/components/portal/HistoryBlock";
import { AddCompanionModal, PersonDataForm, RemoveCompanionButton } from "@/app/components/portal/CompanionsForm";
import { DeleteFileButton } from "@/app/components/portal/FileActions";
import { EventForm } from "@/app/components/portal/EventForm";
import { MailSetupNotice } from "@/app/components/portal/MailSetupNotice";
import { PhotoGrid } from "@/app/components/portal/PhotoPicker";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { StudioNav } from "@/app/components/portal/PortalTabs";
import { CompanionDeck, EventSections, SubTabs } from "@/app/components/portal/SubTabs";
import { StudioAside } from "@/app/components/portal/StudioAside";
import { LookNotesForm, WorkForm } from "@/app/components/portal/WorkBlock";
import { portalEs } from "@/lib/i18n/portal-messages";
import { companionHeading, fullName } from "@/lib/portal/names";
import { portalFileHref } from "@/lib/portal/files";
import {
  CONTRACTOR_TRIAL_PHOTOS,
  DOCUMENT_KINDS,
  contractorInspirationKey,
  filesFor,
  personInspirationLookKey,
  personTrialPhotoKey,
  portalTab,
  productsFor,
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
  searchParams: Promise<{ ok?: string; error?: string; tab?: string; com?: string; sec?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();
  const requests = (await listNotices()).filter((notice) => notice.clientId === client.id && notice.kind === "cambio");
  const { ok, error, tab: tabRaw, com, sec } = await searchParams;
  const event = client.event;
  const tab = portalTab(tabRaw);

  return (
    <PortalFrame
      pinned
      dense
      kicker="Estudio"
      title={fullName(event, client.name)}
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
      <div className="relative z-30 min-w-0 shrink-0">
        <StudioNav basePath={`/privado/novias/${client.id}`} active={tab} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-4">
      <div className="shrink-0 pt-6">
      {ok === "doc" ? <PortalNotice>Documento colgado.</PortalNotice> : null}
      {ok === "pagos" ? <PortalNotice>Pagos actualizados.</PortalNotice> : null}
      {ok === "agenda" ? <PortalNotice>Agenda actualizada.</PortalNotice> : null}
      {ok === "historico" ? <PortalNotice>Histórico actualizado. Ella ya lo ve en su área.</PortalNotice> : null}
      {ok === "estudio" ? <PortalNotice>Productos guardados.</PortalNotice> : null}
      {ok === "fotos" ? <PortalNotice>Fotos de la prueba colgadas.</PortalNotice> : null}
      {ok === "mensaje" ? <PortalNotice>Mensaje enviado. Ella lo ve en comunicaciones.</PortalNotice> : null}
      {ok === "respuesta" ? <PortalNotice>Respuesta enviada. Ella la ve en comunicaciones.</PortalNotice> : null}
      {error === "mensaje" ? <PortalNotice>Escribe el mensaje antes de enviarlo.</PortalNotice> : null}
      {error === "respuesta" ? <PortalNotice>Escribe la respuesta antes de enviarla.</PortalNotice> : null}
      {error === "correo" && ok === "mensaje" ? (
        <PortalNotice>El mensaje está en comunicaciones, pero no he podido enviarle el correo.</PortalNotice>
      ) : null}
      {error === "correo" && ok === "respuesta" ? (
        <PortalNotice>La respuesta está en comunicaciones, pero no he podido enviarle el correo.</PortalNotice>
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
      </div>

      {tab === "contratante" ? (
        <section className="flex min-h-0 flex-1 flex-col pt-4">
          <EventSections
            variant="filters"
            section={sec}
            labels={{
              data: "Datos del evento",
              inspirations: "Inspiraciones",
              makeup: "Maquillaje",
              hair: "Peinado",
              trial: "Prueba",
              photos: "Fotografías",
              products: "Productos",
              comments: "Comentarios",
            }}
            details={
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
            }
            makeupInspiration={
              filesFor(client.inspiration, contractorInspirationKey("maquillaje")).length ? (
                <PhotoGrid
                  files={filesFor(client.inspiration, contractorInspirationKey("maquillaje"))}
                  clientId={client.id}
                  kind="inspiration"
                />
              ) : (
                <p className="text-sm text-ash">Todavía no ha colgado fotos de maquillaje.</p>
              )
            }
            hairInspiration={
              filesFor(client.inspiration, contractorInspirationKey("peinado")).length ? (
                <PhotoGrid
                  files={filesFor(client.inspiration, contractorInspirationKey("peinado"))}
                  clientId={client.id}
                  kind="inspiration"
                />
              ) : (
                <p className="text-sm text-ash">Todavía no ha colgado fotos de peinado.</p>
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
                photoSection="fotos"
              />
            }
            makeupProducts={
              <WorkForm
                mode="products"
                look="maquillaje"
                section="productos-maquillaje"
                clientId={client.id}
                personKey={CONTRACTOR_TRIAL_PHOTOS}
                fieldPrefix="products."
                products={event.productsUsed}
                productLines={productsFor(event.products, "maquillaje")}
                photos={client.workPhotos}
                tab="contratante"
              />
            }
            hairProducts={
              <WorkForm
                mode="products"
                look="peinado"
                section="productos-peinado"
                clientId={client.id}
                personKey={CONTRACTOR_TRIAL_PHOTOS}
                fieldPrefix="products."
                products={event.productsUsed}
                productLines={productsFor(event.products, "peinado")}
                photos={client.workPhotos}
                tab="contratante"
              />
            }
            trialComments={
              <div className="flex flex-col gap-4">
                {event.trialNotes.trim() && !event.makeupNotes.trim() && !event.hairNotes.trim() ? (
                  <p className="whitespace-pre-wrap text-sm">{event.trialNotes}</p>
                ) : null}
                <LookNotesForm
                  clientId={client.id}
                  tab="contratante"
                  section="comentarios"
                  makeupNotes={event.makeupNotes}
                  hairNotes={event.hairNotes}
                />
              </div>
            }
          />
        </section>
      ) : null}

      {tab === "acompanantes" ? (
        <section className="flex min-h-0 flex-1 flex-col pt-2">
          <div className="shrink-0">
            <AddCompanionModal clientId={client.id} action="/api/admin/companions" copy={portalEs} includeClientId />
          </div>
          <div className="mt-3 flex min-h-0 flex-1 flex-col">
            {event.people.length ? (
              <CompanionDeck
                initial={sec?.match(/^(\d+)/)?.[1]}
                tabs={event.people.map((person, i) => {
                  const piece = sec?.startsWith(`${i}-`) ? sec.slice(`${i}-`.length) : undefined;
                  const ownInspiration = client.inspiration.filter((file) => {
                    const label = file.label;
                    return label === `persona-${i}` || label === `persona-${i}-maquillaje` || label === `persona-${i}-peinado`;
                  });
                  const makeupPhotos = filesFor(ownInspiration, personInspirationLookKey(i, "maquillaje"));
                  const hairPhotos = filesFor(ownInspiration, personInspirationLookKey(i, "peinado"));
                  const trialPhotos = filesFor(client.workPhotos, personTrialPhotoKey(i));
                  const heading = companionHeading(person, portalEs.whoOptions, `Persona ${i + 1}`);
                  return {
                    id: String(i),
                    label: heading,
                    remove: <RemoveCompanionButton clientId={client.id} index={i} name={heading} label="Quitar" />,
                    body: (
                      <EventSections
                        variant="filters"
                        section={piece}
                        labels={{
                          data: "Datos del evento",
                          inspirations: "Inspiraciones",
                          makeup: "Maquillaje",
                          hair: "Peinado",
                          trial: "Prueba",
                          photos: "Fotografías",
                          products: "Productos",
                          comments: "Comentarios",
                        }}
                        details={
                          <PersonDataForm
                            person={person}
                            index={i}
                            clientId={client.id}
                            action="/api/admin/companions"
                            copy={portalEs}
                          />
                        }
                        makeupInspiration={
                          makeupPhotos.length ? (
                            <PhotoGrid files={makeupPhotos} clientId={client.id} kind="inspiration" />
                          ) : (
                            <p className="text-sm text-ash">Todavía no ha colgado fotos de maquillaje.</p>
                          )
                        }
                        hairInspiration={
                          hairPhotos.length ? (
                            <PhotoGrid files={hairPhotos} clientId={client.id} kind="inspiration" />
                          ) : (
                            <p className="text-sm text-ash">Todavía no ha colgado fotos de peinado.</p>
                          )
                        }
                        photos={
                          <WorkForm
                            mode="photos"
                            clientId={client.id}
                            personKey={personTrialPhotoKey(i)}
                            fieldPrefix={`people.${i}.products.`}
                            products={person.productsUsed}
                            photos={trialPhotos}
                            tab="acompanantes"
                            photoSection={`${i}-fotos`}
                          />
                        }
                        makeupProducts={
                          <WorkForm
                            mode="products"
                            look="maquillaje"
                            section={`${i}-productos-maquillaje`}
                            personIndex={i}
                            clientId={client.id}
                            personKey={personTrialPhotoKey(i)}
                            fieldPrefix={`people.${i}.products.`}
                            products={person.productsUsed}
                            productLines={productsFor(person.products, "maquillaje")}
                            photos={trialPhotos}
                            tab="acompanantes"
                          />
                        }
                        hairProducts={
                          <WorkForm
                            mode="products"
                            look="peinado"
                            section={`${i}-productos-peinado`}
                            personIndex={i}
                            clientId={client.id}
                            personKey={personTrialPhotoKey(i)}
                            fieldPrefix={`people.${i}.products.`}
                            products={person.productsUsed}
                            productLines={productsFor(person.products, "peinado")}
                            photos={trialPhotos}
                            tab="acompanantes"
                          />
                        }
                        trialComments={
                          <div className="flex flex-col gap-4">
                            {person.trialNotes.trim() && !person.makeupNotes.trim() && !person.hairNotes.trim() ? (
                              <p className="whitespace-pre-wrap text-sm">{person.trialNotes}</p>
                            ) : null}
                            <LookNotesForm
                              clientId={client.id}
                              tab="acompanantes"
                              section={`${i}-comentarios`}
                              personIndex={i}
                              makeupNotes={person.makeupNotes}
                              hairNotes={person.hairNotes}
                            />
                          </div>
                        }
                      />
                    ),
                  };
                })}
              />
            ) : (
              <p className="pt-6 text-sm text-ash">Todavía no hay acompañantes.</p>
            )}
          </div>
        </section>
      ) : null}

      {tab === "documentacion" ? (
        <section className="flex min-h-0 flex-1 flex-col pt-2">
          <div data-portal-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
          <form
            action="/api/admin/documents"
            method="post"
            encType="multipart/form-data"
            className="grid max-w-xl gap-4"
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
          </div>
        </section>
      ) : null}

      {tab === "historico" ? (
        <section className="flex min-h-0 flex-1 flex-col pt-2">
          <div className="flex min-h-0 flex-1 flex-col">
            <SubTabs
              fill
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
        <section className="flex min-h-0 flex-1 flex-col pt-2">
          <div data-portal-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
            <BudgetView
              entries={client.history}
              payments={client.payments}
              people={event.people}
              contractorLabel={fullName(event, client.name)}
              clientId={client.id}
              expenseLabel="Nuevo gasto"
              expense={
                <HistoryComposer
                  clientId={client.id}
                  returnTab="budget"
                  people={[
                    { id: "contractor", label: fullName(event, client.name) || "Contratante" },
                    ...event.people.map((person, index) => ({
                      id: `g:${index}`,
                      label: companionHeading(person, portalEs.whoOptions, `Acompañante ${index + 1}`),
                    })),
                  ]}
                />
              }
            />
          </div>
        </section>
      ) : null}

      {tab === "agenda" ? (
        <section className="flex min-h-0 flex-1 flex-col pt-2">
          <div className="shrink-0">
            <NewAppointmentModal clientId={client.id} />
          </div>
          <div data-portal-scroll className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
            <AgendaLists clientId={client.id} appointments={client.appointments} />
          </div>
        </section>
      ) : null}
      </div>
    </PortalFrame>
  );
}

import { AgendaView } from "@/app/components/portal/AgendaBlock";
import { SendDocumentModal } from "@/app/components/portal/SendDocumentModal";
import { ClientCalendar } from "@/app/components/portal/ClientCalendar";
import { BudgetView, HistoryView } from "@/app/components/portal/HistoryBlock";
import { ClientCompose } from "@/app/components/portal/ClientCompose";
import { CompanionView } from "@/app/components/portal/CompanionView";
import { AddCompanionModal, CompanionsForm } from "@/app/components/portal/CompanionsForm";
import { EventForm } from "@/app/components/portal/EventForm";
import { InfoTip } from "@/app/components/portal/InfoTip";
import { EventView } from "@/app/components/portal/EventView";
import { PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { StudioNav } from "@/app/components/portal/PortalTabs";
import { CompanionSwitch, EventSections, SubTabs } from "@/app/components/portal/SubTabs";
import { PlanningView } from "@/app/components/portal/PlanningBlock";
import { LookNotesView, WorkView } from "@/app/components/portal/WorkBlock";
import { studioBusyDates } from "@/lib/portal/availability";
import { madridToday, parseMonth } from "@/lib/portal/calendar";
import { INSPIRATION_MAX } from "@/lib/portal/files";
import { companionHeading, fullName, mailName } from "@/lib/portal/names";
import { getLocale, getPortalCopy, interpolate, localePath } from "@/lib/i18n";
import { requireClient } from "@/lib/portal/session";
import { getClient, listNotices, markClientCommsRead } from "@/lib/portal/store";
import {
  CONTRACTOR_TRIAL_PHOTOS,
  contractorInspirationKey,
  filesFor,
  portalTab,
  productsFor,
} from "@/lib/portal/types";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getPortalCopy(await getLocale());
  return { title: copy.metaTitle, robots: { index: false, follow: false } };
}

function fileHref(clientId: string, id: string, download = false) {
  const extra = download ? "&download=1" : "";
  return `/api/portal/file?client=${clientId}&id=${id}${extra}`;
}

export default async function BridePanelPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; tab?: string; mes?: string; com?: string; sec?: string; agenda?: string }>;
}) {
  const locale = await getLocale();
  const t = getPortalCopy(locale);
  const session = await requireClient();
  if (!session) redirect(localePath(locale, "/area-novia"));
  const client = await getClient(session.sub);
  if (!client) redirect(localePath(locale, "/area-novia"));
  const { ok, error, tab: tabRaw, mes, com, sec, agenda } = await searchParams;
  const tab = portalTab(tabRaw);
  const requests = (await listNotices()).filter((notice) => notice.clientId === client.id && notice.kind === "cambio");
  const unreadComms =
    client.history.filter((entry) => entry.kind === "contacto" && entry.seenByClient === false).length +
    requests.filter((notice) => notice.fromStudio && !notice.read).length;
  if (tab === "historico" && unreadComms > 0) await markClientCommsRead(client.id);
  const today = madridToday();
  const { year: initialYear, month: initialMonth } = parseMonth(mes, today);
  const busyDates = tab === "agenda" ? await studioBusyDates() : [];
  const okText: Record<string, string> = {
    evento: t.savedEvent,
    fotos: t.savedPhotos,
    cambio: t.changeSent,
    doc: t.sendDocumentHint,
    agenda: t.agendaUpdated,
    respuesta: t.replySent,
  };
  const errorText: Record<string, string> = {
    limite: interpolate(t.errorLimit, { max: INSPIRATION_MAX }),
    archivo: t.errorFile,
    cambio: t.changeError,
    respuesta: t.replyError,
  };

  return (
    <PortalFrame
      pinned
      localize
      kicker={t.kicker}
      title={interpolate(t.hello, { name: mailName(client.event, client.name) })}
      lead={t.panelLead}
      aside={
        <form action="/api/portal/logout" method="post">
          <button className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" type="submit">
            {t.logout}
          </button>
        </form>
      }
    >
      <div className="relative z-30 min-w-0 shrink-0">
        <StudioNav
          basePath={localePath(locale, "/area-novia/panel")}
          active={tab}
          labels={t.tabs}
          badges={{ historico: tab === "historico" ? 0 : unreadComms }}
          menuLabel={t.menu}
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {ok && okText[ok] ? <div className="shrink-0 pt-6"><PortalNotice>{okText[ok]}</PortalNotice></div> : null}
      {error && errorText[error] ? <div className="shrink-0 pt-6"><PortalNotice>{errorText[error]}</PortalNotice></div> : null}

      {tab === "contratante" ? (
        <section className="flex min-h-0 flex-1 flex-col pt-4">
          <EventSections
            section={sec}
            labels={{
              data: t.eventData,
              inspirations: t.inspirationsTab,
              makeup: t.makeupTab,
              hair: t.hairTab,
              trial: t.trialHeading,
              photos: t.photosTab,
              products: t.productsTab,
              comments: t.commentsTab,
              planning: t.planningTab,
            }}
            details={
              <div>
                <p className="max-w-2xl text-sm text-ash">
                  {client.event.contractorLocked ? t.lockedLead : t.yourDetailsLead}
                </p>
                <div className="mt-8">
                  {client.event.contractorLocked ? (
                    <EventView event={client.event} copy={t} />
                  ) : (
                    <EventForm
                      event={client.event}
                      clientId={client.id}
                      inspiration={client.inspiration}
                      action="/api/portal/event"
                      submitLabel={t.saveCard}
                      showInspiration={false}
                    />
                  )}
                </div>
              </div>
            }
            makeupInspiration={
              <PhotoPicker
                personKey={contractorInspirationKey("maquillaje")}
                files={client.inspiration}
                clientId={client.id}
                action="/api/portal/inspiration"
                tab="contratante"
                section="maquillaje"
                localize
              />
            }
            hairInspiration={
              <PhotoPicker
                personKey={contractorInspirationKey("peinado")}
                files={client.inspiration}
                clientId={client.id}
                action="/api/portal/inspiration"
                tab="contratante"
                section="peinado"
                localize
              />
            }
            photos={
              <div>
                <p className="max-w-2xl text-sm text-ash">{t.trialLead}</p>
                <div className="mt-6">
                  <WorkView
                    part="photos"
                    products={client.event.productsUsed}
                    photos={filesFor(client.workPhotos, CONTRACTOR_TRIAL_PHOTOS)}
                    clientId={client.id}
                    copy={t}
                  />
                </div>
              </div>
            }
            makeupProducts={
              <WorkView
                part="products"
                products={client.event.productsUsed}
                productLines={productsFor(client.event.products, "maquillaje")}
                photos={[]}
                clientId={client.id}
                copy={t}
              />
            }
            hairProducts={
              <WorkView
                part="products"
                products={client.event.productsUsed}
                productLines={productsFor(client.event.products, "peinado")}
                photos={[]}
                clientId={client.id}
                copy={t}
              />
            }
            trialComments={
              !client.event.makeupNotes.trim() && !client.event.hairNotes.trim() && client.event.trialNotes.trim() ? (
                <p className="whitespace-pre-wrap text-sm">{client.event.trialNotes}</p>
              ) : (
                <LookNotesView
                  makeupNotes={client.event.makeupNotes}
                  hairNotes={client.event.hairNotes}
                  makeupLabel={t.makeupTab}
                  hairLabel={t.hairTab}
                  empty="—"
                />
              )
            }
            planning={
              <PlanningView
                planning={client.event.planning}
                eventName={client.name}
                event={client.event}
                people={client.event.people}
                copy={t}
                locale={locale}
                client={client}
              />
            }
          />
        </section>
      ) : null}

      {tab === "acompanantes" ? (
        <section className="flex min-h-0 flex-1 flex-col pt-4">
          <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-3xl">{t.companionsTitle}</h2>
            {client.event.peopleLocked ? (
              <AddCompanionModal clientId={client.id} action="/api/portal/companions" copy={t} />
            ) : null}
          </div>
          <p className="mt-3 max-w-2xl shrink-0 text-sm text-ash">
            {client.event.peopleLocked ? t.lockedLead : t.companionsLead}
          </p>
          <div
            className={
              client.event.peopleLocked
                ? "mt-4 flex min-h-0 flex-1 flex-col"
                : "mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16"
            }
            {...(client.event.peopleLocked ? {} : { "data-portal-scroll": "" })}
          >
            {client.event.peopleLocked ? (
              client.event.people.length ? (
                <CompanionSwitch
                  label={t.companionOne}
                  initial={sec?.match(/^(\d+)/)?.[1]}
                  tabs={client.event.people.map((person, i) => ({
                    id: String(i),
                    label: companionHeading(person, t.whoOptions, interpolate(t.personN, { n: i + 1 })),
                    body: (
                      <CompanionView
                        variant="responsive"
                        index={i}
                        person={person}
                        clientId={client.id}
                        inspiration={client.inspiration.filter((file) => {
                          const label = file.label;
                          return (
                            label === `persona-${i}` ||
                            label === `persona-${i}-maquillaje` ||
                            label === `persona-${i}-peinado`
                          );
                        })}
                        workPhotos={client.workPhotos.filter((file) => file.label === `prueba-persona-${i}`)}
                        copy={t}
                        section={sec?.startsWith(`${i}-`) ? sec.slice(`${i}-`.length) : undefined}
                      />
                    ),
                  }))}
                />
              ) : (
                <p className="pt-6 text-sm text-ash">{t.noCompanions}</p>
              )
            ) : (
              <CompanionsForm
                event={client.event}
                clientId={client.id}
                inspiration={client.inspiration}
                workPhotos={client.workPhotos}
                action="/api/portal/companions"
                showInspiration={false}
                showTrialWork={false}
              />
            )}
          </div>
        </section>
      ) : null}

      {tab === "historico" ? (
        <section className="flex min-h-0 flex-1 flex-col pt-4">
          <h2 className="shrink-0 font-serif text-3xl">{t.historyTitle}</h2>
          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <SubTabs
              fill
              initial={com === "nueva" || ok === "cambio" || error === "cambio" ? "nueva" : "historico"}
              tabs={[
                {
                  id: "historico",
                  label: t.commsHistory,
                  body: (
                    <HistoryView
                      entries={client.history}
                      requests={requests}
                      clientName={fullName(client.event, client.name)}
                      copy={t}
                      locale={locale}
                      canReply
                    />
                  ),
                },
                {
                  id: "nueva",
                  label: t.commsWrite,
                  body:
                    client.event.contractorLocked || client.event.peopleLocked ? (
                      <ClientCompose
                        copy={t}
                        people={[
                          ...(client.event.contractorLocked
                            ? [{ name: fullName(client.event, client.name), scope: "contratante" as const }]
                            : []),
                          ...(client.event.peopleLocked
                            ? client.event.people.map((person, index) => ({
                                name: companionHeading(person, t.whoOptions, interpolate(t.personN, { n: index + 1 })),
                                scope: "acompanante" as const,
                                personIndex: index,
                              }))
                            : []),
                        ]}
                      />
                    ) : (
                      <p className="text-sm text-ash">{t.commsWait}</p>
                    ),
                },
              ]}
            />
          </div>
        </section>
      ) : null}

      {tab === "budget" ? (
        <section className="flex min-h-0 flex-1 flex-col pt-4">
          <h2 className="shrink-0 font-serif text-3xl">{t.budgetTitle}</h2>
          <p className="mt-3 max-w-2xl shrink-0 text-sm text-ash">{t.budgetLead}</p>
          <div data-portal-scroll className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
            <BudgetView
              entries={client.history}
              payments={client.payments}
              people={client.event.people}
              copy={t}
              locale={locale}
              contractorLabel={fullName(client.event, client.name)}
            />
          </div>
        </section>
      ) : null}

      {tab === "documentacion" ? (
        <section className="flex min-h-0 flex-1 flex-col pt-4">
          <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-3xl">{t.docsTitle}</h2>
            <SendDocumentModal label={t.sendDocument} hint={t.sendDocumentHint} closeLabel={t.agendaClose} fileLabel={t.sendDocumentFile} />
          </div>
          <p className="mt-3 max-w-2xl shrink-0 text-sm text-ash">{t.docsLead}</p>
          <div data-portal-scroll className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
          {client.documents.length ? (
            <ul className="mt-8 divide-y divide-ink/10 border border-ink/10">
              {client.documents.map((file) => (
                <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
                      {t.documentKinds[file.label] || file.label}
                    </p>
                    <p className="mt-1">{file.name}</p>
                  </div>
                  <a className="btn-atelier" href={fileHref(client.id, file.id, true)}>
                    {t.download}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-ash">{t.docsEmpty}</p>
          )}
          </div>
        </section>
      ) : null}

      {tab === "agenda" ? (
        <section className="flex min-h-0 flex-1 flex-col pt-4">
          <div className="flex shrink-0 items-center gap-3">
            <h2 className="font-serif text-3xl">{t.agendaBook}</h2>
            <InfoTip text={t.agendaBookLead} label={t.moreInfo} />
          </div>
          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <SubTabs
              fill
              initial={agenda === "historico" ? "historico" : "calendario"}
              tabs={[
                {
                  id: "calendario",
                  label: t.agendaCalendar,
                  body: (
                    <ClientCalendar
                      busyDates={busyDates}
                      today={today}
                      initialYear={initialYear}
                      initialMonth={initialMonth}
                      freeLabel={t.agendaFree}
                      closeLabel={t.agendaClose}
                      previousLabel={t.agendaPrev}
                      nextLabel={t.agendaNext}
                    />
                  ),
                },
                {
                  id: "historico",
                  label: t.agendaHistory,
                  body: (
                    <AgendaView appointments={client.appointments} copy={t} locale={locale} editable />
                  ),
                },
              ]}
            />
          </div>
        </section>
      ) : null}
      </div>
    </PortalFrame>
  );
}

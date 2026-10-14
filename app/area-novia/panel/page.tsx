import { AgendaView } from "@/app/components/portal/AgendaBlock";
import { ClientCalendar } from "@/app/components/portal/ClientCalendar";
import { BudgetView, HistoryView } from "@/app/components/portal/HistoryBlock";
import { ChangeRequestForm } from "@/app/components/portal/ChangeRequestForm";
import { CompanionView } from "@/app/components/portal/CompanionView";
import { AddCompanionModal, CompanionsForm } from "@/app/components/portal/CompanionsForm";
import { EventForm } from "@/app/components/portal/EventForm";
import { EventView } from "@/app/components/portal/EventView";
import { PaymentsView } from "@/app/components/portal/PaymentsBlock";
import { PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { PortalTabs } from "@/app/components/portal/PortalTabs";
import { EventSections, SubTabs } from "@/app/components/portal/SubTabs";
import { LookNotesView, WorkView } from "@/app/components/portal/WorkBlock";
import { studioBusyDates } from "@/lib/portal/availability";
import { madridToday, parseMonth } from "@/lib/portal/calendar";
import { INSPIRATION_MAX } from "@/lib/portal/files";
import { companionHeading, fullName, mailName } from "@/lib/portal/names";
import { getLocale, getPortalCopy, interpolate, localePath } from "@/lib/i18n";
import { requireClient } from "@/lib/portal/session";
import { getClient, listNotices } from "@/lib/portal/store";
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
  searchParams: Promise<{ ok?: string; error?: string; tab?: string; mes?: string; com?: string; sec?: string }>;
}) {
  const locale = await getLocale();
  const t = getPortalCopy(locale);
  const session = await requireClient();
  if (!session) redirect(localePath(locale, "/area-novia"));
  const client = await getClient(session.sub);
  if (!client) redirect(localePath(locale, "/area-novia"));
  const requests = (await listNotices()).filter((notice) => notice.clientId === client.id && notice.kind === "cambio");
  const { ok, error, tab: tabRaw, mes, com, sec } = await searchParams;
  const tab = portalTab(tabRaw);
  const lockedPanels =
    tab === "contratante" || tab === "historico" || (tab === "acompanantes" && client.event.peopleLocked);
  const today = madridToday();
  const { year: initialYear, month: initialMonth } = parseMonth(mes, today);
  const busyDates = tab === "agenda" ? await studioBusyDates() : [];
  const okText: Record<string, string> = {
    evento: t.savedEvent,
    fotos: t.savedPhotos,
    cambio: t.changeSent,
  };
  const errorText: Record<string, string> = {
    limite: interpolate(t.errorLimit, { max: INSPIRATION_MAX }),
    archivo: t.errorFile,
    cambio: t.changeError,
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
      <div className="shrink-0">
        <PortalTabs
          basePath={localePath(locale, "/area-novia/panel")}
          active={tab}
          labels={t.tabs}
        />
      </div>
      <div
        className={
          lockedPanels
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16"
        }
        {...(lockedPanels ? {} : { "data-portal-scroll": "" })}
      >
      {ok && okText[ok] ? <div className="pt-6"><PortalNotice>{okText[ok]}</PortalNotice></div> : null}
      {error && errorText[error] ? <div className="pt-6"><PortalNotice>{errorText[error]}</PortalNotice></div> : null}

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
              notes: t.notesTab,
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
            notes={
              <LookNotesView
                makeupNotes={client.event.makeupNotes}
                hairNotes={client.event.hairNotes}
                makeupLabel={t.makeupTab}
                hairLabel={t.hairTab}
                empty="—"
              />
            }
          />
        </section>
      ) : null}

      {tab === "acompanantes" ? (
        <section className={client.event.peopleLocked ? "flex min-h-0 flex-1 flex-col pt-4" : "pt-10"}>
          <div className="flex shrink-0 items-center justify-between gap-4">
            <h2 className="font-serif text-3xl">{t.companionsTitle}</h2>
            {client.event.peopleLocked ? (
              <AddCompanionModal clientId={client.id} action="/api/portal/companions" copy={t} />
            ) : null}
          </div>
          <p className="mt-3 max-w-2xl shrink-0 text-sm text-ash">
            {client.event.peopleLocked ? t.lockedLead : t.companionsLead}
          </p>
          <div className={client.event.peopleLocked ? "mt-4 min-h-0 flex-1" : "mt-8"}>
            {client.event.peopleLocked ? (
              client.event.people.length ? (
                <SubTabs
                  fill
                  initial={sec?.match(/^(\d+)/)?.[1]}
                  tabs={client.event.people.map((person, i) => ({
                    id: String(i),
                    label: companionHeading(person, t.whoOptions, interpolate(t.personN, { n: i + 1 })),
                    nested: true,
                    body: (
                      <CompanionView
                        index={i}
                        person={person}
                        clientId={client.id}
                        inspiration={client.inspiration}
                        workPhotos={client.workPhotos}
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
          <div className="mt-4 min-h-0 flex-1">
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
                    />
                  ),
                },
                {
                  id: "nueva",
                  label: t.commsWrite,
                  body: (
                    <div className="flex max-w-xl flex-col gap-10">
                      {client.event.contractorLocked ? (
                        <div>
                          <h3 className="font-serif text-2xl">{t.contractor}</h3>
                          <ChangeRequestForm copy={t} scope="contratante" />
                        </div>
                      ) : null}
                      {client.event.peopleLocked && client.event.people.length
                        ? client.event.people.map((person, index) => (
                            <div key={index}>
                              <h3 className="font-serif text-2xl">
                                {companionHeading(person, t.whoOptions, interpolate(t.personN, { n: index + 1 }))}
                              </h3>
                              <ChangeRequestForm copy={t} scope="acompanante" personIndex={index} />
                            </div>
                          ))
                        : null}
                      {client.event.peopleLocked && !client.event.people.length ? (
                        <div>
                          <h3 className="font-serif text-2xl">{t.companionsTitle}</h3>
                          <ChangeRequestForm copy={t} scope="acompanante" />
                        </div>
                      ) : null}
                      {!client.event.contractorLocked && !client.event.peopleLocked ? (
                        <p className="text-sm text-ash">{t.commsWait}</p>
                      ) : null}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </section>
      ) : null}

      {tab === "budget" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">{t.budgetTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">{t.budgetLead}</p>
          <div className="mt-8">
            <BudgetView
              entries={client.history}
              event={client.event}
              payments={client.payments}
              copy={t}
              billing={<PaymentsView payments={client.payments} people={client.event.people} />}
            />
          </div>
        </section>
      ) : null}

      {tab === "documentacion" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">{t.docsTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">{t.docsLead}</p>
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
        </section>
      ) : null}

      {tab === "agenda" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">{t.agendaTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">{t.agendaLead}</p>
          <div className="mt-10">
            <h3 className="font-serif text-3xl">{t.agendaBook}</h3>
            <p className="mt-3 max-w-2xl text-sm text-ash">{t.agendaBookLead}</p>
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
          </div>
          <div className="mt-12">
            <AgendaView appointments={client.appointments} copy={t} locale={locale} />
          </div>
        </section>
      ) : null}
      </div>
    </PortalFrame>
  );
}

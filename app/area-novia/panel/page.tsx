import { AgendaView } from "@/app/components/portal/AgendaBlock";
import { HistoryView } from "@/app/components/portal/HistoryBlock";
import { ChangeRequestForm } from "@/app/components/portal/ChangeRequestForm";
import { CompanionView } from "@/app/components/portal/CompanionView";
import { CompanionsForm } from "@/app/components/portal/CompanionsForm";
import { EventForm } from "@/app/components/portal/EventForm";
import { EventView } from "@/app/components/portal/EventView";
import { PaymentsView } from "@/app/components/portal/PaymentsBlock";
import { PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { PortalTabs } from "@/app/components/portal/PortalTabs";
import { WorkView } from "@/app/components/portal/WorkBlock";
import { INSPIRATION_MAX } from "@/lib/portal/files";
import { mailName } from "@/lib/portal/names";
import { getLocale, getPortalCopy, interpolate, localePath } from "@/lib/i18n";
import { requireClient } from "@/lib/portal/session";
import { getClient, listNotices } from "@/lib/portal/store";
import {
  CONTRACTOR_INSPIRATION,
  CONTRACTOR_TRIAL_PHOTOS,
  filesFor,
  portalTab,
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
  searchParams: Promise<{ ok?: string; error?: string; tab?: string }>;
}) {
  const locale = await getLocale();
  const t = getPortalCopy(locale);
  const session = await requireClient();
  if (!session) redirect(localePath(locale, "/area-novia"));
  const client = await getClient(session.sub);
  if (!client) redirect(localePath(locale, "/area-novia"));
  const requests = (await listNotices()).filter((notice) => notice.clientId === client.id && notice.kind === "cambio");
  const { ok, error, tab: tabRaw } = await searchParams;
  const tab = portalTab(tabRaw);
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
      {ok && okText[ok] ? <PortalNotice>{okText[ok]}</PortalNotice> : null}
      {error && errorText[error] ? <PortalNotice>{errorText[error]}</PortalNotice> : null}
      <PortalTabs
        basePath={localePath(locale, "/area-novia/panel")}
        active={tab}
        labels={t.tabs}
      />

      {tab === "contratante" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">{t.yourDetails}</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">
            {client.event.contractorLocked ? t.lockedLead : t.yourDetailsLead}
          </p>
          <div className="mt-8">
            {client.event.contractorLocked ? (
              <>
                <EventView event={client.event} copy={t} />
                <div className="mt-8">
                  <PhotoPicker
                    personKey={CONTRACTOR_INSPIRATION}
                    files={client.inspiration}
                    clientId={client.id}
                    action="/api/portal/inspiration"
                    tab="contratante"
                    localize
                  />
                </div>
                <ChangeRequestForm copy={t} scope="contratante" />
              </>
            ) : (
              <EventForm
                event={client.event}
                clientId={client.id}
                inspiration={client.inspiration}
                action="/api/portal/event"
                submitLabel={t.saveCard}
              />
            )}
          </div>
          <div className="mt-14 border-t border-ink/10 pt-10">
            <h3 className="font-serif text-3xl">{t.trialHeading}</h3>
            <p className="mt-3 max-w-2xl text-sm text-ash">{t.trialLead}</p>
            <div className="mt-8">
              <WorkView
                products={client.event.productsUsed}
                photos={filesFor(client.workPhotos, CONTRACTOR_TRIAL_PHOTOS)}
                clientId={client.id}
                copy={t}
              />
            </div>
          </div>
        </section>
      ) : null}

      {tab === "acompanantes" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">{t.companionsTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">
            {client.event.peopleLocked ? t.lockedLead : t.companionsLead}
          </p>
          <div className="mt-8">
            {client.event.peopleLocked ? (
              client.event.people.length ? (
                <div className="flex flex-col gap-8">
                  {client.event.people.map((person, i) => (
                    <CompanionView
                      key={i}
                      index={i}
                      person={person}
                      clientId={client.id}
                      inspiration={client.inspiration}
                      workPhotos={client.workPhotos}
                      copy={t}
                    />
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-sm text-ash">{t.noCompanions}</p>
                  <ChangeRequestForm copy={t} scope="acompanante" />
                </>
              )
            ) : (
              <CompanionsForm
                event={client.event}
                clientId={client.id}
                inspiration={client.inspiration}
                workPhotos={client.workPhotos}
                action="/api/portal/companions"
              />
            )}
          </div>
        </section>
      ) : null}

      {tab === "historico" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">{t.historyTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">{t.historyLead}</p>
          <div className="mt-8">
            <HistoryView
              entries={client.history}
              event={client.event}
              payments={client.payments}
              requests={requests}
              copy={t}
              locale={locale}
            />
          </div>
        </section>
      ) : null}

      {tab === "facturacion" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">{t.billingTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">{t.billingLead}</p>
          <div className="mt-8">
            <PaymentsView payments={client.payments} people={client.event.people} />
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
          <div className="mt-8">
            <AgendaView appointments={client.appointments} copy={t} locale={locale} />
          </div>
        </section>
      ) : null}
    </PortalFrame>
  );
}

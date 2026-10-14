"use client";

import { useState, type ReactNode } from "react";
import { SubTabs } from "@/app/components/portal/SubTabs";
import { dateLocale, portalEs, type PortalCopy } from "@/lib/i18n/portal-messages";
import type { Locale } from "@/lib/i18n/config";
import { clientBudget } from "@/lib/portal/budget";
import {
  canonicalService,
  CONTACT_TITLES,
  euros,
  historyBudget,
  SERVICE_TITLES,
  serviceNeedsName,
  type EventDetails,
  type HistoryEntry,
  type HistoryKind,
  type Payments,
  type StudioNotice,
} from "@/lib/portal/types";

function formatWhen(date: string, locale: Locale, copy: PortalCopy) {
  if (!date) return copy.noDate;
  return new Date(`${date}T00:00:00`).toLocaleDateString(dateLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const CATALOG = new Set<string>([...CONTACT_TITLES, ...SERVICE_TITLES]);

function labelFor(title: string, copy: PortalCopy) {
  const canonical = (CONTACT_TITLES as readonly string[]).includes(title) ? title : canonicalService(title);
  return copy.historyTitles[canonical] || canonical;
}

type WhoFilter = "" | "ella" | "acompanante";

function whoMatches(who: WhoFilter, role: "contratante" | "acompanante") {
  if (!who) return true;
  return who === "ella" ? role === "contratante" : role === "acompanante";
}

const EVENT_SERVICES = new Set([
  "Maquillaje y Peinado",
  "Sólo Maquillaje",
  "Sólo peinado",
  "Prueba",
  "Glitter Bar",
  "Beauty Corner",
]);

function isCareService(title: string) {
  return !EVENT_SERVICES.has(canonicalService(title));
}

function sumServices(entries: HistoryEntry[]) {
  const total = entries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const pending = entries.reduce((sum, entry) => sum + (entry.paid ? 0 : Number(entry.amount) || 0), 0);
  return { total, pending, paid: Math.max(0, total - pending) };
}

function MoneyBoxes({
  total,
  paid,
  pending,
  copy,
}: {
  total: number;
  paid: number;
  pending: number;
  copy: PortalCopy;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <article className="border border-ink/10 bg-linen/40 p-5">
        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">{copy.budgetTotal}</p>
        <p className="mt-3 font-serif text-3xl">{euros(total)}</p>
      </article>
      <article className="border border-ink/10 bg-linen/40 p-5">
        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">{copy.budgetPaid}</p>
        <p className="mt-3 font-serif text-3xl">{euros(paid)}</p>
      </article>
      <article className="border border-ink/10 bg-linen/40 p-5">
        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">{copy.budgetPending}</p>
        <p className="mt-3 font-serif text-3xl">{euros(pending)}</p>
      </article>
    </div>
  );
}

function ServiceLines({ entries, copy }: { entries: HistoryEntry[]; copy: PortalCopy }) {
  if (!entries.length) return null;
  return (
    <ul className="mt-8 divide-y divide-ink/10 border border-ink/10">
      {entries.map((entry) => {
        const known = CATALOG.has(canonicalService(entry.title));
        const category = known ? labelFor(entry.title, copy) : "";
        const specific = entry.name.trim() || (known ? "" : entry.title);
        return (
          <li key={entry.id} className="px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
              {copy.historyKinds.servicio}
              {category ? ` · ${category}` : ""}
            </p>
            {specific ? <p className="mt-1 font-serif text-2xl">{specific}</p> : null}
            <p className="mt-2 text-sm">
              {euros(entry.amount)}
              {` · ${entry.paid ? copy.paid : copy.unpaid}`}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function BudgetView({
  entries,
  event,
  payments,
  copy = portalEs,
  billing,
}: {
  entries: HistoryEntry[];
  event?: EventDetails;
  payments?: Payments;
  copy?: PortalCopy;
  billing?: ReactNode;
}) {
  const booked = event && payments ? clientBudget({ history: entries, event, payments }) : null;
  const history = booked?.history ?? historyBudget(entries);
  const budget = booked ?? { ...history, groups: [], total: history.total, pending: history.pending, paid: history.paid };
  const eventServices = history.services.filter((entry) => !isCareService(entry.title));
  const careServices = history.services.filter((entry) => isCareService(entry.title));
  const care = sumServices(careServices);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0">
        <MoneyBoxes total={budget.total} paid={budget.paid} pending={budget.pending} copy={copy} />
      </div>
      <div className="mt-6 min-h-0 flex-1">
        <SubTabs
          fill
          tabs={[
            {
              id: "evento",
              label: copy.budgetEvent,
              body: (
                <>
                  {billing}
                  <ServiceLines entries={eventServices} copy={copy} />
                </>
              ),
            },
            {
              id: "otros",
              label: copy.budgetCare,
              body: (
                <>
                  <MoneyBoxes total={care.total} paid={care.paid} pending={care.pending} copy={copy} />
                  {careServices.length ? (
                    <ServiceLines entries={careServices} copy={copy} />
                  ) : (
                    <p className="text-sm text-ash">{copy.budgetCareEmpty}</p>
                  )}
                </>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

function ClientReply({ id, copy }: { id: string; copy: PortalCopy }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        type="button"
        className="mt-5 text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink"
        onClick={() => setOpen(true)}
      >
        {copy.replyButton}
      </button>
    );
  }
  return (
    <form action="/api/portal/replies" method="post" className="mt-5 flex max-w-xl flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <label className="field-label">
        {copy.replyButton}
        <textarea className="field min-h-24" name="reply" required minLength={2} placeholder={copy.replyPlaceholder} />
      </label>
      <button className="btn-atelier self-start" type="submit">
        {copy.replyButton}
      </button>
    </form>
  );
}

export function HistoryView({
  entries,
  requests = [],
  clientName = "",
  copy = portalEs,
  locale = "es",
  canReply = false,
}: {
  entries: HistoryEntry[];
  requests?: StudioNotice[];
  clientName?: string;
  copy?: PortalCopy;
  locale?: Locale;
  canReply?: boolean;
}) {
  const [contactWho, setContactWho] = useState<WhoFilter>("");
  const ordered = [...entries].sort((a, b) => `${b.date}${b.title}`.localeCompare(`${a.date}${a.title}`));
  const asked = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const contacts = ordered.filter((entry) => {
    if (entry.kind !== "contacto") return false;
    if (contactWho === "acompanante") return false;
    return true;
  });
  const visibleRequests = asked.filter((notice) =>
    whoMatches(contactWho, notice.scope === "acompanante" ? "acompanante" : "contratante"),
  );
  const contactFiltering = Boolean(contactWho);
  const person = clientName.trim() || copy.threadClient;
  return (
    <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="field-label sm:w-44">
            {copy.filterWho}
            <select className="field" value={contactWho} onChange={(event) => setContactWho(event.target.value as WhoFilter)}>
              <option value="">{copy.filterAll}</option>
              <option value="ella">{copy.filterHer}</option>
              <option value="acompanante">{copy.filterGuest}</option>
            </select>
          </label>
        </div>
        {contacts.length || visibleRequests.length ? (
          <ul className="mt-8 divide-y divide-ink/10 border border-ink/10">
            {visibleRequests.map((notice) => {
              const [heading, ...rest] = notice.message.split(/\n\n/);
              const body = rest.join("\n\n").trim();
              const replies = notice.replies.length ? (
                <ul className="mt-5 space-y-5 border-l border-gilt/50 pl-4 sm:ml-6">
                  {notice.replies.map((reply) => (
                    <li key={reply.id}>
                      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{copy.threadReply}</p>
                      <div className="mt-2 flex items-baseline justify-between gap-4">
                        <p className="text-sm">
                          {reply.fromClient ? person : copy.threadAuthor}
                          <span className="text-ash"> → {reply.fromClient ? copy.threadAuthor : person}</span>
                        </p>
                        <p className="text-sm capitalize text-ash">{formatWhen(reply.createdAt.slice(0, 10), locale, copy)}</p>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{reply.text}</p>
                    </li>
                  ))}
                </ul>
              ) : null;
              if (notice.fromStudio) {
                return (
                  <li key={notice.id} className="px-4 py-5">
                    <article>
                      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{copy.mailLabel}</p>
                      <div className="mt-3 flex items-baseline justify-between gap-4">
                        <p className="text-sm">
                          {copy.threadAuthor}
                          <span className="text-ash"> → {person}</span>
                        </p>
                        <p className="text-sm capitalize text-ash">{formatWhen(notice.createdAt.slice(0, 10), locale, copy)}</p>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{notice.message}</p>
                      {replies}
                      {canReply ? <ClientReply id={notice.id} copy={copy} /> : null}
                    </article>
                  </li>
                );
              }
              return (
                <li key={notice.id} className="px-4 py-5">
                  <article>
                    <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
                      {copy.mailLabel} · {copy.requestLabel}
                    </p>
                    <div className="mt-3 flex items-baseline justify-between gap-4">
                      <p className="text-sm">
                        {person}
                        <span className="text-ash"> → {copy.threadAuthor}</span>
                      </p>
                      <p className="text-sm capitalize text-ash">{formatWhen(notice.createdAt.slice(0, 10), locale, copy)}</p>
                    </div>
                    <p className="mt-2 font-serif text-2xl">{heading || copy.requestLabel}</p>
                    {body ? <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{body}</p> : null}
                    {replies}
                    {canReply ? <ClientReply id={notice.id} copy={copy} /> : null}
                  </article>
                </li>
              );
            })}
            {contacts.map((entry) => {
              const known = CATALOG.has(canonicalService(entry.title));
              const category = known ? labelFor(entry.title, copy) : "";
              const specific = entry.name.trim() || (known ? "" : entry.title);
              return (
                <li key={entry.id} className="px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
                    {copy.historyKinds.contacto}
                    {category ? ` · ${category}` : ""}
                  </p>
                  {specific ? <p className="mt-1 font-serif text-2xl">{specific}</p> : null}
                  <p className={`${specific ? "mt-1 text-sm text-ash" : "mt-1 font-serif text-2xl"} capitalize`}>
                    {formatWhen(entry.date, locale, copy)}
                  </p>
                  {entry.notes ? <p className="mt-2 whitespace-pre-wrap text-sm text-ash">{entry.notes}</p> : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-ash">{contactFiltering ? copy.filterEmpty : copy.historyEmpty}</p>
        )}
    </div>
  );
}

function nameLabel(title: string) {
  const name = canonicalService(title);
  if (name === "Tratamiento facial" || name === "Servicios de ojos") return "Nombre del tratamiento";
  if (name === "Bonos de tratamientos faciales" || name === "Bonos servicios de ojos") return "Nombre del bono";
  if (name === "Formaciones") return "Nombre de la formación";
  if (name === "Compra de productos") return "Qué ha comprado";
  return "Nombre";
}

export function HistoryForm({
  clientId,
  entries,
  requests = [],
  clientName = "",
}: {
  clientId: string;
  entries: HistoryEntry[];
  requests?: StudioNotice[];
  clientName?: string;
}) {
  return (
    <div className="flex flex-col gap-10">
      <HistoryView entries={entries} requests={requests} clientName={clientName} />
      {entries.length ? (
        <ul className="divide-y divide-ink/10 border border-ink/10">
          {[...entries]
            .sort((a, b) => `${b.date}${b.title}`.localeCompare(`${a.date}${a.title}`))
            .map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <p className="text-sm">
                  {entry.kind === "servicio" ? "Servicio" : "Contacto"} · {entry.name || entry.title} · {entry.date || "sin fecha"}
                  {entry.kind === "servicio" ? ` · ${euros(entry.amount)} · ${entry.paid ? "abonado" : "lo paga después"}` : ""}
                </p>
                <form action="/api/admin/history" method="post">
                  <input type="hidden" name="clientId" value={clientId} />
                  <input type="hidden" name="deleteId" value={entry.id} />
                  <button className="text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink" type="submit">
                    Quitar
                  </button>
                </form>
              </li>
            ))}
        </ul>
      ) : null}
      <HistoryComposer clientId={clientId} />
    </div>
  );
}

export function HistoryComposer({ clientId }: { clientId: string }) {
  const [kind, setKind] = useState<HistoryKind>("servicio");
  const [title, setTitle] = useState<string>(SERVICE_TITLES[0]);
  const titles = kind === "servicio" ? SERVICE_TITLES : CONTACT_TITLES;

  function chooseKind(next: HistoryKind) {
    setKind(next);
    setTitle(next === "servicio" ? SERVICE_TITLES[0] : CONTACT_TITLES[0]);
  }

  return (
      <form action="/api/admin/history" method="post" className="grid max-w-xl gap-4">
        <input type="hidden" name="clientId" value={clientId} />
        <label className="field-label">
          Tipo
          <select className="field" name="kind" value={kind} onChange={(event) => chooseKind(event.target.value as HistoryKind)}>
            <option value="contacto">Contacto</option>
            <option value="servicio">Servicio</option>
          </select>
        </label>
        <label className="field-label">
          Qué
          <select className="field" name="title" value={title} onChange={(event) => setTitle(event.target.value)}>
            {titles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        {serviceNeedsName(title) ? (
          <label className="field-label">
            {nameLabel(title)}
            <input className="field" name="customTitle" required />
          </label>
        ) : null}
        <label className="field-label">
          Fecha
          <input className="field" name="date" type="date" required />
        </label>
        {kind === "servicio" ? (
          <>
            <label className="field-label">
              Importe
              <input className="field" name="amount" type="number" min="0" step="0.01" defaultValue="0" />
            </label>
            {serviceNeedsName(title) && title !== "Otro" ? (
              <label className="flex items-center gap-3 text-sm">
                <input name="payLater" type="checkbox" value="1" />
                Lo paga después
              </label>
            ) : null}
          </>
        ) : null}
        <label className="field-label">
          Nota
          <textarea className="field min-h-24" name="notes" placeholder="Qué se habló, o qué se hizo" />
        </label>
        <button className="btn-atelier-solid btn-atelier self-start" type="submit">
          Añadir al histórico
        </button>
      </form>
  );
}

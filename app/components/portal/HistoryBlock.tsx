"use client";

import { useState, type ReactNode } from "react";
import { PaymentsForm, PaymentsView } from "@/app/components/portal/PaymentsBlock";
import { SubTabs } from "@/app/components/portal/SubTabs";
import { dateLocale, interpolate, portalEs, type PortalCopy } from "@/lib/i18n/portal-messages";
import type { Locale } from "@/lib/i18n/config";
import { companionHeading } from "@/lib/portal/names";
import {
  canonicalService,
  CONTACT_TITLES,
  euros,
  historyBudget,
  SERVICE_TITLES,
  serviceNeedsName,
  type Attendee,
  type HistoryEntry,
  type HistoryKind,
  type PaymentSlice,
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

function calendarVisit(entry: HistoryEntry) {
  if (!entry.appointmentId) return "";
  if (entry.title === "Maquillaje" || entry.title === "Peinado") return entry.title;
  return "";
}

function isCareService(entry: HistoryEntry) {
  if (calendarVisit(entry)) return true;
  return !EVENT_SERVICES.has(canonicalService(entry.title));
}

function serviceFields(entry: HistoryEntry, copy: PortalCopy) {
  const visit = calendarVisit(entry);
  if (visit) {
    const label = copy.historyTitles[visit] || visit;
    const name = entry.name.trim();
    return { category: label, specific: name && name !== visit && name !== label ? name : label };
  }
  const known = CATALOG.has(canonicalService(entry.title));
  return {
    category: known ? labelFor(entry.title, copy) : "",
    specific: entry.name.trim() || (known ? "" : entry.title),
  };
}

type Pocket = "all" | "paid" | "pending";

function entryPerson(entry: HistoryEntry, guestCount: number) {
  if (entry.assignee && /^g:\d+$/.test(entry.assignee)) {
    const index = Number(entry.assignee.slice(2));
    if (index >= 0 && index < guestCount) return entry.assignee;
  }
  return "contractor";
}

function sliceAmount(slice: PaymentSlice) {
  return Math.max(0, Number(slice.amount) || 0);
}

type LedgerRow = {
  id: string;
  kind: "slice" | "service";
  kicker: string;
  title: string;
  date?: string;
  amount: number;
  paid: boolean;
};

function MoneyBoxes({
  total,
  paid,
  pending,
  copy,
  pocket,
  onPocket,
}: {
  total: number;
  paid: number;
  pending: number;
  copy: PortalCopy;
  pocket: Pocket;
  onPocket: (next: Pocket) => void;
}) {
  const boxes: { id: Pocket; label: string; amount: number }[] = [
    { id: "all", label: copy.budgetTotal, amount: total },
    { id: "paid", label: copy.budgetPaid, amount: paid },
    { id: "pending", label: copy.budgetPending, amount: pending },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {boxes.map((box) => {
        const on = pocket === box.id;
        return (
          <button
            key={box.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPocket(box.id)}
            className={
              on
                ? "border border-gilt bg-linen/70 px-2 py-3 text-left sm:p-5"
                : "border border-ink/10 bg-linen/40 px-2 py-3 text-left hover:border-gilt/50 sm:p-5"
            }
          >
            <p className="text-[0.58rem] uppercase tracking-[0.1em] text-gilt sm:text-[0.68rem] sm:tracking-[0.18em]">{box.label}</p>
            <p className="mt-2 font-serif text-lg leading-none sm:mt-3 sm:text-3xl">{euros(box.amount)}</p>
          </button>
        );
      })}
    </div>
  );
}

function ServiceLines({
  entries,
  copy,
  locale = "es",
  showDate = false,
  whoOf,
}: {
  entries: HistoryEntry[];
  copy: PortalCopy;
  locale?: Locale;
  showDate?: boolean;
  whoOf?: (entry: HistoryEntry) => string;
}) {
  if (!entries.length) return null;
  return (
    <ul className="mt-8 divide-y divide-ink/10 border border-ink/10">
      {entries.map((entry) => {
        const { category, specific } = serviceFields(entry, copy);
        const who = whoOf?.(entry);
        return (
          <li key={entry.id} className="px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
              {copy.historyKinds.servicio}
              {category ? ` · ${category}` : ""}
              {who ? ` · ${who}` : ""}
            </p>
            {specific ? <p className="mt-1 font-serif text-2xl">{specific}</p> : null}
            {showDate && entry.date ? (
              <p className="mt-1 text-sm capitalize text-ash">{formatWhen(entry.date, locale, copy)}</p>
            ) : null}
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

function LedgerList({
  rows,
  copy,
  locale,
}: {
  rows: LedgerRow[];
  copy: PortalCopy;
  locale: Locale;
}) {
  if (!rows.length) return <p className="mt-6 text-sm text-ash">{copy.budgetFilterEmpty}</p>;
  return (
    <ul className="mt-6 divide-y divide-ink/10 border border-ink/10">
      {rows.map((row) => (
        <li key={row.id} className="px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{row.kicker}</p>
          {row.title ? <p className="mt-1 font-serif text-2xl">{row.title}</p> : null}
          {row.date ? <p className="mt-1 text-sm capitalize text-ash">{formatWhen(row.date, locale, copy)}</p> : null}
          <p className="mt-2 text-sm">
            {euros(row.amount)}
            {` · ${row.paid ? copy.paid : copy.unpaid}`}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function BudgetView({
  entries,
  payments,
  people = [],
  copy = portalEs,
  clientId,
  expense,
  expenseLabel = "Nuevo gasto",
  composer,
  locale = "es",
  contractorLabel,
}: {
  entries: HistoryEntry[];
  payments?: Payments;
  people?: Attendee[];
  copy?: PortalCopy;
  clientId?: string;
  expense?: ReactNode;
  expenseLabel?: string;
  composer?: { clientId: string; returnTab?: string };
  locale?: Locale;
  contractorLabel?: string;
}) {
  const [person, setPerson] = useState("all");
  const [pocket, setPocket] = useState<Pocket>("all");
  const bride = contractorLabel || copy.budgetService;
  const names = new Map<string, string>([["contractor", bride]]);
  people.forEach((guest, index) => {
    names.set(
      `g:${index}`,
      companionHeading(guest, copy.whoOptions, interpolate(copy.guestN, { n: index + 1 })),
    );
  });
  const choices = [
    { id: "all", label: copy.budgetEveryone },
    { id: "contractor", label: bride },
    ...people.map((_, index) => ({ id: `g:${index}`, label: names.get(`g:${index}`) || interpolate(copy.guestN, { n: index + 1 }) })),
  ];
  const selected = choices.some((choice) => choice.id === person) ? person : "all";
  const history = historyBudget(entries);
  const scoped = history.services.filter(
    (entry) => selected === "all" || entryPerson(entry, people.length) === selected,
  );
  const whoOf =
    selected === "all"
      ? (entry: HistoryEntry) => names.get(entryPerson(entry, people.length)) || ""
      : undefined;
  const eventServices = scoped.filter((entry) => !isCareService(entry));
  const careServices = scoped.filter((entry) => isCareService(entry));

  const rows: LedgerRow[] = [];
  function pushSlice(id: string, label: string, who: string | undefined, slice: PaymentSlice) {
    const amount = sliceAmount(slice);
    if (!amount) return;
    rows.push({
      id,
      kind: "slice",
      kicker: who ? `${label} · ${who}` : label,
      title: "",
      amount,
      paid: Boolean(slice.paid),
    });
  }
  function pushPerson(id: string, pay: Payments["contractor"] | undefined, showName: boolean) {
    if (!pay) return;
    const who = showName ? names.get(id) : undefined;
    pushSlice(`${id}-deposit`, copy.deposit, who, pay.deposit);
    pushSlice(`${id}-trial`, copy.trialDay, who, pay.trial);
    pushSlice(`${id}-event`, copy.eventDay, who, pay.event);
  }
  if (payments) {
    if (selected === "all" || selected === "contractor") pushPerson("contractor", payments.contractor, selected === "all");
    people.forEach((_, index) => {
      const id = `g:${index}`;
      if (selected === "all" || selected === id) pushPerson(id, payments.guests[index], selected === "all");
    });
  }
  [...scoped]
    .sort((a, b) => `${b.date}${b.title}`.localeCompare(`${a.date}${a.title}`))
    .forEach((entry) => {
      const { category, specific } = serviceFields(entry, copy);
      const who = whoOf?.(entry);
      rows.push({
        id: entry.id,
        kind: "service",
        kicker: `${copy.historyKinds.servicio}${category ? ` · ${category}` : ""}${who ? ` · ${who}` : ""}`,
        title: specific,
        date: entry.date,
        amount: Math.max(0, Number(entry.amount) || 0),
        paid: entry.paid,
      });
    });
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const pending = rows.reduce((sum, row) => sum + (row.paid ? 0 : row.amount), 0);
  const paid = Math.max(0, total - pending);
  const listed = rows.filter((row) => row.amount > 0 && (pocket === "paid" ? row.paid : !row.paid));
  const sliceRows = rows.filter((row) => row.kind === "slice");

  return (
    <div>
      <MoneyBoxes total={total} paid={paid} pending={pending} copy={copy} pocket={pocket} onPocket={setPocket} />
      <label className="field-label mt-6 max-w-md">
        {copy.budgetPerson}
        <select className="field" value={selected} onChange={(event) => setPerson(event.target.value)}>
          {choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.label}
            </option>
          ))}
        </select>
      </label>
      {pocket === "all" ? (
        <div className="mt-6">
          <SubTabs
            tabs={[
              {
                id: "evento",
                label: copy.budgetEvent,
                body: (
                  <>
                    <ServiceLines entries={eventServices} copy={copy} whoOf={whoOf} />
                    {selected === "all" && sliceRows.length ? (
                      <div className={eventServices.length ? "mt-8" : undefined}>
                        <LedgerList rows={sliceRows} copy={copy} locale={locale} />
                      </div>
                    ) : null}
                    {selected !== "all" && payments ? (
                      <div className={eventServices.length ? "mt-10" : undefined}>
                        {clientId ? (
                          <PaymentsForm clientId={clientId} payments={payments} people={people} who={selected} />
                        ) : (
                          <PaymentsView payments={payments} people={people} who={selected} />
                        )}
                      </div>
                    ) : null}
                  </>
                ),
              },
              {
                id: "otros",
                label: copy.budgetCare,
                body: careServices.length ? (
                  <ServiceLines entries={careServices} copy={copy} locale={locale} showDate whoOf={whoOf} />
                ) : (
                  <p className="text-sm text-ash">{copy.budgetCareEmpty}</p>
                ),
              },
              ...(expense || composer
                ? [
                    {
                      id: "gasto",
                      label: expenseLabel,
                      body: composer ? (
                        <HistoryComposer clientId={composer.clientId} returnTab={composer.returnTab} assignee={selected} />
                      ) : (
                        expense
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ) : (
        <LedgerList rows={listed} copy={copy} locale={locale} />
      )}
    </div>
  );
}

function ThreadReply({
  id,
  copy,
  studioNext,
}: {
  id: string;
  copy: PortalCopy;
  studioNext?: string;
}) {
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
    <form
      action={studioNext ? "/api/admin/notices" : "/api/portal/replies"}
      method="post"
      className="mt-5 flex max-w-xl flex-col gap-3"
    >
      {studioNext ? (
        <>
          <input type="hidden" name="next" value={studioNext} />
          <input type="hidden" name="intent" value="reply" />
        </>
      ) : null}
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
  studioNext,
}: {
  entries: HistoryEntry[];
  requests?: StudioNotice[];
  clientName?: string;
  copy?: PortalCopy;
  locale?: Locale;
  canReply?: boolean;
  studioNext?: string;
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
                      <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
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
                      <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                        <p className="text-sm">
                          {copy.threadAuthor}
                          <span className="text-ash"> → {person}</span>
                        </p>
                        <p className="text-sm capitalize text-ash">{formatWhen(notice.createdAt.slice(0, 10), locale, copy)}</p>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{notice.message}</p>
                      {replies}
                      {canReply || studioNext ? (
                        <ThreadReply id={notice.id} copy={copy} studioNext={studioNext} />
                      ) : null}
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
                    <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <p className="text-sm">
                        {person}
                        <span className="text-ash"> → {copy.threadAuthor}</span>
                      </p>
                      <p className="text-sm capitalize text-ash">{formatWhen(notice.createdAt.slice(0, 10), locale, copy)}</p>
                    </div>
                    <p className="mt-2 font-serif text-2xl">{heading || copy.requestLabel}</p>
                    {body ? <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{body}</p> : null}
                    {replies}
                    {canReply || studioNext ? (
                      <ThreadReply id={notice.id} copy={copy} studioNext={studioNext} />
                    ) : null}
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
      <HistoryView
        entries={entries}
        requests={requests}
        clientName={clientName}
        studioNext={`/privado/novias/${clientId}?tab=historico`}
      />
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
    </div>
  );
}

export function HistoryComposer({
  clientId,
  returnTab,
  people = [],
  assignee,
}: {
  clientId: string;
  returnTab?: string;
  people?: { id: string; label: string }[];
  assignee?: string;
}) {
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
        {returnTab ? <input type="hidden" name="returnTab" value={returnTab} /> : null}
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
        {assignee ? (
          <input type="hidden" name="assignee" value={assignee === "all" ? "contractor" : assignee} />
        ) : people.length ? (
          <label className="field-label">
            Persona
            <select className="field" name="assignee" defaultValue={people[0]?.id || "contractor"}>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.label}
                </option>
              ))}
            </select>
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

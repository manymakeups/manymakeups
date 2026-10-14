"use client";

import { useState } from "react";
import { dateLocale, interpolate, portalEs, type PortalCopy } from "@/lib/i18n/portal-messages";
import type { Locale } from "@/lib/i18n/config";
import { clientBudget, type BudgetGroup } from "@/lib/portal/budget";
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

function serviceLabel(name: string, copy: PortalCopy) {
  return labelFor(name, copy);
}

function sliceLabel(kind: BudgetGroup["slices"][number]["kind"], copy: PortalCopy) {
  if (kind === "deposit") return copy.deposit;
  if (kind === "trial") return copy.trialDay;
  return copy.eventDay;
}

function BudgetGroups({ groups, copy }: { groups: BudgetGroup[]; copy: PortalCopy }) {
  if (!groups.length) return null;
  return (
    <ul className="mt-8 divide-y divide-ink/10 border border-ink/10">
      {groups.map((group) => {
        const who =
          group.role === "contratante"
            ? copy.contractor
            : copy.whoOptions[group.who] || group.who || interpolate(copy.guestN, { n: group.index + 1 });
        const services = group.services.map((name) => serviceLabel(name, copy)).join(" · ");
        return (
          <li key={group.id} className="px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{who}</p>
            {services ? <p className="mt-1 font-serif text-2xl">{services}</p> : null}
            {group.slices.length ? (
              <ul className="mt-3 flex flex-col gap-1 text-sm">
                {group.slices.map((slice) => (
                  <li key={slice.id}>
                    {sliceLabel(slice.kind, copy)} · {euros(slice.amount)}
                    {` · ${slice.paid ? copy.paid : copy.unpaid}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ash">{copy.budgetUnset}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

type PayFilter = "" | "abonado" | "pendiente";
type WhoFilter = "" | "ella" | "acompanante";

function sameService(name: string, selected: string) {
  return canonicalService(name) === selected;
}

function whoMatches(who: WhoFilter, role: "contratante" | "acompanante") {
  if (!who) return true;
  return who === "ella" ? role === "contratante" : role === "acompanante";
}

function filterGroup(group: BudgetGroup, service: string, pay: PayFilter, who: WhoFilter) {
  if (!whoMatches(who, group.role)) return null;
  if (service && !group.services.some((name) => sameService(name, service))) return null;
  if (pay === "abonado") {
    const slices = group.slices.filter((slice) => slice.paid);
    return slices.length ? { ...group, slices } : null;
  }
  if (pay === "pendiente") {
    const slices = group.slices.filter((slice) => !slice.paid);
    if (group.slices.length && !slices.length) return null;
    return { ...group, slices };
  }
  return group;
}

export function HistoryView({
  entries,
  event,
  payments,
  requests = [],
  copy = portalEs,
  locale = "es",
}: {
  entries: HistoryEntry[];
  event?: EventDetails;
  payments?: Payments;
  requests?: StudioNotice[];
  copy?: PortalCopy;
  locale?: Locale;
}) {
  const [service, setService] = useState("");
  const [pay, setPay] = useState<PayFilter>("");
  const [budgetWho, setBudgetWho] = useState<WhoFilter>("");
  const [contact, setContact] = useState("");
  const [contactWho, setContactWho] = useState<WhoFilter>("");
  const ordered = [...entries].sort((a, b) => `${b.date}${b.title}`.localeCompare(`${a.date}${a.title}`));
  const asked = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const booked = event && payments ? clientBudget({ history: entries, event, payments }) : null;
  const history = booked?.history ?? historyBudget(entries);
  const budget = booked ?? { ...history, groups: [], total: history.total, pending: history.pending, paid: history.paid };
  const showBudget = history.services.length > 0 || budget.groups.length > 0;
  const serviceOptions = [...SERVICE_TITLES];
  const groups = budget.groups.flatMap((group) => {
    const next = filterGroup(group, service, pay, budgetWho);
    return next ? [next] : [];
  });
  const services = history.services.filter((entry) => {
    if (!whoMatches(budgetWho, "contratante")) return false;
    if (service && !sameService(entry.title, service)) return false;
    if (pay === "abonado") return entry.paid;
    if (pay === "pendiente") return !entry.paid;
    return true;
  });
  const contacts = ordered.filter((entry) => {
    if (entry.kind !== "contacto") return false;
    if (contactWho === "acompanante") return false;
    return !contact || entry.title === contact;
  });
  const visibleRequests =
    contact && contact !== "Correo"
      ? []
      : asked.filter((notice) => whoMatches(contactWho, notice.scope === "acompanante" ? "acompanante" : "contratante"));
  const budgetFiltering = Boolean(service || pay || budgetWho);
  const contactFiltering = Boolean(contact || contactWho);
  if (!ordered.length && !asked.length && !showBudget) {
    return <p className="text-sm text-ash">{copy.historyEmpty}</p>;
  }
  return (
    <div className="flex flex-col gap-12">
      <section>
        <h3 className="font-serif text-3xl">{copy.budgetTitle}</h3>
        <p className="mt-3 max-w-2xl text-sm text-ash">{copy.budgetLead}</p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="field-label sm:w-56">
            {copy.filterService}
            <select className="field" value={service} onChange={(event) => setService(event.target.value)}>
              <option value="">{copy.filterAll}</option>
              {serviceOptions.map((title) => (
                <option key={title} value={title}>
                  {serviceLabel(title, copy)}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label sm:w-44">
            {copy.filterPay}
            <select className="field" value={pay} onChange={(event) => setPay(event.target.value as PayFilter)}>
              <option value="">{copy.filterAll}</option>
              <option value="abonado">{copy.paid}</option>
              <option value="pendiente">{copy.budgetPending}</option>
            </select>
          </label>
          <label className="field-label sm:w-44">
            {copy.filterWho}
            <select className="field" value={budgetWho} onChange={(event) => setBudgetWho(event.target.value as WhoFilter)}>
              <option value="">{copy.filterAll}</option>
              <option value="ella">{copy.filterHer}</option>
              <option value="acompanante">{copy.filterGuest}</option>
            </select>
          </label>
        </div>
        {showBudget ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <article className="border border-ink/10 bg-linen/40 p-5">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">{copy.budgetTotal}</p>
              <p className="mt-3 font-serif text-3xl">{euros(budget.total)}</p>
            </article>
            <article className="border border-ink/10 bg-linen/40 p-5">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">{copy.budgetPaid}</p>
              <p className="mt-3 font-serif text-3xl">{euros(budget.paid)}</p>
            </article>
            <article className="border border-ink/10 bg-linen/40 p-5">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">{copy.budgetPending}</p>
              <p className="mt-3 font-serif text-3xl">{euros(budget.pending)}</p>
            </article>
          </div>
        ) : null}
        {groups.length || services.length ? (
          <>
            <BudgetGroups groups={groups} copy={copy} />
            {services.length ? (
              <ul className={`${groups.length ? "mt-4" : "mt-8"} divide-y divide-ink/10 border border-ink/10`}>
                {services.map((entry) => {
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
            ) : null}
          </>
        ) : budgetFiltering ? (
          <p className="mt-6 text-sm text-ash">{copy.filterEmpty}</p>
        ) : null}
      </section>
      <section>
        <h3 className="font-serif text-3xl">{copy.contactsTitle}</h3>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="field-label sm:w-52">
            {copy.filterContact}
            <select className="field" value={contact} onChange={(event) => setContact(event.target.value)}>
              <option value="">{copy.filterAll}</option>
              {CONTACT_TITLES.map((title) => (
                <option key={title} value={title}>
                  {labelFor(title, copy)}
                </option>
              ))}
            </select>
          </label>
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
              return (
                <li key={notice.id} className="px-4 py-5">
                  <article>
                    <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
                      {copy.mailLabel} · {copy.requestLabel}
                    </p>
                    <div className="mt-3 flex items-baseline justify-between gap-4">
                      <p className="text-sm">
                        {copy.threadClient}
                        <span className="text-ash"> → {copy.threadStudio}</span>
                      </p>
                      <p className="text-sm capitalize text-ash">{formatWhen(notice.createdAt.slice(0, 10), locale, copy)}</p>
                    </div>
                    <p className="mt-2 font-serif text-2xl">{heading || copy.requestLabel}</p>
                    {body ? <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{body}</p> : null}
                    {notice.replies.length ? (
                      <ul className="mt-5 space-y-5 border-l border-gilt/50 pl-4 sm:ml-6">
                        {notice.replies.map((reply) => (
                          <li key={reply.id}>
                            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{copy.threadReply}</p>
                            <div className="mt-2 flex items-baseline justify-between gap-4">
                              <p className="text-sm">
                                {copy.threadStudio}
                                <span className="text-ash"> → {copy.threadClient}</span>
                              </p>
                              <p className="text-sm capitalize text-ash">{formatWhen(reply.createdAt.slice(0, 10), locale, copy)}</p>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{reply.text}</p>
                          </li>
                        ))}
                      </ul>
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
      </section>
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
  event,
  payments,
  requests = [],
}: {
  clientId: string;
  entries: HistoryEntry[];
  event: EventDetails;
  payments: Payments;
  requests?: StudioNotice[];
}) {
  const [kind, setKind] = useState<HistoryKind>("servicio");
  const [title, setTitle] = useState<string>(SERVICE_TITLES[0]);
  const titles = kind === "servicio" ? SERVICE_TITLES : CONTACT_TITLES;

  function chooseKind(next: HistoryKind) {
    setKind(next);
    setTitle(next === "servicio" ? SERVICE_TITLES[0] : CONTACT_TITLES[0]);
  }

  return (
    <div className="flex flex-col gap-10">
      <HistoryView entries={entries} event={event} payments={payments} requests={requests} />
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

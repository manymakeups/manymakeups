"use client";

import { useState } from "react";
import { dateLocale, interpolate, portalEs, type PortalCopy } from "@/lib/i18n/portal-messages";
import type { Locale } from "@/lib/i18n/config";
import { clientBudget, type BudgetGroup } from "@/lib/portal/budget";
import {
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
  return copy.historyTitles[title] || title;
}

function serviceLabel(name: string, copy: PortalCopy) {
  if (name === "Maquillaje") return copy.makeup;
  if (name === "Peinado") return copy.hair;
  if (name === "Glitter Bar") return copy.glitterBar;
  if (name === "Beauty Corner") return copy.beautyCorner;
  return copy.serviceOptions[name] || copy.historyTitles[name] || name;
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
  const ordered = [...entries].sort((a, b) => `${b.date}${b.title}`.localeCompare(`${a.date}${a.title}`));
  const asked = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const booked = event && payments ? clientBudget({ history: entries, event, payments }) : null;
  const history = booked?.history ?? historyBudget(entries);
  const budget = booked ?? { ...history, groups: [], total: history.total, pending: history.pending, paid: history.paid };
  const showBudget = history.services.length > 0 || budget.groups.length > 0;
  if (!ordered.length && !asked.length && !showBudget) {
    return <p className="text-sm text-ash">{copy.historyEmpty}</p>;
  }
  return (
    <div className="flex flex-col gap-12">
      {showBudget ? (
        <section>
          <h3 className="font-serif text-3xl">{copy.budgetTitle}</h3>
          <p className="mt-3 max-w-2xl text-sm text-ash">{copy.budgetLead}</p>
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
          <BudgetGroups groups={budget.groups} copy={copy} />
          {history.services.length ? (
            <ul className={`${budget.groups.length ? "mt-4" : "mt-8"} divide-y divide-ink/10 border border-ink/10`}>
              {history.services.map((entry) => {
                const known = CATALOG.has(entry.title);
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
        </section>
      ) : null}
      {ordered.length || asked.length ? (
        <ul className="divide-y divide-ink/10 border border-ink/10">
          {asked.map((notice) => {
            const [heading, ...rest] = notice.message.split(/\n\n/);
            const body = rest.join("\n\n").trim();
            return (
              <li key={notice.id} className="px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{copy.requestLabel}</p>
                <p className="mt-1 font-serif text-2xl">{heading || copy.requestLabel}</p>
                <p className="mt-1 text-sm capitalize text-ash">{formatWhen(notice.createdAt.slice(0, 10), locale, copy)}</p>
                {body ? <p className="mt-2 whitespace-pre-wrap text-sm text-ash">{body}</p> : null}
                {notice.replies.map((reply) => (
                  <p key={reply.id} className="mt-2 whitespace-pre-wrap text-sm">
                    {reply.text}
                  </p>
                ))}
              </li>
            );
          })}
          {ordered.map((entry) => {
            const known = CATALOG.has(entry.title);
            const category = known ? labelFor(entry.title, copy) : "";
            const specific = entry.name.trim() || (known ? "" : entry.title);
            return (
              <li key={entry.id} className="px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
                  {copy.historyKinds[entry.kind]}
                  {category ? ` · ${category}` : ""}
                </p>
                {specific ? <p className="mt-1 font-serif text-2xl">{specific}</p> : null}
                <p className={`${specific ? "mt-1 text-sm text-ash" : "mt-1 font-serif text-2xl"} capitalize`}>
                  {formatWhen(entry.date, locale, copy)}
                </p>
                {entry.kind === "servicio" ? (
                  <p className="mt-2 text-sm">
                    {euros(entry.amount)}
                    {` · ${entry.paid ? copy.paid : copy.unpaid}`}
                  </p>
                ) : null}
                {entry.notes ? <p className="mt-2 whitespace-pre-wrap text-sm text-ash">{entry.notes}</p> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function nameLabel(title: string) {
  if (title === "Tratamiento facial" || title === "Servicios de ojos") return "Nombre del tratamiento";
  if (title === "Bonos de tratamientos" || title === "Bonos de ojos") return "Nombre del bono";
  if (title === "Formaciones") return "Nombre de la formación";
  if (title === "Compra de productos") return "Qué ha comprado";
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

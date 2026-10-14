"use client";

import { useState } from "react";
import { dateLocale, portalEs, type PortalCopy } from "@/lib/i18n/portal-messages";
import type { Locale } from "@/lib/i18n/config";
import {
  CONTACT_TITLES,
  euros,
  historyBudget,
  SERVICE_TITLES,
  type HistoryEntry,
  type HistoryKind,
  type Payments,
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

export function HistoryView({
  entries,
  payments,
  copy = portalEs,
  locale = "es",
}: {
  entries: HistoryEntry[];
  payments: Payments;
  copy?: PortalCopy;
  locale?: Locale;
}) {
  const ordered = [...entries].sort((a, b) => `${b.date}${b.title}`.localeCompare(`${a.date}${a.title}`));
  const budget = historyBudget(entries, payments);
  if (!ordered.length) {
    return <p className="text-sm text-ash">{copy.historyEmpty}</p>;
  }
  return (
    <div className="flex flex-col gap-12">
      {budget.services.length ? (
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
        </section>
      ) : null}
      <ul className="divide-y divide-ink/10 border border-ink/10">
        {ordered.map((entry) => {
          const name = labelFor(entry.title, copy);
          const named = !CATALOG.has(entry.title);
          return (
            <li key={entry.id} className="px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
                {copy.historyKinds[entry.kind]}
                {named ? "" : ` · ${name}`}
              </p>
              {named ? <p className="mt-1 font-serif text-2xl">{name}</p> : null}
              <p className={`${named ? "mt-1 text-sm text-ash" : "mt-1 font-serif text-2xl"} capitalize`}>
                {formatWhen(entry.date, locale, copy)}
              </p>
              {entry.kind === "servicio" ? <p className="mt-2 text-sm">{euros(entry.amount)}</p> : null}
              {entry.notes ? <p className="mt-2 whitespace-pre-wrap text-sm text-ash">{entry.notes}</p> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function HistoryForm({ clientId, entries, payments }: { clientId: string; entries: HistoryEntry[]; payments: Payments }) {
  const [kind, setKind] = useState<HistoryKind>("servicio");
  const [title, setTitle] = useState<string>(SERVICE_TITLES[0]);
  const titles = kind === "servicio" ? SERVICE_TITLES : CONTACT_TITLES;

  function chooseKind(next: HistoryKind) {
    setKind(next);
    setTitle(next === "servicio" ? SERVICE_TITLES[0] : CONTACT_TITLES[0]);
  }

  return (
    <div className="flex flex-col gap-10">
      <HistoryView entries={entries} payments={payments} />
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
        {title === "Otro" || title === "Tratamiento de piel" ? (
          <label className="field-label">
            {title === "Tratamiento de piel" ? "Nombre del tratamiento" : "Nombre"}
            <input className="field" name="customTitle" required />
          </label>
        ) : null}
        <label className="field-label">
          Fecha
          <input className="field" name="date" type="date" required />
        </label>
        {kind === "servicio" ? (
          <label className="field-label">
            Importe
            <input className="field" name="amount" type="number" min="0" step="0.01" defaultValue="0" />
          </label>
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
                  {entry.kind === "servicio" ? "Servicio" : "Contacto"} · {entry.title} · {entry.date || "sin fecha"}
                  {entry.kind === "servicio" ? ` · ${euros(entry.amount)}` : ""}
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

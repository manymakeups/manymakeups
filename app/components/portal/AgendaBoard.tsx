"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calendarAssignmentId,
  dayLabel,
  monthCells,
  monthLabel,
  shiftMonth,
  weekdayLabels,
  type RemoteEvent,
} from "@/lib/portal/calendar";
import { APPOINTMENT_TITLES } from "@/lib/portal/types";

type ClientOption = { id: string; name: string; email: string };
type Assignment = { eventId: string; clientId: string; clientName: string };

function fold(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function guessTitle(title: string) {
  const value = fold(title);
  if (value.includes("entrevista")) return "Entrevista";
  if (value.includes("curso")) return "Curso";
  if (value.includes("ojo")) return "Tratamientos de ojos";
  if (value.includes("facial") || value.includes("tratamiento")) return "Tratamiento facial";
  if (value.includes("maquillaje") && value.includes("peinado")) return "Maquillaje y peinado";
  if (value.includes("peinado")) return "Peinado";
  if (value.includes("maquillaje")) return "Maquillaje";
  if (value.includes("prueba")) return "Prueba";
  return "Prueba";
}

function pickDay(cells: Array<string | null>, today: string, events: RemoteEvent[]) {
  if (cells.includes(today)) return today;
  return cells.find((cell) => cell && events.some((event) => event.date === cell)) || cells.find(Boolean) || today;
}

export function AgendaBoard({
  events,
  today,
  initialYear,
  initialMonth,
  initialDay,
  clients,
  assignments,
}: {
  events: RemoteEvent[];
  today: string;
  initialYear: number;
  initialMonth: number;
  initialDay: string;
  clients: ClientOption[];
  assignments: Assignment[];
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selected, setSelected] = useState(initialDay);
  const [assigning, setAssigning] = useState<RemoteEvent | null>(null);
  const [clientId, setClientId] = useState("");
  const [query, setQuery] = useState("");
  const assignedTo = useMemo(() => {
    const map = new Map<string, Assignment>();
    for (const item of assignments) map.set(item.eventId, item);
    return map;
  }, [assignments]);
  const matches = useMemo(() => {
    const needle = fold(query.trim());
    if (!needle) return clients;
    return clients.filter((client) => fold(`${client.name} ${client.email}`).includes(needle));
  }, [clients, query]);
  const cells = monthCells(year, month);
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const inMonth = useMemo(() => events.filter((event) => event.date.startsWith(prefix)), [events, prefix]);
  const dayEvents = events.filter((event) => event.date === selected);
  const byDate = useMemo(() => {
    const map = new Map<string, RemoteEvent[]>();
    for (const event of inMonth) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [inMonth]);

  function showMonth(nextYear: number, nextMonth: number) {
    const nextCells = monthCells(nextYear, nextMonth);
    const nextDay = pickDay(nextCells, today, events);
    setYear(nextYear);
    setMonth(nextMonth);
    setSelected(nextDay);
    const stamp = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    window.history.replaceState(null, "", `/privado/calendario?mes=${stamp}&dia=${nextDay}`);
  }

  useEffect(() => {
    if (!assigning) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setAssigning(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [assigning]);

  function openAssign(event: RemoteEvent) {
    setAssigning(event);
    setClientId(assignedTo.get(calendarAssignmentId(event.id))?.clientId ?? "");
    setQuery("");
  }

  function showDay(date: string) {
    setSelected(date);
    window.history.replaceState(null, "", `/privado/calendario?mes=${prefix}&dia=${date}`);
  }

  const previous = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  return (
    <>
      <div className="mt-6 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-serif text-3xl sm:text-4xl">{monthLabel(year, month)}</h2>
        <div className="flex gap-4 text-[0.68rem] uppercase tracking-[0.16em]">
          <button className="hover:text-gilt" type="button" onClick={() => showMonth(previous.year, previous.month)}>
            Anterior
          </button>
          <button className="hover:text-gilt" type="button" onClick={() => showMonth(next.year, next.month)}>
            Siguiente
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 border-l border-t border-ink/10 text-center text-[0.62rem] uppercase tracking-normal text-ash sm:mt-8 sm:tracking-[0.14em]">
        {weekdayLabels().map((label) => (
          <div key={label} className="border-b border-r border-ink/10 px-0.5 py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-ink/10">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="min-h-12 border-b border-r border-ink/10 bg-linen/40 sm:min-h-24" />;
          }
          const items = byDate.get(date) ?? [];
          const isToday = date === today;
          const isSelected = date === selected;
          return (
            <button
              key={date}
              type="button"
              onClick={() => showDay(date)}
              aria-pressed={isSelected}
              aria-label={items.length ? `${dayLabel(date)}. ${items.length}` : dayLabel(date)}
              className={`flex min-h-12 flex-col gap-1 border-b border-r border-ink/10 p-1 text-left sm:min-h-24 sm:p-2 ${isSelected ? "bg-ink text-porcelain" : "hover:bg-linen/60"}`}
            >
              <span className={`text-sm ${isToday && !isSelected ? "font-medium text-gilt" : ""}`}>
                {Number(date.slice(-2))}
              </span>
              {items.length ? (
                <span className={`mt-auto flex items-center gap-1 sm:hidden ${isSelected ? "text-porcelain" : "text-gilt"}`}>
                  <span className={`block h-1.5 w-1.5 rounded-full ${isSelected ? "bg-porcelain" : "bg-gilt"}`} />
                  {items.length > 1 ? <span className="text-[0.62rem] leading-none">{items.length}</span> : null}
                </span>
              ) : null}
              {items.slice(0, 3).map((event) => (
                <span
                  key={event.id}
                  className={`hidden truncate text-[0.68rem] leading-tight sm:block ${isSelected ? "text-porcelain/90" : "text-ink"}`}
                >
                  {event.time ? `${event.time} ` : ""}
                  {event.title}
                </span>
              ))}
              {items.length > 3 ? (
                <span className={`hidden text-[0.62rem] sm:block ${isSelected ? "text-porcelain/70" : "text-ash"}`}>+{items.length - 3}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <section className="mt-10">
        <h3 className="font-serif text-3xl">{dayLabel(selected)}</h3>
        {dayEvents.length ? (
          <ul className="mt-4 divide-y divide-ink/10 border border-ink/10">
            {dayEvents.map((event) => {
              const assigned = assignedTo.get(calendarAssignmentId(event.id));
              return (
              <li key={event.id} className="flex flex-wrap items-start justify-between gap-4 px-4 py-4">
                <div className="min-w-0">
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{event.time || "Todo el día"}</p>
                  <p className="mt-1 font-serif text-2xl">{event.title}</p>
                  {event.source ? <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-ash">{event.source}</p> : null}
                  {event.place ? <p className="mt-1 text-sm text-ash">{event.place}</p> : null}
                  {event.notes ? <p className="mt-2 whitespace-pre-wrap text-sm text-ash">{event.notes}</p> : null}
                  {assigned ? (
                    <a className="mt-2 inline-block text-sm text-gilt underline decoration-gilt/40 underline-offset-4" href={`/privado/novias/${assigned.clientId}?tab=agenda`}>
                      Asignada a {assigned.clientName}
                    </a>
                  ) : null}
                </div>
                <button type="button" className="btn-atelier shrink-0" onClick={() => openAssign(event)}>
                  {assigned ? "Cambiar clienta" : "Asignar cita a clienta"}
                </button>
              </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ash">Este día no hay citas.</p>
        )}
      </section>
      {assigning ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/40 p-3 sm:items-center sm:p-6" onClick={() => setAssigning(null)}>
          <div
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto bg-porcelain p-6 shadow-[0_20px_60px_rgba(26,22,19,0.16)]"
            role="dialog"
            aria-modal="true"
            aria-label="Asignar cita a clienta"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="font-serif text-3xl">Asignar cita a clienta</h2>
            <p className="mt-2 text-sm text-ash">{assigning.title}</p>
            <form key={assigning.id} action="/api/admin/appointments" method="post" className="mt-6 grid gap-4">
              <input type="hidden" name="intent" value="assign" />
              <input type="hidden" name="externalId" value={calendarAssignmentId(assigning.id)} />
              <input type="hidden" name="clientId" value={clientId} />
              <input type="hidden" name="next" value={`/privado/calendario?mes=${prefix}&dia=${assigning.date}`} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field-label">
                  Fecha
                  <input className="field" name="date" type="date" required defaultValue={assigning.date} />
                </label>
                <label className="field-label">
                  Hora
                  <input className="field" name="time" type="time" defaultValue={assigning.time} />
                </label>
              </div>
              <label className="field-label">
                Tipo de cita
                <select className="field" name="title" defaultValue={guessTitle(assigning.title)}>
                  {APPOINTMENT_TITLES.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                Lugar
                <input className="field" name="place" defaultValue={assigning.place} />
              </label>
              <label className="field-label">
                Notas
                <textarea className="field min-h-20" name="notes" defaultValue={assigning.notes} />
              </label>
              <label className="field-label">
                Clienta
                <input
                  className="field"
                  value={query}
                  placeholder="Buscar por nombre o email"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <ul className="max-h-48 overflow-y-auto border border-ink/10">
                {matches.length ? (
                  matches.map((client) => (
                    <li key={client.id}>
                      <button
                        type="button"
                        className={`block w-full px-4 py-3 text-left hover:bg-linen/70 ${clientId === client.id ? "bg-linen" : ""}`}
                        onClick={() => setClientId(client.id)}
                      >
                        <span className="block text-sm">{client.name}</span>
                        <span className="block text-xs text-ash">{client.email}</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-sm text-ash">Nadie coincide con esa búsqueda.</li>
                )}
              </ul>
              <button className="btn-atelier-solid btn-atelier self-start" type="submit" disabled={!clientId}>
                Asignar
              </button>
            </form>
            <button
              type="button"
              className="mt-4 text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink"
              onClick={() => setAssigning(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

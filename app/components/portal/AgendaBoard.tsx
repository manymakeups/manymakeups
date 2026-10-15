"use client";

import { useMemo, useState } from "react";
import {
  dayLabel,
  monthCells,
  monthLabel,
  shiftMonth,
  weekdayLabels,
  type RemoteEvent,
} from "@/lib/portal/calendar";

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
}: {
  events: RemoteEvent[];
  today: string;
  initialYear: number;
  initialMonth: number;
  initialDay: string;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selected, setSelected] = useState(initialDay);
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
            {dayEvents.map((event) => (
              <li key={event.id} className="px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{event.time || "Todo el día"}</p>
                <p className="mt-1 font-serif text-2xl">{event.title}</p>
                {event.source ? <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-ash">{event.source}</p> : null}
                {event.place ? <p className="mt-1 text-sm text-ash">{event.place}</p> : null}
                {event.notes ? <p className="mt-2 whitespace-pre-wrap text-sm text-ash">{event.notes}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ash">Este día no hay citas.</p>
        )}
      </section>
    </>
  );
}

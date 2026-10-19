"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendlyEmbed } from "@/app/components/CalendlyEmbed";
import { dayLabel, monthCells, monthLabel, shiftMonth, weekdayLabels } from "@/lib/portal/calendar";

export function ClientCalendar({
  busyDates,
  today,
  initialYear,
  initialMonth,
  freeLabel,
  closeLabel,
  previousLabel,
  nextLabel,
  bookable = true,
  locale = "es",
}: {
  busyDates: string[];
  today: string;
  initialYear: number;
  initialMonth: number;
  freeLabel: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  bookable?: boolean;
  locale?: string;
}) {
  const busy = useMemo(() => new Set(busyDates), [busyDates]);
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selected, setSelected] = useState("");
  const [booking, setBooking] = useState("");
  const cells = monthCells(year, month);
  const previous = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  function showMonth(nextYear: number, nextMonth: number) {
    setYear(nextYear);
    setMonth(nextMonth);
    setSelected("");
    const stamp = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    const url = new URL(window.location.href);
    url.searchParams.set("mes", stamp);
    url.searchParams.delete("dia");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!/^https:\/\/([a-z0-9-]+\.)*calendly\.com$/.test(event.origin)) return;
      const data = event.data as { event?: string; payload?: { invitee?: { uri?: string } } } | null;
      if (!data || data.event !== "calendly.event_scheduled" || !booking) return;
      const body = new FormData();
      body.set("intent", "book");
      body.set("date", booking);
      const uri = data.payload?.invitee?.uri;
      if (uri) body.set("externalId", uri);
      void fetch("/api/portal/appointments", { method: "POST", body });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [booking]);

  function openDay(date: string) {
    setSelected(date);
    setBooking(date);
    const url = new URL(window.location.href);
    url.searchParams.set("mes", date.slice(0, 7));
    url.searchParams.set("dia", date);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="font-serif text-3xl sm:text-4xl">{monthLabel(year, month, locale)}</h3>
        <div className="flex gap-4 text-[0.68rem] uppercase tracking-[0.16em]">
          <button className="hover:text-gilt" type="button" onClick={() => showMonth(previous.year, previous.month)}>
            {previousLabel}
          </button>
          <button className="hover:text-gilt" type="button" onClick={() => showMonth(next.year, next.month)}>
            {nextLabel}
          </button>
        </div>
      </div>

      <p className="mt-6 flex items-center gap-2 text-sm text-gilt sm:hidden">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gilt" />
        {freeLabel}
      </p>
      <div className="mt-4 grid grid-cols-7 border-l border-t border-ink/10 text-center text-[0.62rem] uppercase tracking-normal text-ash sm:mt-8 sm:tracking-[0.14em]">
        {weekdayLabels(locale).map((label) => (
          <div key={label} className="border-b border-r border-ink/10 px-0.5 py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-ink/10">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="min-h-16 border-b border-r border-ink/10 bg-linen/40 sm:min-h-28" />;
          }
          const weekday = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8)))).getUTCDay();
          const free = date >= today && weekday !== 0 && !busy.has(date);
          const isToday = date === today;
          const isSelected = date === selected;
          const className = `flex min-h-16 flex-col gap-1 overflow-hidden border-b border-r border-ink/10 p-1 text-left sm:min-h-28 sm:p-2 ${
            isSelected ? "bg-ink text-porcelain" : free ? "hover:bg-linen/60" : ""
          }`;
          const inner = (
            <>
              <span className={`text-sm leading-none ${isToday && !isSelected ? "font-medium text-gilt" : ""}`}>
                {Number(date.slice(-2))}
              </span>
              {free ? (
                <span className={`mt-auto text-gilt ${isSelected ? "text-porcelain" : ""}`}>
                  <span className={`block h-1.5 w-1.5 rounded-full sm:hidden ${isSelected ? "bg-porcelain" : "bg-gilt"}`} />
                  <span className={`hidden w-full min-w-0 text-[0.68rem] leading-tight sm:block ${isSelected ? "text-porcelain" : "text-gilt"}`}>
                    <span className={`mb-0.5 block h-1.5 w-1.5 rounded-full ${isSelected ? "bg-porcelain" : "bg-gilt"}`} />
                    {freeLabel.split(" ").map((word) => (
                      <span key={word} className="block">
                        {word}
                      </span>
                    ))}
                  </span>
                </span>
              ) : null}
            </>
          );
          if (!free || !bookable) {
            return (
              <div key={date} className={className}>
                {inner}
              </div>
            );
          }
          return (
            <button key={date} type="button" onClick={() => openDay(date)} aria-pressed={isSelected} aria-label={`${dayLabel(date, locale)}. ${freeLabel}`} className={className}>
              {inner}
            </button>
          );
        })}
      </div>

      {booking ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-3 sm:items-center sm:p-6" role="presentation" onClick={() => setBooking("")}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={dayLabel(booking, locale)}
            className="flex max-h-[92vh] w-full max-w-[1100px] flex-col bg-porcelain shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4">
              <p className="font-serif text-2xl">{dayLabel(booking, locale)}</p>
              <button className="text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink" type="button" onClick={() => setBooking("")}>
                {closeLabel}
              </button>
            </div>
            <CalendlyEmbed eager month={booking.slice(0, 7)} date={booking} />
          </div>
        </div>
      ) : null}
    </>
  );
}

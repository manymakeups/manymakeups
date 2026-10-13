import { CopyInvite } from "@/app/components/portal/FileActions";
import { PortalFrame } from "@/app/components/portal/PortalFrame";
import { StudioAside } from "@/app/components/portal/StudioAside";
import {
  calendarFeedUrls,
  dayLabel,
  monthCells,
  monthLabel,
  parseMonth,
  shiftMonth,
  studioEvents,
  weekdayLabels,
  madridToday,
} from "@/lib/portal/calendar";
import { requireAdmin } from "@/lib/portal/session";
import { listClients } from "@/lib/portal/store";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda",
  robots: { index: false, follow: false },
};

export default async function StudioCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; dia?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const { mes, dia } = await searchParams;
  const today = madridToday();
  const { year, month } = parseMonth(mes, today);
  const events = studioEvents(await listClients());
  const cells = monthCells(year, month);
  const inMonth = events.filter((event) => event.date.startsWith(`${year}-${String(month).padStart(2, "0")}`));
  const selected =
    dia && cells.includes(dia) ? dia : cells.includes(today) ? today : cells.find((cell) => cell && inMonth.some((event) => event.date === cell)) || cells.find(Boolean) || today;
  const dayEvents = events.filter((event) => event.date === selected);
  const previous = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const feed = calendarFeedUrls();
  const byDate = new Map<string, typeof events>();
  for (const event of inMonth) {
    const list = byDate.get(event.date) ?? [];
    list.push(event);
    byDate.set(event.date, list);
  }

  return (
    <PortalFrame
      kicker="Estudio"
      title="Agenda"
      lead="Las citas de todas las clientas, y el día de cada celebración."
      aside={
        <StudioAside
          extra={
            <a className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" href="/privado/novias">
              Clientas
            </a>
          }
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-serif text-4xl">{monthLabel(year, month)}</h2>
        <div className="flex gap-4 text-[0.68rem] uppercase tracking-[0.16em]">
          <a className="hover:text-gilt" href={`/privado/calendario?mes=${previous.year}-${String(previous.month).padStart(2, "0")}`}>
            Anterior
          </a>
          <a className="hover:text-gilt" href={`/privado/calendario?mes=${next.year}-${String(next.month).padStart(2, "0")}`}>
            Siguiente
          </a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-7 border-l border-t border-ink/10 text-center text-[0.62rem] uppercase tracking-[0.14em] text-ash">
        {weekdayLabels().map((label) => (
          <div key={label} className="border-b border-r border-ink/10 py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-ink/10">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="min-h-16 border-b border-r border-ink/10 bg-linen/40 sm:min-h-24" />;
          }
          const items = byDate.get(date) ?? [];
          const isToday = date === today;
          const isSelected = date === selected;
          return (
            <a
              key={date}
              href={`/privado/calendario?mes=${year}-${String(month).padStart(2, "0")}&dia=${date}`}
              className={`flex min-h-16 flex-col gap-1 border-b border-r border-ink/10 p-2 text-left sm:min-h-24 ${isSelected ? "bg-ink text-porcelain" : "hover:bg-linen/60"}`}
            >
              <span className={`text-sm ${isToday && !isSelected ? "font-medium text-gilt" : ""}`}>
                {Number(date.slice(-2))}
              </span>
              {items.slice(0, 3).map((event) => (
                <span
                  key={event.id}
                  className={`truncate text-[0.68rem] leading-tight ${isSelected ? "text-porcelain/90" : "text-ink"}`}
                >
                  {event.time ? `${event.time.slice(0, 5)} ` : ""}
                  {event.clientName}
                </span>
              ))}
              {items.length > 3 ? (
                <span className={`text-[0.62rem] ${isSelected ? "text-porcelain/70" : "text-ash"}`}>+{items.length - 3}</span>
              ) : null}
            </a>
          );
        })}
      </div>

      <section className="mt-10">
        <h3 className="font-serif text-3xl">{dayLabel(selected)}</h3>
        {dayEvents.length ? (
          <ul className="mt-4 divide-y divide-ink/10 border border-ink/10">
            {dayEvents.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
                    {event.title}
                    {event.time ? ` · ${event.time.slice(0, 5)}` : ""}
                  </p>
                  <p className="mt-1 font-serif text-2xl">{event.clientName}</p>
                  {event.place ? <p className="mt-1 text-sm text-ash">{event.place}</p> : null}
                </div>
                <a className="btn-atelier" href={`/privado/novias/${event.clientId}?tab=agenda`}>
                  Abrir ficha
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ash">Este día no hay citas.</p>
        )}
      </section>

      {feed ? (
        <section className="mt-12 max-w-xl border border-ink/10 px-6 py-6">
          <h3 className="font-serif text-2xl">En el móvil</h3>
          <p className="mt-3 text-sm leading-relaxed text-ash">
            Suscribe este calendario en el iPhone o en el Mac. Cuando añadas o cambies una cita aquí,
            el teléfono la actualiza solo. Si la modificas en el móvil, el cambio no vuelve a la web:
            la agenda de aquí es la que manda.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a className="btn-atelier btn-atelier-solid" href={feed.webcal}>
              Añadir al calendario del móvil
            </a>
            <CopyInvite url={feed.https} />
          </div>
        </section>
      ) : null}
    </PortalFrame>
  );
}

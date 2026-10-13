import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { StudioAside } from "@/app/components/portal/StudioAside";
import {
  dayLabel,
  fetchCalendarEvents,
  monthCells,
  monthLabel,
  parseMonth,
  shiftMonth,
  weekdayLabels,
  madridToday,
  type RemoteEvent,
} from "@/lib/portal/calendar";
import { requireAdmin } from "@/lib/portal/session";
import { getStudioCalendars } from "@/lib/portal/store";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda",
  robots: { index: false, follow: false },
};

function CalendarLinkForm({ primary, google, extra }: { primary: string; google: string; extra: string }) {
  return (
    <form action="/api/admin/calendar" method="post" className="mt-5 flex flex-col gap-4">
      <label className="field-label">
        Enlace del iPhone
        <input className="field" name="url" type="text" inputMode="url" defaultValue={primary} placeholder="webcal:// o https://" autoComplete="off" />
      </label>
      <label className="field-label">
        Enlace de Google
        <input className="field" name="google" type="text" inputMode="url" defaultValue={google} placeholder="https://calendar.google.com/..." autoComplete="off" />
      </label>
      <label className="field-label">
        Enlace iCal de Calendly, si lo tienes
        <input className="field" name="extra" type="text" inputMode="url" defaultValue={extra} placeholder="webcal:// o https://" autoComplete="off" />
      </label>
      <div className="flex flex-wrap gap-3">
        <button className="btn-atelier btn-atelier-solid" type="submit">
          Guardar
        </button>
        {primary || google || extra ? (
          <button className="btn-atelier" type="submit" name="clear" value="1">
            Quitar
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default async function StudioCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; dia?: string; ok?: string; error?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const { mes, dia, ok, error } = await searchParams;
  const { primary, google, extra } = await getStudioCalendars();
  const feeds = [
    { url: primary, source: "iPhone" },
    { url: google, source: "Google" },
    { url: extra, source: "Calendly" },
  ].filter((feed) => feed.url);
  const loadedFeeds = await Promise.all(
    feeds.map(async (feed) => {
      const result = await fetchCalendarEvents(feed.url);
      return {
        source: feed.source,
        error: result.error,
        events: result.events.map((event) => ({ ...event, source: feed.source, id: `${feed.source}-${event.id}` })),
      };
    }),
  );
  const seen = new Set<string>();
  const loaded = {
    events: loadedFeeds.flatMap((feed) => feed.events).filter((event) => {
      const key = `${event.date}|${event.time}|${event.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
    error: loadedFeeds
      .filter((feed) => feed.error)
      .map((feed) => feed.source)
      .join(", "),
  };
  const ready = loadedFeeds.some((feed) => !feed.error);
  const today = madridToday();
  const { year, month } = parseMonth(mes, today);
  const events = loaded.events;
  const cells = monthCells(year, month);
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const inMonth = events.filter((event) => event.date.startsWith(prefix));
  const selected =
    dia && cells.includes(dia)
      ? dia
      : cells.includes(today)
        ? today
        : cells.find((cell) => cell && inMonth.some((event) => event.date === cell)) || cells.find(Boolean) || today;
  const dayEvents = events.filter((event) => event.date === selected);
  const previous = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const byDate = new Map<string, RemoteEvent[]>();
  for (const event of inMonth) {
    const list = byDate.get(event.date) ?? [];
    list.push(event);
    byDate.set(event.date, list);
  }

  return (
    <PortalFrame
      kicker="Estudio"
      title="Agenda"
      lead="Las citas del iPhone, de Google y las reservas que Calendly escribe en ese Google."
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
      {ok === "enlace" ? <PortalNotice>Calendario conectado. Las citas nuevas salen al abrir esta página.</PortalNotice> : null}
      {ok === "quitado" ? <PortalNotice>He quitado el enlace. Esta agenda ya no lee el móvil.</PortalNotice> : null}
      {error === "enlace" ? (
        <PortalNotice>Ese enlace no vale. Tiene que ser el de Calendario público, el que empieza por webcal:// o https://.</PortalNotice>
      ) : null}
      {error === "descarga" || loaded.error ? (
        <PortalNotice>
          No he podido leer {loaded.error ? loaded.error : "el calendario"}. Comprueba que sigue activo el calendario
          público y vuelve a pegar el enlace.
        </PortalNotice>
      ) : null}

      <section className="max-w-xl border border-ink/10 px-6 py-6">
        <h2 className="font-serif text-2xl">Tres calendarios, una agenda</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ash">
          <li>iPhone: el calendario público de iCloud. Las citas nuevas se apuntan ahí, desde el móvil.</li>
          <li>Google: manymakeupscalendar@gmail.com. Ahí deben caer las reservas de Calendly.</li>
          <li>
            Calendly: la cita de estudio ya está en la web. Esta página no lee la página de reserva; lee las citas
            cuando Calendly las añade al Google. Si Calendly te da un enlace iCal, pégalo en el tercer campo.
          </li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-ash">
          Un cambio puede tardar unos minutos. Si una reserva de Calendly no sale, en Calendly el calendario donde se
          añaden las reservas tiene que ser ese Google.
        </p>
        <CalendarLinkForm primary={primary} google={google} extra={extra} />
      </section>

      {ready ? (
        <>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
                      {event.time ? `${event.time} ` : ""}
                      {event.title}
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
                  <li key={event.id} className="px-4 py-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
                      {event.time || "Todo el día"}
                    </p>
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
      ) : null}
    </PortalFrame>
  );
}

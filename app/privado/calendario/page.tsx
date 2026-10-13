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
import { getStudioCalendarUrl } from "@/lib/portal/store";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda",
  robots: { index: false, follow: false },
};

function CalendarLinkForm({ url }: { url: string }) {
  return (
    <form action="/api/admin/calendar" method="post" className="mt-5 flex flex-col gap-3">
      <label className="field-label">
        Enlace del calendario
        <input className="field" name="url" type="text" inputMode="url" defaultValue={url} placeholder="webcal:// o https://" autoComplete="off" />
      </label>
      <div className="flex flex-wrap gap-3">
        <button className="btn-atelier btn-atelier-solid" type="submit">
          Guardar
        </button>
        {url ? (
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
  const url = await getStudioCalendarUrl();
  const loaded = url ? await fetchCalendarEvents(url) : { events: [] as RemoteEvent[], error: "" };
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
      lead="Las citas las creas en el iPhone. Aquí se ven las de ese calendario."
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
        <PortalNotice>No he podido leer el calendario. Comprueba que sigue activo el calendario público y vuelve a pegar el enlace.</PortalNotice>
      ) : null}

      <section className="max-w-xl border border-ink/10 px-6 py-6">
        <h2 className="font-serif text-2xl">El calendario del iPhone</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ash">
          <li>Abre Calendario y toca Calendarios, abajo.</li>
          <li>Toca la i de un calendario de iCloud. Los de «En mi iPhone» no sirven.</li>
          <li>Activa Calendario público y toca Compartir enlace.</li>
          <li>Copia el enlace y pégalo aquí.</li>
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-ash">
          Las citas las apuntas en ese calendario, desde el móvil. Esta página las lee. Puede tardar unos minutos en
          aparecer un cambio. Quien tenga el enlace ve las citas, así que mejor un calendario solo del estudio.
        </p>
        <CalendarLinkForm url={url} />
      </section>

      {url && !loaded.error ? (
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

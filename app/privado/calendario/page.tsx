import { AgendaBoard, CalendarLinkFold } from "@/app/components/portal/AgendaBoard";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { StudioAside } from "@/app/components/portal/StudioAside";
import { fetchCalendarEvents, monthCells, parseMonth, madridToday, type RemoteEvent } from "@/lib/portal/calendar";
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

      <CalendarLinkFold startOpen={Boolean(error)}>
        <ul className="space-y-2 text-sm leading-relaxed text-ash">
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
      </CalendarLinkFold>

      {ready ? (
        <AgendaBoard events={events} today={today} initialYear={year} initialMonth={month} initialDay={selected} />
      ) : null}
    </PortalFrame>
  );
}

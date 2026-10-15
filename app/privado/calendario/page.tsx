import { AgendaBoard } from "@/app/components/portal/AgendaBoard";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { StudioAside } from "@/app/components/portal/StudioAside";
import { fetchCalendarEvents, monthCells, parseMonth, madridToday } from "@/lib/portal/calendar";
import { requireAdmin } from "@/lib/portal/session";
import { getStudioCalendars } from "@/lib/portal/store";
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
  searchParams: Promise<{ mes?: string; dia?: string; error?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const { mes, dia, error } = await searchParams;
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
      pinned
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
      <div data-portal-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
      {error === "descarga" || loaded.error ? (
        <PortalNotice>
          No he podido leer {loaded.error ? loaded.error : "el calendario"}. Comprueba que el calendario público sigue
          activo.
        </PortalNotice>
      ) : null}

      {ready ? (
        <AgendaBoard events={events} today={today} initialYear={year} initialMonth={month} initialDay={selected} />
      ) : null}
      </div>
    </PortalFrame>
  );
}

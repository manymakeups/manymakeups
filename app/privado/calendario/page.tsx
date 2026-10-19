import { AgendaBoard } from "@/app/components/portal/AgendaBoard";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { StudioAside } from "@/app/components/portal/StudioAside";
import { fetchCalendarEvents, monthCells, parseMonth, madridToday } from "@/lib/portal/calendar";
import { googleCalendarConfigured } from "@/lib/portal/google-calendar";
import { fullName } from "@/lib/portal/names";
import { requireAdmin } from "@/lib/portal/session";
import { getGoogleCalendarLink, getStudioCalendars, listClients, listHiddenCalendarIds } from "@/lib/portal/store";
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
  searchParams: Promise<{ mes?: string; dia?: string; error?: string; ok?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");
  const { mes, dia, error, ok } = await searchParams;
  const clients = await listClients();
  const hiddenIds = await listHiddenCalendarIds();
  const googleLink = await getGoogleCalendarLink();
  const googleConfigured = googleCalendarConfigured();
  const googleConnected = googleConfigured && Boolean(googleLink.refreshToken);
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
      studio
      aside={<StudioAside />}
    >
      <div data-portal-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
      {error === "datos" ? <PortalNotice>Elige una clienta para asignar la cita.</PortalNotice> : null}
      {ok === "asignada" ? (
        <PortalNotice>Cita asignada. La clienta la ve en su agenda como planificada.</PortalNotice>
      ) : null}
      {ok === "google" ? (
        <PortalNotice>
          Google conectado{googleLink.email ? ` con ${googleLink.email}` : ""}. Al quitar una cita también se borra en
          Google y en el iPhone.
        </PortalNotice>
      ) : null}
      {ok === "google-borrada" ? (
        <PortalNotice>Cita borrada en Google. El iPhone la quita al refrescar, normalmente en menos de un minuto.</PortalNotice>
      ) : null}
      {ok === "google-off" ? <PortalNotice>Google desconectado. Quitar una cita solo la oculta en esta web.</PortalNotice> : null}
      {error === "google-conexion" ? (
        <PortalNotice>Esa cita sigue en Google y en el iPhone. Conecta el calendario para poder borrarla también allí.</PortalNotice>
      ) : null}
      {error === "google-config" ? (
        <PortalNotice>Falta el acceso de Google en el servidor. Sin eso, la web solo puede ocultar la cita aquí.</PortalNotice>
      ) : null}
      {error === "google-token" ? (
        <PortalNotice>Google no ha dejado guardar el permiso para borrar. Vuelve a conectar la cuenta del calendario.</PortalNotice>
      ) : null}
      {error === "google" ? (
        <PortalNotice>No he podido borrarla en Google. Sigue en el calendario y en el iPhone.</PortalNotice>
      ) : null}
      {error === "descarga" || loaded.error ? (
        <PortalNotice>
          No he podido leer {loaded.error ? loaded.error : "el calendario"}. Comprueba que el calendario público sigue
          activo.
        </PortalNotice>
      ) : null}

      {googleConnected ? (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ash">
            Google conectado{googleLink.email ? ` con ${googleLink.email}` : ""}. Quitar una cita la borra también en el
            iPhone.
          </p>
          <form action="/api/admin/google-calendar" method="post">
            <button className="text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink" type="submit">
              Desconectar
            </button>
          </form>
        </div>
      ) : googleConfigured ? (
        <div className="mb-8">
          <p className="text-sm text-ash">
            Conecta la cuenta del calendario para que, al quitar una cita, desaparezca también de Google y del iPhone.
          </p>
          <a className="btn-atelier mt-4 inline-block" href="/api/admin/google-calendar">
            Conectar Google Calendar
          </a>
        </div>
      ) : (
        <p className="mb-8 text-sm text-ash">
          Para borrar también en el móvil falta el acceso de Google en el servidor. Mientras tanto, quitar una cita solo
          la oculta en esta web.
        </p>
      )}

      {ready ? (
        <AgendaBoard
          events={events}
          googleConnected={googleConnected}
          today={today}
          initialYear={year}
          initialMonth={month}
          initialDay={selected}
          clients={clients.map((client) => ({
            id: client.id,
            name: fullName(client.event, client.name),
            email: client.email,
          }))}
          hiddenIds={hiddenIds}
          appointments={clients.flatMap((client) =>
            client.appointments.map((item) => ({
              id: item.id,
              clientId: client.id,
              clientName: fullName(client.event, client.name),
              title: item.title,
              date: item.date,
              time: item.time,
              place: item.place,
              notes: item.notes,
              amount: item.amount,
              status: item.status,
              externalId: item.externalId,
            })),
          )}
        />
      ) : null}
      </div>
    </PortalFrame>
  );
}

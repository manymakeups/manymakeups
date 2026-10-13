import { noticeTitle } from "@/lib/portal/notice-text";
import type { ClientRecord, StudioNotice } from "@/lib/portal/types";

function formatWhen(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StudioNotices({
  notices,
  clients,
  next,
}: {
  notices: StudioNotice[];
  clients: ClientRecord[];
  next: string;
}) {
  if (!notices.length) return null;
  const names = Object.fromEntries(
    clients.map((client) => [client.id, client.event.clientName || client.name]),
  );
  return (
    <section>
      <ul className="flex flex-col gap-6">
        {notices.map((notice) => (
          <li
            key={notice.id}
            className={`border border-ink/10 p-5 ${notice.read ? "opacity-60" : "border-gilt/40 bg-linen/50"}`}
          >
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
              {noticeTitle(notice)}
              {notice.read ? "" : " · nuevo"}
            </p>
            <p className="mt-1 font-serif text-xl">{names[notice.clientId] || "Clienta"}</p>
            <p className="mt-1 text-xs text-ash">{formatWhen(notice.createdAt)}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm">{notice.message}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a className="btn-atelier" href={`/privado/novias/${notice.clientId}`}>
                Abrir ficha
              </a>
              {!notice.read ? (
                <form action="/api/admin/notices" method="post">
                  <input type="hidden" name="id" value={notice.id} />
                  <input type="hidden" name="next" value={next} />
                  <button className="btn-atelier" type="submit">
                    Marcar como leído
                  </button>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

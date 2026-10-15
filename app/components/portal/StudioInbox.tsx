"use client";

import { noticeTitle } from "@/lib/portal/notice-text";
import type { StudioNotice } from "@/lib/portal/types";
import { useMemo, useState } from "react";

type ClientRef = { id: string; name: string; email: string };

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

function NoticeAction({
  intent,
  id,
  label,
  confirmText,
}: {
  intent: "read" | "unread" | "delete";
  id: string;
  label: string;
  confirmText?: string;
}) {
  return (
    <form
      action="/api/admin/notices"
      method="post"
      onSubmit={
        confirmText
          ? (event) => {
              if (!confirm(confirmText)) event.preventDefault();
            }
          : undefined
      }
    >
      <input type="hidden" name="next" value="/privado/avisos" />
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="id" value={id} />
      <button className="btn-atelier" type="submit">
        {label}
      </button>
    </form>
  );
}

export function StudioInbox({
  notices,
  clients,
}: {
  notices: StudioNotice[];
  clients: ClientRef[];
}) {
  const names = useMemo(
    () => Object.fromEntries(clients.map((client) => [client.id, client.name])),
    [clients],
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [replying, setReplying] = useState<string | null>(null);
  const allIds = notices.map((notice) => notice.id);
  const allSelected = allIds.length > 0 && selected.length === allIds.length;

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <form action="/api/admin/notices" method="post" className="flex flex-col items-stretch gap-2 border-b border-ink/10 pb-4 sm:flex-row sm:flex-wrap sm:items-center [&>button]:w-full sm:[&>button]:w-auto">
        <input type="hidden" name="next" value="/privado/avisos" />
        {selected.map((id) => (
          <input key={id} type="hidden" name="ids" value={id} />
        ))}
        <label className="mr-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => setSelected(allSelected ? [] : allIds)}
          />
          Todos
        </label>
        <button className="btn-atelier" type="submit" name="intent" value="read" disabled={!selected.length}>
          Leídos
        </button>
        <button className="btn-atelier" type="submit" name="intent" value="unread" disabled={!selected.length}>
          No leídos
        </button>
        <button
          className="btn-atelier"
          type="submit"
          name="intent"
          value="delete"
          disabled={!selected.length}
          onClick={(event) => {
            if (!confirm("¿Eliminar los avisos seleccionados?")) event.preventDefault();
          }}
        >
          Eliminar seleccionados
        </button>
      </form>

      <ul className="flex flex-col gap-6">
        {notices.map((notice) => {
          const tab = notice.scope === "acompanante" ? "acompanantes" : "contratante";
          return (
            <li
              key={notice.id}
              className={`border p-5 ${notice.read ? "border-ink/10" : "border-gilt/40 bg-linen/50"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <label className="flex items-start gap-3">
                  <input
                    className="mt-1"
                    type="checkbox"
                    checked={selected.includes(notice.id)}
                    onChange={() => toggle(notice.id)}
                  />
                  <span>
                    <span className="block text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
                      {noticeTitle(notice)}
                      {notice.read ? "" : " · nuevo"}
                    </span>
                    <span className="mt-1 block font-serif text-xl">
                      {names[notice.clientId] || "Clienta"}
                    </span>
                    <span className="mt-1 block text-xs text-ash">{formatWhen(notice.createdAt)}</span>
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <a className="btn-atelier" href={`/privado/novias/${notice.clientId}?tab=${tab}`}>
                    Editar ficha
                  </a>
                  <NoticeAction
                    intent={notice.read ? "unread" : "read"}
                    id={notice.id}
                    label={notice.read ? "No leído" : "Leído"}
                  />
                  <NoticeAction
                    intent="delete"
                    id={notice.id}
                    label="Eliminar"
                    confirmText="¿Eliminar este aviso?"
                  />
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm">{notice.detail || notice.message}</p>
              {notice.replies.length ? (
                <ul className="mt-4 space-y-3 border-t border-ink/10 pt-4">
                  {notice.replies.map((reply) => (
                    <li key={reply.id} className="text-sm">
                      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-ash">
                        {reply.fromClient ? "Clienta" : "Respuesta"} · {formatWhen(reply.createdAt)}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">{reply.text}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
              {replying === notice.id ? (
                <form action="/api/admin/notices" method="post" className="mt-5 flex max-w-xl flex-col gap-3">
                  <input type="hidden" name="next" value="/privado/avisos" />
                  <input type="hidden" name="intent" value="reply" />
                  <input type="hidden" name="id" value={notice.id} />
                  <label className="field-label">
                    Responder
                    <textarea className="field min-h-24" name="reply" required minLength={2} placeholder="Escribe tu respuesta" />
                  </label>
                  <button className="btn-atelier self-start" type="submit">
                    Responder
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="mt-5 text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink"
                  onClick={() => setReplying(notice.id)}
                >
                  Responder
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

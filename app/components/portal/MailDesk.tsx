"use client";

import { MAILBOXES, type MailboxKey, type MailFolder } from "@/lib/portal/mailboxes";
import { useCallback, useEffect, useState } from "react";

type MailSummary = {
  id: string;
  from: string;
  to: string;
  subject: string;
  seen: boolean;
  files: number;
  createdAt: string;
  messageId: string;
};

type MailFile = { id: string; filename: string; contentType: string; size: number };

type MailMessage = MailSummary & {
  text: string;
  html: string;
  inReplyTo: string;
  attachments: MailFile[];
};

const FOLDERS: Array<{ id: MailFolder; label: string }> = [
  { id: "inbox", label: "Entrada" },
  { id: "sent", label: "Enviados" },
  { id: "trash", label: "Eliminados" },
];

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MailDesk() {
  const [account, setAccount] = useState<MailboxKey>("info");
  const [folder, setFolder] = useState<MailFolder>("inbox");
  const [messages, setMessages] = useState<MailSummary[]>([]);
  const [selected, setSelected] = useState<MailMessage | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [compose, setCompose] = useState<{ to: string; subject: string; text: string; inReplyTo: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

  const load = useCallback(async (nextAccount = account, nextFolder = folder) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ account: nextAccount, folder: nextFolder });
      const res = await fetch(`/api/admin/mail?${params}`, { cache: "no-store" });
      const json = (await res.json()) as { messages?: MailSummary[]; error?: string };
      if (!res.ok) throw new Error(json.error || "No se ha podido abrir la bandeja.");
      setMessages(json.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se ha podido abrir la bandeja.");
    } finally {
      setLoading(false);
    }
  }, [account, folder]);

  useEffect(() => {
    let dead = false;
    void (async () => {
      try {
        const params = new URLSearchParams({ account, folder });
        const res = await fetch(`/api/admin/mail?${params}`, { cache: "no-store" });
        const json = (await res.json()) as { messages?: MailSummary[]; error?: string };
        if (dead) return;
        if (!res.ok) throw new Error(json.error || "No se ha podido abrir la bandeja.");
        setMessages(json.messages || []);
        setError("");
      } catch (err) {
        if (!dead) setError(err instanceof Error ? err.message : "No se ha podido abrir la bandeja.");
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => {
      dead = true;
    };
  }, [account, folder]);

  function chooseAccount(next: MailboxKey) {
    setLoading(true);
    setAccount(next);
    setFolder("inbox");
    setSelected(null);
    setPicked([]);
    setCompose(null);
  }

  function chooseFolder(next: MailFolder) {
    setLoading(true);
    setFolder(next);
    setSelected(null);
    setPicked([]);
    setCompose(null);
  }

  async function openMessage(id: string) {
    setError("");
    setCompose(null);
    const res = await fetch(`/api/admin/mail?account=${account}&id=${id}`, { cache: "no-store" });
    const json = (await res.json()) as { message?: MailMessage; error?: string };
    if (!res.ok || !json.message) {
      setError(json.error || "No se ha podido abrir el mensaje.");
      return;
    }
    setSelected(json.message);
    setMessages((prev) => prev.map((item) => (item.id === id ? { ...item, seen: true } : item)));
  }

  async function removePicked(ids: string[]) {
    if (!ids.length) return;
    const res = await fetch("/api/admin/mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", account, folder, ids }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error || "No se ha podido eliminar.");
      return;
    }
    setPicked([]);
    setSelected((current) => (current && ids.includes(current.id) ? null : current));
    await load();
  }

  function startReply() {
    if (!selected) return;
    const to = folder === "sent" ? selected.to : selected.from.match(/<([^>]+)>/)?.[1] || selected.from;
    setCompose({
      to,
      subject: selected.subject.startsWith("Re:") ? selected.subject : `Re: ${selected.subject}`,
      text: "",
      inReplyTo: selected.messageId,
    });
  }

  async function submitCompose() {
    if (!compose) return;
    setSending(true);
    setError("");
    try {
      const form = new FormData();
      form.set("account", account);
      form.set("to", compose.to);
      form.set("subject", compose.subject);
      form.set("text", compose.text);
      form.set("inReplyTo", compose.inReplyTo);
      files.slice(0, 8).forEach((file) => form.append("files", file));
      const res = await fetch("/api/admin/mail", { method: "POST", body: form });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "No se ha podido enviar.");
      setCompose(null);
      setFiles([]);
      setFolder("sent");
      await load(account, "sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se ha podido enviar.");
    } finally {
      setSending(false);
    }
  }

  const box = MAILBOXES.find((item) => item.key === account) ?? MAILBOXES[0];

  return (
    <div className="grid min-h-[70vh] border border-ink/10 md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-ink/10 bg-porcelain/40 p-4 md:border-b-0 md:border-r">
        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-ash">Bandejas</p>
        <div className="mt-3 grid gap-1">
          {MAILBOXES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => chooseAccount(item.key)}
              className={`px-3 py-2 text-left ${item.key === account ? "bg-ink text-porcelain" : "hover:bg-ink/5"}`}
            >
              <span className="block text-sm">{item.label}</span>
              <span className={`block text-[0.68rem] ${item.key === account ? "text-porcelain/70" : "text-ash"}`}>{item.address}</span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-[0.68rem] uppercase tracking-[0.18em] text-ash">{box.label}</p>
        <div className="mt-3 grid gap-1">
          {FOLDERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseFolder(item.id)}
              className={`px-3 py-2 text-left text-sm ${item.id === folder ? "bg-ink text-porcelain" : "hover:bg-ink/5"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      <section className="grid min-w-0 md:grid-cols-[minmax(16rem,0.85fr)_minmax(0,1.15fr)]">
        <div className="min-w-0 border-b border-ink/10 md:border-b-0 md:border-r">
          <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 px-4 py-3">
            <button
              type="button"
              className="btn-atelier-solid btn-atelier"
              onClick={() => {
                setSelected(null);
                setCompose({ to: "", subject: "", text: "", inReplyTo: "" });
              }}
            >
              Redactar
            </button>
            <button
              type="button"
              className="btn-atelier"
              disabled={!picked.length}
              onClick={() => void removePicked(picked)}
            >
              {folder === "trash" ? "Borrar" : "Eliminar"}
            </button>
          </div>
          {error ? <p className="px-4 py-3 text-sm text-ash">{error}</p> : null}
          {loading ? <p className="px-4 py-6 text-sm text-ash">Abriendo…</p> : null}
          {!loading && !messages.length ? <p className="px-4 py-6 text-sm text-ash">Esta bandeja está vacía.</p> : null}
          <ul>
            {messages.map((item) => (
              <li key={item.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center border-b border-ink/10">
                <input
                  type="checkbox"
                  className="ml-3"
                  checked={picked.includes(item.id)}
                  aria-label="Seleccionar"
                  onChange={() => setPicked((prev) => prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id])}
                />
                <button type="button" className="min-w-0 px-3 py-3 text-left" onClick={() => void openMessage(item.id)}>
                  <span className="flex items-baseline justify-between gap-3">
                    <span className={`truncate text-sm ${item.seen ? "text-ash" : "text-ink"}`}>
                      {folder === "sent" ? item.to : item.from || box.address}
                    </span>
                    <span className="shrink-0 text-[0.68rem] text-ash">{formatWhen(item.createdAt)}</span>
                  </span>
                  <span className={`mt-1 block truncate text-sm ${item.seen ? "" : "font-medium"}`}>
                    {item.subject || "(sin asunto)"}
                    {item.files > 0 ? " · adjunto" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 p-4 md:p-6">
          {compose ? (
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void submitCompose();
              }}
            >
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-ash">Desde {box.address}</p>
              <label className="field-label">
                Para
                <input className="field" value={compose.to} onChange={(event) => setCompose({ ...compose, to: event.target.value })} required />
              </label>
              <label className="field-label">
                Asunto
                <input className="field" value={compose.subject} onChange={(event) => setCompose({ ...compose, subject: event.target.value })} />
              </label>
              <label className="field-label">
                Mensaje
                <textarea className="field min-h-40" value={compose.text} onChange={(event) => setCompose({ ...compose, text: event.target.value })} />
              </label>
              <label className="text-sm text-ash">
                Adjuntar, hasta 8
                <input className="mt-2 block text-sm" type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 8))} />
              </label>
              <div className="flex gap-2">
                <button className="btn-atelier-solid btn-atelier" type="submit" disabled={sending}>{sending ? "Enviando…" : "Enviar"}</button>
                <button className="btn-atelier" type="button" onClick={() => setCompose(null)}>Cancelar</button>
              </div>
            </form>
          ) : selected ? (
            <article>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-serif text-2xl">{selected.subject || "(sin asunto)"}</h2>
                <button type="button" className="btn-atelier" onClick={startReply}>Responder</button>
              </div>
              <p className="mt-3 text-sm text-ash">
                {selected.from} → {selected.to} · {formatWhen(selected.createdAt)}
              </p>
              {selected.attachments.length ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {selected.attachments.map((file) => (
                    <a
                      key={file.id}
                      className="border border-ink/10 px-3 py-2 text-sm"
                      href={`/api/admin/mail?account=${account}&id=${selected.id}&file=${file.id}`}
                    >
                      {file.contentType.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt=""
                          className="mb-2 h-24 w-20 object-cover"
                          src={`/api/admin/mail?account=${account}&id=${selected.id}&file=${file.id}`}
                        />
                      ) : null}
                      {file.filename}
                      <span className="mt-1 block text-[0.68rem] text-ash">{formatSize(file.size)}</span>
                    </a>
                  ))}
                </div>
              ) : null}
              {selected.html ? (
                <div className="mt-6 text-sm leading-relaxed [&_img]:max-w-full" dangerouslySetInnerHTML={{ __html: selected.html }} />
              ) : (
                <pre className="mt-6 whitespace-pre-wrap font-sans text-sm leading-relaxed">{selected.text || "(sin texto)"}</pre>
              )}
              <button type="button" className="btn-atelier mt-6" onClick={() => void removePicked([selected.id])}>
                {folder === "trash" ? "Borrar del todo" : "Eliminar"}
              </button>
            </article>
          ) : (
            <p className="text-sm text-ash">Elige un mensaje de {box.label}, o redacta uno nuevo. Sale desde {box.address}.</p>
          )}
        </div>
      </section>
    </div>
  );
}

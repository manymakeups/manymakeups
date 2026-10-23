"use client";

import { BINDER_MAILBOX, MAILBOXES, type MailboxKey, type MailFolder } from "@/lib/portal/mailboxes";

type DeskKey = MailboxKey | "binder";
const ACCOUNTS = [...MAILBOXES, BINDER_MAILBOX];
import { useCallback, useEffect, useRef, useState } from "react";

type MailSummary = {
  id: string;
  account: DeskKey;
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

type Counts = Record<DeskKey, number>;

const FOLDERS: Array<{ id: MailFolder; label: string }> = [
  { id: "inbox", label: "Entrada" },
  { id: "sent", label: "Enviados" },
  { id: "archive", label: "Archivo" },
  { id: "trash", label: "Papelera" },
];

type View =
  | { id: "global-inbox" }
  | { id: "all-inbox"; account: DeskKey }
  | { id: "all-sent" }
  | { id: "all-trash" }
  | { id: "box"; account: DeskKey; folder: MailFolder };

function describe(next: View): { account: DeskKey | "all"; folder: MailFolder } {
  if (next.id === "global-inbox") return { account: "all", folder: "inbox" };
  if (next.id === "all-sent") return { account: "all", folder: "sent" };
  if (next.id === "all-trash") return { account: "all", folder: "trash" };
  if (next.id === "all-inbox") return { account: next.account, folder: "inbox" };
  return { account: next.account, folder: next.folder };
}

function viewMark(next: View) {
  if (next.id === "global-inbox") return "global-inbox";
  if (next.id === "all-sent") return "all-sent";
  if (next.id === "all-trash") return "all-trash";
  if (next.id === "all-inbox") return `all-inbox:${next.account}`;
  return `box:${next.account}:${next.folder}`;
}

function accountLabel(key: string) {
  return ACCOUNTS.find((item) => item.key === key)?.label || key;
}

const MAX_FILES = 8;
const MAX_BYTES = 20_000_000;
const DIRECT_LIMIT = 3_200_000;

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "2-digit" });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function addresses(value: string) {
  return Array.from(value.matchAll(/[^\s<>,;"]+@[^\s<>,;"]+/g)).map((match) => match[0]);
}

function displayName(value: string) {
  const name = value.replace(/<[^>]*>/g, "").replace(/"/g, "").trim();
  return name || value || "(sin remitente)";
}

function Icon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "compose") {
    return <svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
  }
  if (name === "select") {
    return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="m8 12.5 2.5 2.5L16 9" /></svg>;
  }
  if (name === "trash") {
    return <svg {...common}><path d="M4 7h16" /><path d="M9 7V5h6v2" /><path d="M7 7l1 13h8l1-13" /></svg>;
  }
  if (name === "archive") {
    return <svg {...common}><path d="M3 6h18v4H3z" /><path d="M5 10v8h14v-8" /><path d="M10 14h4" /></svg>;
  }
  if (name === "reply") {
    return <svg {...common}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 6 6v1" /></svg>;
  }
  if (name === "reply-all") {
    return <svg {...common}><path d="M7 14 3 10l4-4" /><path d="M11 14 7 10l4-4" /><path d="M7 10h8a5 5 0 0 1 5 5v1" /></svg>;
  }
  if (name === "forward") {
    return <svg {...common}><path d="m15 14 5-5-5-5" /><path d="M20 9H10a6 6 0 0 0-6 6v1" /></svg>;
  }
  if (name === "unread") {
    return <svg {...common}><path d="M3 7h18v11H3z" /><path d="m3 8 9 6 9-6" /></svg>;
  }
  if (name === "read") {
    return <svg {...common}><path d="M3 10h18v8H3z" /><path d="m3 10 9 6 9-6" /><path d="M7 7h10" /></svg>;
  }
  if (name === "send") {
    return <svg {...common}><path d="m4 12 16-8-6 16-2.5-6.5Z" /><path d="m11.5 13.5 8.5-9.5" /></svg>;
  }
  if (name === "close") {
    return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>;
  }
  if (name === "clip") {
    return <svg {...common}><path d="m15 7-6.5 6.5a3 3 0 0 0 4.2 4.2L19 11.5" /><path d="m8.5 13.5-2 2a3.5 3.5 0 0 0 5 5L17 15" /></svg>;
  }
  if (name === "inbox") {
    return <svg {...common}><path d="M3 12h5l2 3h4l2-3h5" /><path d="M5 6h14l2 6v7H3v-7Z" /></svg>;
  }
  if (name === "sent") {
    return <svg {...common}><path d="m4 12 16-8-6 16-2.5-6.5Z" /></svg>;
  }
  return <svg {...common}><path d="M15 18H5V6h10" /><path d="m12 9 4 3-4 3" /></svg>;
}

function Tool({ label, onClick, disabled, active, children }: { label: string; onClick?: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-full disabled:opacity-30 ${active ? "bg-ink text-porcelain" : "text-ink hover:bg-ink/5"}`}
    >
      {children}
    </button>
  );
}

export function MailDesk() {
  const [view, setView] = useState<View>({ id: "global-inbox" });
  const [messages, setMessages] = useState<MailSummary[]>([]);
  const [selected, setSelected] = useState<MailMessage | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [counts, setCounts] = useState<Counts>({ info: 0, accounting: 0, formaciones: 0, comercial: 0, management: 0, binder: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [compose, setCompose] = useState<{ from: DeskKey; to: string; subject: string; text: string; inReplyTo: string; forwardId: string; forwardFiles: MailFile[] } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [phase, setPhase] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const place = describe(view);
  const placeRef = useRef(place);

  useEffect(() => {
    placeRef.current = { account: place.account, folder: place.folder };
  }, [place.account, place.folder]);

  const load = useCallback(async (next = place) => {
    setError("");
    try {
      const params = new URLSearchParams({ account: next.account, folder: next.folder });
      const res = await fetch(`/api/admin/mail?${params}`, { cache: "no-store" });
      const json = (await res.json()) as { messages?: MailSummary[]; error?: string };
      if (!res.ok) throw new Error(json.error || "No se ha podido abrir la bandeja.");
      setMessages(json.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se ha podido abrir la bandeja.");
    } finally {
      setLoading(false);
    }
  }, [place]);

  useEffect(() => {
    let dead = false;
    void (async () => {
      try {
        const params = new URLSearchParams({ account: place.account, folder: place.folder });
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
  }, [place.account, place.folder]);

  useEffect(() => {
    let dead = false;
    const seen = { ids: null as Set<string> | null };
    async function poll() {
      try {
        const res = await fetch("/api/admin/mail?unseen=1", { cache: "no-store" });
        const json = (await res.json()) as { counts?: Counts; items?: Array<{ id: string; account: DeskKey }> };
        if (dead || !res.ok || !json.counts) return;
        setCounts(json.counts);
        const ids = new Set((json.items || []).map((item) => item.id));
        const here = placeRef.current;
        const arrived = (json.items || []).some((item) => !seen.ids?.has(item.id) && (here.account === "all" || item.account === here.account));
        if (seen.ids && here.folder === "inbox" && arrived) {
          const params = new URLSearchParams({ account: here.account, folder: "inbox" });
          const list = await fetch(`/api/admin/mail?${params}`, { cache: "no-store" });
          const body = (await list.json()) as { messages?: MailSummary[] };
          if (!dead && list.ok) setMessages(body.messages || []);
        }
        seen.ids = ids;
      } catch {
        /* the next pass retries */
      }
    }
    void poll();
    const timer = window.setInterval(() => void poll(), 20000);
    return () => {
      dead = true;
      window.clearInterval(timer);
    };
  }, []);

  function openView(next: View) {
    if (viewMark(next) === viewMark(view)) return;
    if (`${place.account}:${place.folder}` !== `${describe(next).account}:${describe(next).folder}`) setLoading(true);
    setView(next);
    setSelected(null);
    setPicked([]);
    setCompose(null);
    setSelecting(false);
  }

  async function openMessage(id: string) {
    setError("");
    setCompose(null);
    const row = messages.find((item) => item.id === id);
    const owner: DeskKey = row?.account || (place.account === "all" ? "info" : place.account);
    const wasUnseen = Boolean(row && !row.seen);
    const res = await fetch(`/api/admin/mail?account=${owner}&id=${id}`, { cache: "no-store" });
    const json = (await res.json()) as { message?: MailMessage; error?: string };
    if (!res.ok || !json.message) {
      setError(json.error || "No se ha podido abrir el mensaje.");
      return;
    }
    setSelected(json.message);
    setMessages((prev) => prev.map((item) => (item.id === id ? { ...item, seen: true } : item)));
    if (wasUnseen && place.folder === "inbox") {
      setCounts((prev) => ({ ...prev, [owner]: Math.max(0, (prev[owner] || 0) - 1) }));
      window.dispatchEvent(new Event("mm-mail"));
    }
  }

  async function post(action: "delete" | "seen" | "move", ids: string[], extra?: { seen?: boolean; destination?: MailFolder }) {
    if (!ids.length) return;
    const rows = messages.filter((item) => ids.includes(item.id));
    const groups = new Map<DeskKey, string[]>();
    for (const row of rows) {
      groups.set(row.account, [...(groups.get(row.account) || []), row.id]);
    }
    if (!groups.size && place.account !== "all") groups.set(place.account, ids);
    const results = await Promise.all([...groups].map(async ([key, groupIds]) => {
      const res = await fetch("/api/admin/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, account: key, folder: place.folder, ids: groupIds, ...extra }),
      });
      const json = (await res.json()) as { error?: string };
      return { ok: res.ok, error: json.error };
    }));
    const failed = results.find((item) => !item.ok);
    if (failed) {
      setError(failed.error || "No se ha podido completar.");
      return;
    }
    window.dispatchEvent(new Event("mm-mail"));
    if (action === "seen") {
      const seen = Boolean(extra?.seen);
      if (place.folder === "inbox") {
        setCounts((prev) => {
          const next = { ...prev };
          for (const [key, groupIds] of groups) {
            const delta = seen
              ? -messages.filter((item) => groupIds.includes(item.id) && !item.seen).length
              : messages.filter((item) => groupIds.includes(item.id) && item.seen).length;
            next[key] = Math.max(0, (next[key] || 0) + delta);
          }
          return next;
        });
      }
      setMessages((prev) => prev.map((item) => (ids.includes(item.id) ? { ...item, seen } : item)));
      setSelected((current) => (current && ids.includes(current.id) ? { ...current, seen } : current));
      return;
    }
    setPicked([]);
    setSelected((current) => (current && ids.includes(current.id) ? null : current));
    await load();
  }

  function quoteForward(message: MailMessage) {
    return `\n\n---------- Mensaje reenviado ----------\nDe: ${message.from}\nPara: ${message.to}\nAsunto: ${message.subject}\n\n${message.text}`;
  }

  function sendingAccount() {
    if (selected?.account) return selected.account;
    if (view.id === "all-inbox" || view.id === "box") return view.account;
    return "info" as DeskKey;
  }

  function startCompose(kind: "new" | "reply" | "reply-all" | "forward") {
    const from = sendingAccount();
    const box = ACCOUNTS.find((item) => item.key === from) ?? MAILBOXES[0];
    if (kind === "new" || !selected) {
      setSelected(null);
      setCompose({ from, to: "", subject: "", text: "", inReplyTo: "", forwardId: "", forwardFiles: [] });
      return;
    }
    if (kind === "forward") {
      setCompose({
        from: selected.account,
        to: "",
        subject: selected.subject.startsWith("Fwd:") ? selected.subject : `Fwd: ${selected.subject}`,
        text: quoteForward(selected),
        inReplyTo: "",
        forwardId: selected.id,
        forwardFiles: selected.attachments,
      });
      return;
    }
    const own = box.address.toLowerCase();
    const replyTo = place.folder === "sent"
      ? selected.to
      : addresses(selected.from)[0] || selected.from;
    const everyone = [...new Set([...addresses(selected.from), ...addresses(selected.to)].map((item) => item.toLowerCase()))].filter((item) => item !== own);
    setCompose({
      from: selected.account,
      to: kind === "reply-all" && everyone.length ? everyone.join(", ") : replyTo,
      subject: selected.subject.startsWith("Re:") ? selected.subject : `Re: ${selected.subject}`,
      text: "",
      inReplyTo: selected.messageId,
      forwardId: "",
      forwardFiles: [],
    });
  }

  async function submitCompose() {
    if (!compose || sending) return;
    const chosen = files.slice(0, MAX_FILES);
    const weight = chosen.reduce((sum, file) => sum + file.size, 0) + compose.forwardFiles.reduce((sum, file) => sum + file.size, 0);
    const binder = compose.from === "binder";
    if (files.length + compose.forwardFiles.length > MAX_FILES || weight > (binder ? 3_500_000 : MAX_BYTES)) {
      setError(binder ? "My K-pop Binder admite hasta 8 archivos y 3 MB." : "Cada envío admite hasta 8 archivos y 20 MB.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const heavy = !binder && (weight > DIRECT_LIMIT || chosen.some((file) => file.size > DIRECT_LIMIT));
      setPhase(heavy && chosen.length ? "Subiendo archivos…" : "Enviando…");
      let res: Response;
      if (heavy) {
        const { upload } = await import("@vercel/blob/client");
        const sent: Array<{ pathname: string; filename: string; contentType: string }> = [];
        for (const file of chosen) {
          const name = file.name.replace(/[\\/]/g, "").slice(0, 100) || "archivo";
          const blob = await upload(`mail/outbox/${crypto.randomUUID()}/${name}`, file, {
            access: "private",
            handleUploadUrl: "/api/admin/mail/upload",
            contentType: file.type || "application/octet-stream",
            multipart: file.size > 4_000_000,
          });
          sent.push({ pathname: blob.pathname, filename: file.name, contentType: file.type || blob.contentType || "application/octet-stream" });
        }
        setPhase("Enviando…");
        res = await fetch("/api/admin/mail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send",
            account: compose.from,
            to: compose.to,
            subject: compose.subject,
            text: compose.text,
            inReplyTo: compose.inReplyTo,
            forwardId: compose.forwardId,
            files: sent,
          }),
        });
      } else {
        const form = new FormData();
        form.set("account", compose.from);
        form.set("to", compose.to);
        form.set("subject", compose.subject);
        form.set("text", compose.text);
        form.set("inReplyTo", compose.inReplyTo);
        form.set("forwardId", compose.forwardId);
        chosen.forEach((file) => form.append("files", file));
        res = await fetch("/api/admin/mail", { method: "POST", body: form });
      }
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "No se ha podido enviar.");
      setCompose(null);
      setFiles([]);
      setSelected(null);
      const next: View = view.id === "box"
        ? { id: "box", account: compose.from, folder: "sent" }
        : { id: "all-sent" };
      if (`${place.account}:${place.folder}` === `${describe(next).account}:${describe(next).folder}`) await load(describe(next));
      else {
        setLoading(true);
        setView(next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se ha podido enviar.");
    } finally {
      setSending(false);
      setPhase("");
    }
  }

  function togglePick(id: string) {
    setPicked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  const fromKey = compose?.from || sendingAccount();
  const box = ACCOUNTS.find((item) => item.key === fromKey) ?? MAILBOXES[0];
  const reading = Boolean(selected || compose);
  const mixed = place.account === "all";
  const totalUnread = ACCOUNTS.reduce((sum, item) => sum + (counts[item.key] || 0), 0);
  const markAsRead = messages.some((item) => picked.includes(item.id) && !item.seen);
  const allPicked = messages.length > 0 && messages.every((item) => picked.includes(item.id));

  return (
    <div className="grid min-h-0 flex-1 overflow-hidden rounded-sm border border-ink/10 bg-porcelain md:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className={`${reading ? "hidden" : "flex"} min-h-0 flex-col overflow-y-auto border-ink/10 bg-porcelain md:flex md:border-r`}>
        <div className="flex items-center gap-1 px-3 py-3">
          <Tool label="Mensaje nuevo" onClick={() => startCompose("new")}>
            <Icon name="compose" />
          </Tool>
        </div>
        <div className="grid gap-2 px-2 pb-4">
          <section>
            <p className="flex items-center justify-between gap-2 px-2 py-1">
              <span className="truncate text-[0.72rem] uppercase tracking-[0.16em] text-ash">Todas</span>
              {totalUnread ? <span className="font-bold tabular-nums text-sm text-ink">{totalUnread}</span> : null}
            </p>
            <div className="mt-1 grid">
              <button
                type="button"
                onClick={() => openView({ id: "global-inbox" })}
                className={`flex items-center gap-2 rounded-lg px-2 py-1 text-left text-sm ${view.id === "global-inbox" ? "bg-ink/10" : "hover:bg-ink/5"}`}
              >
                <span className="text-ash"><Icon name="inbox" /></span>
                <span className={`min-w-0 flex-1 truncate ${totalUnread ? "font-semibold" : ""}`}>Entrada</span>
                {totalUnread ? <span className="font-bold tabular-nums">{totalUnread}</span> : null}
              </button>
              {ACCOUNTS.map((item) => {
                const active = view.id === "all-inbox" && view.account === item.key;
                const count = counts[item.key] || 0;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => openView({ id: "all-inbox", account: item.key })}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1 text-left text-sm ${active ? "bg-ink/10" : "hover:bg-ink/5"}`}
                  >
                    <span className="text-ash"><Icon name="inbox" /></span>
                    <span className={`min-w-0 flex-1 truncate ${count ? "font-semibold" : ""}`}>{item.label}</span>
                    {count ? <span className="font-bold tabular-nums">{count}</span> : null}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => openView({ id: "all-sent" })}
                className={`flex items-center gap-2 rounded-lg px-2 py-1 text-left text-sm ${view.id === "all-sent" ? "bg-ink/10" : "hover:bg-ink/5"}`}
              >
                <span className="text-ash"><Icon name="sent" /></span>
                <span className="min-w-0 flex-1 truncate">Enviados</span>
              </button>
              <button
                type="button"
                onClick={() => openView({ id: "all-trash" })}
                className={`flex items-center gap-2 rounded-lg px-2 py-1 text-left text-sm ${view.id === "all-trash" ? "bg-ink/10" : "hover:bg-ink/5"}`}
              >
                <span className="text-ash"><Icon name="trash" /></span>
                <span className="min-w-0 flex-1 truncate">Papelera</span>
              </button>
            </div>
          </section>
          {ACCOUNTS.map((item) => (
            <section key={item.key}>
              <button
                type="button"
                onClick={() => openView({ id: "box", account: item.key, folder: "inbox" })}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1 text-left"
              >
                <span className="truncate text-[0.72rem] uppercase tracking-[0.16em] text-ash">{item.label}</span>
                {counts[item.key] ? <span className="font-bold tabular-nums text-sm text-ink">{counts[item.key]}</span> : null}
              </button>
              <div className="mt-1 grid">
                {FOLDERS.map((entry) => {
                  const active = view.id === "box" && view.account === item.key && view.folder === entry.id;
                  const count = entry.id === "inbox" ? counts[item.key] : 0;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => openView({ id: "box", account: item.key, folder: entry.id })}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1 text-left text-sm ${active ? "bg-ink/10" : "hover:bg-ink/5"}`}
                    >
                      <span className="text-ash"><Icon name={entry.id === "sent" ? "sent" : entry.id === "trash" ? "trash" : entry.id === "archive" ? "archive" : "inbox"} /></span>
                      <span className={`min-w-0 flex-1 truncate ${count ? "font-semibold" : ""}`}>{entry.label}</span>
                      {count ? <span className="font-bold tabular-nums">{count}</span> : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </aside>

      <section className="grid min-h-0 min-w-0 md:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
        <div className={`${reading ? "hidden" : "flex"} min-h-0 min-w-0 flex-col border-ink/10 bg-porcelain md:flex md:border-r`}>
          <div className="flex items-center gap-1 border-b border-ink/10 px-2 py-2">
            <Tool
              label={selecting ? "Dejar de seleccionar" : "Seleccionar"}
              active={selecting}
              onClick={() => {
                setSelecting((value) => !value);
                setPicked([]);
              }}
            >
              <Icon name="select" />
            </Tool>
            {selecting ? (
              <input
                type="checkbox"
                className="ml-1 size-4"
                checked={allPicked}
                aria-label="Seleccionar todos"
                onChange={() => setPicked(allPicked ? [] : messages.map((item) => item.id))}
              />
            ) : null}
            <Tool label={place.folder === "archive" ? "Mover a entrada" : "Archivar"} disabled={!picked.length} onClick={() => void post("move", picked, { destination: place.folder === "archive" ? "inbox" : "archive" })}>
              <Icon name={place.folder === "archive" ? "inbox" : "archive"} />
            </Tool>
            <Tool label={place.folder === "trash" ? "Borrar" : "Papelera"} disabled={!picked.length} onClick={() => void post("delete", picked)}>
              <Icon name="trash" />
            </Tool>
            <Tool
              label={markAsRead ? "Marcar como leído" : "Marcar como no leído"}
              disabled={!picked.length}
              onClick={() => void post("seen", picked, { seen: markAsRead })}
            >
              <Icon name={markAsRead ? "read" : "unread"} />
            </Tool>
          </div>
          {error ? <p className="px-4 py-2 text-sm text-ash">{error}</p> : null}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading && !messages.length ? <p className="px-4 py-6 text-sm text-ash">Abriendo…</p> : null}
            {!loading && !messages.length ? <p className="px-4 py-6 text-sm text-ash">Esta bandeja está vacía.</p> : null}
            <ul>
              {messages.map((item) => {
                const active = selected?.id === item.id;
                return (
                  <li key={item.id} className={`border-b border-ink/5 ${active ? "bg-ink/[0.04]" : ""}`}>
                    <div className="flex items-start gap-2 px-3 py-2.5">
                      {selecting ? (
                        <input
                          type="checkbox"
                          className="mt-1 size-4 shrink-0"
                          checked={picked.includes(item.id)}
                          aria-label="Seleccionar"
                          onChange={() => togglePick(item.id)}
                        />
                      ) : (
                        <span className={`mt-2 size-2 shrink-0 rounded-full ${item.seen ? "bg-transparent" : "bg-ink"}`} />
                      )}
                      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => void openMessage(item.id)}>
                        <span className="flex items-baseline justify-between gap-3">
                          <span className={`truncate text-sm ${item.seen ? "text-ash" : "font-semibold text-ink"}`}>
                            {place.folder === "sent" ? displayName(item.to) : displayName(item.from)}
                          </span>
                          <span className="shrink-0 text-[0.68rem] text-ash">{formatWhen(item.createdAt)}</span>
                        </span>
                        <span className={`mt-0.5 flex items-center gap-1 truncate text-sm ${item.seen ? "text-ink/80" : "font-semibold"}`}>
                          {item.files > 0 ? <span className="text-ash"><Icon name="clip" /></span> : null}
                          <span className="truncate">{item.subject || "(sin asunto)"}</span>
                        </span>
                        {mixed ? <span className="mt-0.5 block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink">{accountLabel(item.account)}</span> : null}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className={`${reading ? "flex" : "hidden"} min-h-0 min-w-0 flex-col bg-porcelain md:flex`}>
          {compose ? (
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={(event) => {
                event.preventDefault();
                void submitCompose();
              }}
            >
              <div className="flex items-center gap-1 border-b border-ink/10 px-2 py-2">
                <Tool label="Cerrar" onClick={() => { setCompose(null); setFiles([]); }}>
                  <Icon name="close" />
                </Tool>
                <Tool label="Adjuntar" onClick={() => fileRef.current?.click()}>
                  <Icon name="clip" />
                </Tool>
                <span className="ml-auto text-[0.68rem] text-ash">{phase}</span>
                <button type="submit" aria-label="Enviar" title="Enviar" disabled={sending} className="grid size-8 place-items-center rounded-full text-ink hover:bg-ink/5 disabled:opacity-30">
                  <Icon name="send" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto bg-porcelain px-4 py-4 md:px-6">
                <div className="flex flex-wrap gap-1">
                  {ACCOUNTS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setCompose({ ...compose, from: item.key })}
                      className={`rounded-full px-2 py-1 text-[0.68rem] uppercase tracking-[0.14em] ${compose.from === item.key ? "bg-ink text-porcelain" : "text-ash hover:bg-ink/5"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-ink">{box.fromName}</p>
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-ash">{box.address}</p>
                <label className="field-label mt-4">
                  Para
                  <input className="field" value={compose.to} onChange={(event) => setCompose({ ...compose, to: event.target.value })} required />
                </label>
                <label className="field-label mt-3">
                  Asunto
                  <input className="field" value={compose.subject} onChange={(event) => setCompose({ ...compose, subject: event.target.value })} />
                </label>
                <textarea
                  className="field mt-4 min-h-48"
                  aria-label="Mensaje"
                  value={compose.text}
                  onChange={(event) => setCompose({ ...compose, text: event.target.value })}
                />
                <input
                  ref={fileRef}
                  className="hidden"
                  type="file"
                  multiple
                  onChange={(event) => {
                    const next = Array.from(event.target.files || []);
                    setFiles((prev) => [...prev, ...next].slice(0, MAX_FILES));
                    event.target.value = "";
                  }}
                />
                {compose.forwardFiles.length ? (
                  <ul className="mt-3 grid gap-1">
                    {compose.forwardFiles.map((file) => (
                      <li key={file.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate">{file.filename}</span>
                        <span className="shrink-0 text-[0.68rem] text-ash">{formatSize(file.size)}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {files.length ? (
                  <ul className="mt-3 grid gap-1">
                    {files.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate">{file.name}</span>
                        <span className="shrink-0 text-[0.68rem] text-ash">{formatSize(file.size)}</span>
                        <button type="button" aria-label="Quitar adjunto" className="text-ash" onClick={() => setFiles((prev) => prev.filter((_, item) => item !== index))}>
                          <Icon name="close" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-2 text-[0.68rem] text-ash">{box.key === "binder" ? "Sale como STAFF M.K.B. Hasta 8 archivos y 3 MB." : "Hasta 8 archivos y 20 MB. Quien lo reciba verá este fondo y esta firma."}</p>
                {box.signature ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={box.signature} alt="Firma" className="mt-4 w-[193px] max-w-full" />
                ) : null}
              </div>
            </form>
          ) : selected ? (
            <article className="flex min-h-0 flex-1 flex-col">
              <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 px-2 py-2">
                <span className="md:hidden">
                  <Tool label="Volver" onClick={() => setSelected(null)}>
                    <Icon name="back" />
                  </Tool>
                </span>
                <Tool label="Responder" onClick={() => startCompose("reply")}><Icon name="reply" /></Tool>
                <Tool label="Responder a todos" onClick={() => startCompose("reply-all")}><Icon name="reply-all" /></Tool>
                <Tool label="Reenviar" onClick={() => startCompose("forward")}><Icon name="forward" /></Tool>
                <Tool
                  label={place.folder === "archive" ? "Mover a entrada" : "Archivar"}
                  onClick={() => void post("move", [selected.id], { destination: place.folder === "archive" ? "inbox" : "archive" })}
                >
                  <Icon name={place.folder === "archive" ? "inbox" : "archive"} />
                </Tool>
                <Tool label={place.folder === "trash" ? "Borrar" : "Papelera"} onClick={() => void post("delete", [selected.id])}>
                  <Icon name="trash" />
                </Tool>
                <Tool
                  label={selected.seen ? "Marcar como no leído" : "Marcar como leído"}
                  onClick={() => void post("seen", [selected.id], { seen: !selected.seen })}
                >
                  <Icon name={selected.seen ? "unread" : "read"} />
                </Tool>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-8">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink">{accountLabel(selected.account)}</p>
                <h2 className="mt-2 font-serif text-2xl leading-tight md:text-3xl">{selected.subject || "(sin asunto)"}</h2>
                <p className="mt-4 text-sm font-semibold">{displayName(place.folder === "sent" ? selected.to : selected.from)}</p>
                <p className="text-sm text-ash">{place.folder === "sent" ? selected.to : selected.from}</p>
                <p className="mt-1 text-[0.72rem] text-ash">Para {selected.to} · {formatWhen(selected.createdAt)}</p>
                {selected.html ? (
                  <div className="mt-6 text-sm leading-relaxed [&_img]:max-w-full [&_table]:max-w-full" dangerouslySetInnerHTML={{ __html: selected.html }} />
                ) : (
                  <pre className="mt-6 whitespace-pre-wrap font-sans text-sm leading-relaxed">{selected.text || "(sin texto)"}</pre>
                )}
                {selected.attachments.length ? (
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-ink/10 pt-4">
                    {selected.attachments.map((file) => (
                      <a
                        key={file.id}
                        className="block w-36 border border-ink/10 px-3 py-2 text-sm"
                        href={`/api/admin/mail?account=${selected.account}&id=${selected.id}&file=${file.id}`}
                      >
                        {file.contentType.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt="" className="mb-2 h-20 w-full object-cover" src={`/api/admin/mail?account=${selected.account}&id=${selected.id}&file=${file.id}`} />
                        ) : null}
                        <span className="block truncate">{file.filename}</span>
                        <span className="mt-1 block text-[0.68rem] text-ash">{formatSize(file.size)}</span>
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ) : (
            <div className="hidden flex-1 items-center justify-center px-6 text-sm text-ash md:flex">
              {box.address}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

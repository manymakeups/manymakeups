import type { MailFolder } from "./mailboxes";

const ORIGIN = "https://www.mykpopbinder.com";

type BinderSummary = {
  id: string;
  account: "binder";
  folder: MailFolder;
  from: string;
  to: string;
  subject: string;
  seen: boolean;
  files: number;
  createdAt: string;
  messageId: string;
};

function secret() {
  const value = (process.env.MAIL_BRIDGE_SECRET || "").trim();
  if (!value) throw new Error("MISSING_BRIDGE");
  return value;
}

async function bridge(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${secret()}`);
  const res = await fetch(`${ORIGIN}/api/mail/bridge${path}`, { ...init, headers, cache: "no-store" });
  return res;
}

function failure(status: number, error: string): never {
  const code = status === 401 ? "BRIDGE_DENIED" : status === 503 && /not configured/i.test(error) ? "MISSING_BRIDGE" : error || "BRIDGE_FAILED";
  const err = new Error(code);
  err.name = "BinderMail";
  throw err;
}

export function binderMailError(err: unknown) {
  const message = err instanceof Error ? err.message : "";
  if (message === "MISSING_BRIDGE") return { status: 503, error: "Falta la clave de My K-pop Binder en el servidor." };
  if (message === "BRIDGE_DENIED") return { status: 502, error: "My K-pop Binder no ha aceptado la conexión." };
  if (message === "BRIDGE_FAILED") return { status: 502, error: "No se ha podido abrir My K-pop Binder." };
  return { status: 502, error: message.slice(0, 180) || "No se ha podido abrir My K-pop Binder." };
}

export async function listBinder(folder: MailFolder): Promise<BinderSummary[]> {
  const res = await bridge(`?folder=${folder}`);
  const json = (await res.json()) as { messages?: BinderSummary[]; error?: string };
  if (!res.ok) failure(res.status, json.error || "");
  return json.messages || [];
}

export async function readBinder(id: string) {
  const res = await bridge(`?id=${encodeURIComponent(id)}`);
  const json = (await res.json()) as { message?: BinderSummary & { text: string; html: string; inReplyTo: string; attachments: Array<{ id: string; filename: string; contentType: string; size: number }> }; error?: string };
  if (!res.ok || !json.message) failure(res.status, json.error || "");
  return json.message;
}

export async function readBinderFile(fileId: string) {
  const res = await bridge(`?file=${encodeURIComponent(fileId)}`);
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    failure(res.status, json.error || "");
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get("content-type") || "application/octet-stream";
  const match = /filename\*=UTF-8''([^;]+)/i.exec(res.headers.get("content-disposition") || "");
  const filename = match ? decodeURIComponent(match[1]) : "adjunto";
  return { bytes, contentType: type, filename };
}

export async function binderUnseen() {
  const res = await bridge("?unseen=1");
  const json = (await res.json()) as { unseen?: number; items?: Array<{ id: string; from: string; subject: string }>; error?: string };
  if (!res.ok) failure(res.status, json.error || "");
  return {
    count: json.unseen || 0,
    items: (json.items || []).map((item) => ({ id: item.id, account: "binder" as const, from: item.from, subject: item.subject })),
  };
}

export async function binderAct(body: Record<string, unknown>) {
  const res = await bridge("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { error?: string };
  if (!res.ok) failure(res.status, json.error || "");
}

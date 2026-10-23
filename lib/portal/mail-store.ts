import { timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, list, put } from "@vercel/blob";
import { simpleParser, type AddressObject } from "mailparser";
import { newId } from "./crypto";
import { mailboxByKey, mailboxFromRecipients, type MailFolder, type MailboxKey } from "./mailboxes";

const ROOT = path.join(process.cwd(), "data");
const MAX_STORED_FILES = 12;
const MAX_STORED_BYTES = 16_000_000;
const MAX_OUT_FILES = 8;
const MAX_OUT_BYTES = 3_500_000;

export type MailFile = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
};

export type MailSummary = {
  id: string;
  account: MailboxKey;
  folder: MailFolder;
  from: string;
  to: string;
  subject: string;
  seen: boolean;
  files: number;
  createdAt: string;
  messageId: string;
};

export type MailRecord = MailSummary & {
  text: string;
  html: string;
  inReplyTo: string;
  attachments: MailFile[];
};

function storesInBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function localPath(key: string) {
  return path.join(ROOT, key);
}

async function readJson<T>(key: string): Promise<T | null> {
  if (storesInBlob()) {
    const result = await get(key, { access: "private", useCache: false });
    if (!result) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as T;
  }
  try {
    return JSON.parse(await readFile(localPath(key), "utf8")) as T;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown) {
  const body = JSON.stringify(value);
  if (storesInBlob()) {
    await put(key, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  const file = localPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body, "utf8");
}

async function readBytes(key: string) {
  if (storesInBlob()) {
    const result = await get(key, { access: "private", useCache: false });
    if (!result) return null;
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  }
  try {
    return await readFile(localPath(key));
  } catch {
    return null;
  }
}

async function writeBytes(key: string, bytes: Buffer, contentType: string) {
  if (storesInBlob()) {
    await put(key, bytes, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
    });
    return;
  }
  const file = localPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, bytes);
}

async function removeKey(key: string) {
  if (storesInBlob()) {
    try {
      await del(key);
    } catch {
      /* already gone */
    }
    return;
  }
  await rm(localPath(key), { force: true });
}

async function removePrefix(prefix: string) {
  if (storesInBlob()) {
    const found = await list({ prefix, limit: 1000 });
    await Promise.all(found.blobs.map((blob) => del(blob.pathname).catch(() => undefined)));
    return;
  }
  await rm(localPath(prefix), { recursive: true, force: true });
}

function listKey(account: MailboxKey, folder: MailFolder) {
  return `mail/lists/${account}/${folder}.json`;
}

function bodyKey(id: string) {
  return `mail/bodies/${id}.json`;
}

function fileKey(messageId: string, fileId: string) {
  return `mail/files/${messageId}/${fileId}`;
}

async function readList(account: MailboxKey, folder: MailFolder) {
  return (await readJson<MailSummary[]>(listKey(account, folder))) ?? [];
}

async function writeList(account: MailboxKey, folder: MailFolder, rows: MailSummary[]) {
  await writeJson(listKey(account, folder), rows);
}

function summaryOf(record: MailRecord): MailSummary {
  return {
    id: record.id,
    account: record.account,
    folder: record.folder,
    from: record.from,
    to: record.to,
    subject: record.subject,
    seen: record.seen,
    files: record.attachments.length,
    createdAt: record.createdAt,
    messageId: record.messageId,
  };
}

function addressText(value: AddressObject | AddressObject[] | undefined) {
  if (!value) return "";
  if (Array.isArray(value)) return value.map((item) => item.text || "").filter(Boolean).join(", ");
  return value.text || "";
}

function safeName(name: string, contentType: string, index: number) {
  const clean = name.replace(/[/\\?%*:|"<>]/g, "").trim().slice(0, 120);
  if (clean) return clean;
  const ext = contentType === "application/pdf" ? "pdf" : contentType.split("/")[1]?.slice(0, 8) || "bin";
  return `adjunto-${index + 1}.${ext}`;
}

function sanitizeMailHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|base|svg)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|base|svg)\b[^>]*\/?>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .slice(0, 500_000);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function inboundAuthorized(header: string | null, secret: string) {
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const left = Buffer.from(token);
  const right = Buffer.from(secret);
  if (!left.length || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function listMailbox(account: MailboxKey, folder: MailFolder) {
  const rows = await readList(account, folder);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 200);
}

export async function readMessage(id: string) {
  const record = await readJson<MailRecord>(bodyKey(id));
  if (!record) return null;
  if (!record.seen && record.folder === "inbox") {
    record.seen = true;
    await writeJson(bodyKey(id), record);
    const rows = await readList(record.account, record.folder);
    await writeList(
      record.account,
      record.folder,
      rows.map((row) => (row.id === id ? { ...row, seen: true } : row)),
    );
  }
  return record;
}

export async function readAttachment(messageId: string, fileId: string) {
  const record = await readJson<MailRecord>(bodyKey(messageId));
  const file = record?.attachments.find((item) => item.id === fileId);
  if (!record || !file) return null;
  const bytes = await readBytes(fileKey(messageId, fileId));
  if (!bytes) return null;
  return { file, bytes };
}

export async function deleteMessages(account: MailboxKey, folder: MailFolder, ids: string[]) {
  const chosen = new Set(ids.slice(0, 40));
  const rows = await readList(account, folder);
  const victims = rows.filter((row) => chosen.has(row.id));
  if (folder === "trash") {
    await writeList(account, folder, rows.filter((row) => !chosen.has(row.id)));
    await Promise.all(victims.map(async (row) => {
      const record = await readJson<MailRecord>(bodyKey(row.id));
      await Promise.all((record?.attachments ?? []).map((file) => removeKey(fileKey(row.id, file.id))));
      await removeKey(bodyKey(row.id));
    }));
    return;
  }
  const trash = await readList(account, "trash");
  const moved = victims.map((row) => ({ ...row, folder: "trash" as const }));
  await writeList(account, folder, rows.filter((row) => !chosen.has(row.id)));
  await writeList(account, "trash", [...moved, ...trash.filter((row) => !chosen.has(row.id))]);
  await Promise.all(moved.map(async (row) => {
    const record = await readJson<MailRecord>(bodyKey(row.id));
    if (!record) return;
    record.folder = "trash";
    await writeJson(bodyKey(row.id), record);
  }));
}

async function saveRecord(record: MailRecord, files: Array<{ id: string; bytes: Buffer; contentType: string }>) {
  await Promise.all(files.map((file) => writeBytes(fileKey(record.id, file.id), file.bytes, file.contentType)));
  await writeJson(bodyKey(record.id), record);
  const rows = await readList(record.account, record.folder);
  if (rows.some((row) => row.id === record.id || (record.messageId && row.messageId === record.messageId))) return;
  await writeList(record.account, record.folder, [summaryOf(record), ...rows].slice(0, 500));
}

export async function storeIncoming(raw: Buffer, envelopeTo: string) {
  const mail = await simpleParser(raw);
  const headerTo = addressText(mail.to);
  const box = mailboxFromRecipients(envelopeTo, headerTo);
  if (!box) throw new Error("FOREIGN_RECIPIENT");
  const messageId = (mail.messageId || "").replace(/[\r\n\0]/g, "").trim().slice(0, 500);
  if (messageId) {
    const existing = await readList(box.key, "inbox");
    if (existing.some((row) => row.messageId === messageId)) return;
  }
  const parsed = (mail.attachments || [])
    .map((file, index) => ({
      id: newId(),
      filename: safeName(file.filename || "", file.contentType || "application/octet-stream", index),
      contentType: file.contentType || "application/octet-stream",
      bytes: file.content,
    }))
    .filter((file) => file.bytes?.length);
  const kept: typeof parsed = [];
  let total = 0;
  for (const file of parsed) {
    if (kept.length >= MAX_STORED_FILES || total + file.bytes.length > MAX_STORED_BYTES) break;
    kept.push(file);
    total += file.bytes.length;
  }
  let text = (mail.text || "").replace(/\0/g, "").slice(0, 200_000);
  if (!text.trim() && kept.length) text = `Adjuntos: ${kept.map((file) => file.filename).join(", ")}`;
  const record: MailRecord = {
    id: newId(),
    account: box.key,
    folder: "inbox",
    from: (mail.from?.text || "").slice(0, 500),
    to: (headerTo || envelopeTo || box.address).slice(0, 500),
    subject: (mail.subject || "(sin asunto)").replace(/[\r\n\0]/g, "").trim().slice(0, 500) || "(sin asunto)",
    seen: false,
    files: kept.length,
    createdAt: mail.date && !Number.isNaN(mail.date.getTime()) ? mail.date.toISOString() : new Date().toISOString(),
    messageId,
    text,
    html: typeof mail.html === "string" ? sanitizeMailHtml(mail.html) : "",
    inReplyTo: (typeof mail.inReplyTo === "string" ? mail.inReplyTo : "").slice(0, 500),
    attachments: kept.map(({ id, filename, contentType, bytes }) => ({
      id,
      filename,
      contentType,
      size: bytes.length,
    })),
  };
  await saveRecord(record, kept.map((file) => ({ id: file.id, bytes: file.bytes, contentType: file.contentType })));
}

const MAX_INBOUND_BYTES = 18_000_000;

export async function storeInboundChunk(input: {
  uploadId: string;
  seq: number;
  parts: number;
  totalBytes: number;
  envelopeTo: string;
  bytes: Buffer;
}) {
  if (
    !/^[0-9a-f-]{36}$/i.test(input.uploadId) ||
    input.parts < 2 ||
    input.parts > 12 ||
    input.seq < 0 ||
    input.seq >= input.parts ||
    input.totalBytes > MAX_INBOUND_BYTES ||
    input.bytes.length > 3_000_000
  ) {
    throw new Error("TOO_BIG");
  }
  const prefix = `mail/chunks/${input.uploadId}`;
  await writeBytes(`${prefix}/${input.seq}`, input.bytes, "application/octet-stream");
  const meta = (await readJson<{ parts: number; totalBytes: number; envelopeTo: string; seqs: number[] }>(`${prefix}/meta.json`)) ?? {
    parts: input.parts,
    totalBytes: input.totalBytes,
    envelopeTo: input.envelopeTo,
    seqs: [],
  };
  if (!meta.seqs.includes(input.seq)) meta.seqs.push(input.seq);
  meta.parts = input.parts;
  meta.envelopeTo = input.envelopeTo.slice(0, 500);
  await writeJson(`${prefix}/meta.json`, meta);
  if (meta.seqs.length < input.parts) return;
  const parts: Buffer[] = [];
  for (let seq = 0; seq < input.parts; seq += 1) {
    const bytes = await readBytes(`${prefix}/${seq}`);
    if (!bytes) return;
    parts.push(bytes);
  }
  await removePrefix(prefix);
  await storeIncoming(Buffer.concat(parts), input.envelopeTo);
}

function recipients(value: string) {
  const list = value.split(/[,;]/).map((item) => item.trim()).filter(Boolean).slice(0, 10);
  if (!list.length || list.some((item) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item))) throw new Error("BAD_RECIPIENT");
  return list;
}

export async function sendMail(input: {
  account: MailboxKey;
  to: string;
  subject: string;
  text: string;
  inReplyTo?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}) {
  const box = mailboxByKey(input.account);
  if (!box) throw new Error("BAD_ACCOUNT");
  const to = recipients(input.to);
  const subject = input.subject.replace(/[\r\n\0]/g, "").trim().slice(0, 200) || "(sin asunto)";
  const text = input.text.replace(/\0/g, "").trim().slice(0, 20_000);
  const files = (input.attachments || []).slice(0, MAX_OUT_FILES);
  const weight = files.reduce((sum, file) => sum + file.content.length, 0);
  if (files.length > MAX_OUT_FILES || weight > MAX_OUT_BYTES) throw new Error("TOO_BIG");
  if (!text && !files.length) throw new Error("EMPTY_BODY");
  const key = (process.env.RESEND_API_KEY || "").trim();
  if (!key) throw new Error("MISSING_RESEND");
  const message = text || "Te envío los archivos adjuntos.";
  const inReplyTo = input.inReplyTo?.replace(/[\r\n\0]/g, "").trim().slice(0, 500) || "";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `Many Makeups <${box.address}>`,
      to,
      reply_to: box.address,
      subject,
      text: message,
      html: `<div style="font-family:Georgia,serif;white-space:pre-wrap">${escapeHtml(message)}</div>`,
      attachments: files.map((file) => ({
        filename: file.filename,
        content: file.content.toString("base64"),
        content_type: file.contentType || "application/octet-stream",
      })),
      headers: inReplyTo ? { "In-Reply-To": inReplyTo, References: inReplyTo } : undefined,
    }),
  });
  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(`RESEND:${detail?.message || "rejected"}`);
  }
  const kept = files.map((file, index) => ({
    id: newId(),
    filename: safeName(file.filename, file.contentType || "application/octet-stream", index),
    contentType: file.contentType || "application/octet-stream",
    bytes: file.content,
  }));
  const record: MailRecord = {
    id: newId(),
    account: box.key,
    folder: "sent",
    from: `Many Makeups <${box.address}>`,
    to: to.join(", "),
    subject,
    seen: true,
    files: kept.length,
    createdAt: new Date().toISOString(),
    messageId: "",
    text: message,
    html: "",
    inReplyTo,
    attachments: kept.map(({ id, filename, contentType, bytes }) => ({ id, filename, contentType, size: bytes.length })),
  };
  await saveRecord(record, kept.map((file) => ({ id: file.id, bytes: file.bytes, contentType: file.contentType })));
}

export function publicMailError(err: unknown) {
  const message = err instanceof Error ? err.message : "";
  if (message === "BAD_RECIPIENT") return { status: 400, error: "El destinatario no es un correo válido." };
  if (message === "EMPTY_BODY") return { status: 400, error: "Escribe el mensaje antes de enviarlo." };
  if (message === "TOO_BIG") return { status: 413, error: "Los adjuntos pesan demasiado." };
  if (message === "BAD_ACCOUNT") return { status: 400, error: "Esa cuenta no está en el estudio." };
  if (message === "MISSING_RESEND") return { status: 503, error: "Falta RESEND_API_KEY en Vercel." };
  if (message === "FOREIGN_RECIPIENT") return { status: 200, error: "" };
  if (message.startsWith("RESEND:")) return { status: 502, error: "El correo no ha salido. Revisa el dominio en Resend." };
  return { status: 500, error: "No se ha podido completar el correo." };
}

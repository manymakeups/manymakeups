import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";
import { defaultGoogleCalendarUrl, defaultStudioCalendarUrl, migrateStudioCalendarUrl } from "./calendar";
import { newId } from "./crypto";
import {
  asStudioNotice,
  emptyDb,
  normalizeClient,
  type ClientRecord,
  type PortalDb,
  type PortalFile,
  type StudioNotice,
} from "./types";

const DB_PATH = "portal/db.json";
const ROOT = path.join(process.cwd(), "data");

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function portalStorageReady() {
  if (process.env.NODE_ENV !== "production") return true;
  return useBlob();
}

async function readDb(): Promise<PortalDb> {
  if (useBlob()) {
    const result = await get(DB_PATH, { access: "private", useCache: false });
    if (!result) return emptyDb();
    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text) as PortalDb;
    return {
      clients: (parsed.clients ?? []).map((client) => normalizeClient(client)),
      notices: (parsed.notices ?? []).map(asStudioNotice).filter(Boolean) as StudioNotice[],
      studioCalendarUrl: typeof parsed.studioCalendarUrl === "string" ? parsed.studioCalendarUrl : "",
      studioCalendarGoogle: typeof parsed.studioCalendarGoogle === "string" ? parsed.studioCalendarGoogle : "",
      studioCalendarExtra: typeof parsed.studioCalendarExtra === "string" ? parsed.studioCalendarExtra : "",
    };
  }
  try {
    const raw = await readFile(path.join(ROOT, DB_PATH), "utf8");
    const parsed = JSON.parse(raw) as PortalDb;
    return {
      clients: (parsed.clients ?? []).map((client) => normalizeClient(client)),
      notices: (parsed.notices ?? []).map(asStudioNotice).filter(Boolean) as StudioNotice[],
      studioCalendarUrl: typeof parsed.studioCalendarUrl === "string" ? parsed.studioCalendarUrl : "",
      studioCalendarGoogle: typeof parsed.studioCalendarGoogle === "string" ? parsed.studioCalendarGoogle : "",
      studioCalendarExtra: typeof parsed.studioCalendarExtra === "string" ? parsed.studioCalendarExtra : "",
    };
  } catch {
    return emptyDb();
  }
}

async function writeDb(db: PortalDb) {
  const body = JSON.stringify(db, null, 2);
  if (useBlob()) {
    await put(DB_PATH, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  const file = path.join(ROOT, DB_PATH);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body, "utf8");
}

export async function getStudioCalendars() {
  const db = await readDb();
  const stored = db.studioCalendarUrl === "off" ? "" : db.studioCalendarUrl || defaultStudioCalendarUrl();
  const primary = migrateStudioCalendarUrl(stored);
  const google = db.studioCalendarGoogle === "off" ? "" : db.studioCalendarGoogle || defaultGoogleCalendarUrl();
  return { primary, google, extra: db.studioCalendarExtra || "" };
}

export async function setStudioCalendars(primary: string, google: string, extra: string) {
  const db = await readDb();
  db.studioCalendarUrl = primary || "off";
  db.studioCalendarGoogle = google || "off";
  db.studioCalendarExtra = extra;
  await writeDb(db);
}

export async function listClients() {
  const db = await readDb();
  return db.clients.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getClient(id: string) {
  const db = await readDb();
  return db.clients.find((client) => client.id === id) ?? null;
}

export async function getClientByEmail(email: string) {
  const db = await readDb();
  return db.clients.find((client) => client.email === email) ?? null;
}

export async function getClientByPlannerHash(hash: string) {
  if (!hash) return null;
  const db = await readDb();
  return db.clients.find((client) => client.planners.some((planner) => planner.tokenHash === hash)) ?? null;
}

export async function getClientByInviteHash(hash: string) {
  const now = Date.now();
  const db = await readDb();
  return (
    db.clients.find((client) => {
      if (!client.inviteTokenHash || client.inviteTokenHash !== hash) return false;
      if (!client.inviteExpiresAt) return false;
      return new Date(client.inviteExpiresAt).getTime() > now;
    }) ?? null
  );
}

export type NewStudioNotice = {
  kind: StudioNotice["kind"];
  scope: StudioNotice["scope"];
  message: string;
  detail?: string;
  personIndex?: number;
  fromStudio?: boolean;
};

function pushNotice(db: PortalDb, clientId: string, notice: NewStudioNotice) {
  db.notices.unshift({
    id: newId(),
    clientId,
    createdAt: new Date().toISOString(),
    kind: notice.kind,
    scope: notice.scope,
    personIndex: notice.personIndex,
    message: notice.message,
    detail: notice.detail,
    read: false,
    fromStudio: Boolean(notice.fromStudio),
    replies: [],
  });
  db.notices = db.notices.slice(0, 200);
}

export async function deleteClient(id: string) {
  const db = await readDb();
  const client = db.clients.find((item) => item.id === id);
  if (!client) return false;
  const files = [...client.inspiration, ...client.documents, ...client.workPhotos];
  db.clients = db.clients.filter((item) => item.id !== id);
  db.notices = db.notices.filter((notice) => notice.clientId !== id);
  await writeDb(db);
  await Promise.all(files.map((file) => deletePortalFile(file).catch(() => undefined)));
  return true;
}

export async function saveClient(next: ClientRecord, notice?: NewStudioNotice) {
  const db = await readDb();
  const record = normalizeClient(next);
  const index = db.clients.findIndex((client) => client.id === record.id);
  if (index === -1) db.clients.push(record);
  else db.clients[index] = record;
  if (notice) pushNotice(db, record.id, notice);
  await writeDb(db);
  return record;
}

export async function addStudioNotice(clientId: string, notice: NewStudioNotice) {
  const db = await readDb();
  pushNotice(db, clientId, notice);
  await writeDb(db);
}

export async function listNotices() {
  const db = await readDb();
  return db.notices;
}

export async function mutateNotices(
  mutator: (notices: StudioNotice[]) => StudioNotice[],
) {
  const db = await readDb();
  db.notices = mutator(db.notices);
  await writeDb(db);
}

export async function markClientCommsRead(clientId: string) {
  const db = await readDb();
  const client = db.clients.find((item) => item.id === clientId);
  if (client) {
    client.history = client.history.map((entry) =>
      entry.kind === "contacto" ? { ...entry, seenByClient: true } : entry,
    );
  }
  db.notices = db.notices.map((notice) =>
    notice.clientId === clientId && notice.fromStudio ? { ...notice, read: true } : notice,
  );
  await writeDb(db);
}

export async function markNoticeRead(id: string) {
  await mutateNotices((notices) =>
    notices.map((notice) => (notice.id === id ? { ...notice, read: true } : notice)),
  );
}

export async function putPortalFile(file: PortalFile, data: Buffer) {
  if (useBlob()) {
    await put(file.pathname, data, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: file.mime,
    });
    return;
  }
  const disk = path.join(ROOT, file.pathname);
  await mkdir(path.dirname(disk), { recursive: true });
  await writeFile(disk, data);
}

export async function readPortalFile(file: PortalFile) {
  if (useBlob()) {
    const result = await get(file.pathname, { access: "private" });
    if (!result) return null;
    const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
    return { buffer, mime: file.mime, name: file.name };
  }
  try {
    const buffer = await readFile(path.join(ROOT, file.pathname));
    return { buffer, mime: file.mime, name: file.name };
  } catch {
    return null;
  }
}

export async function deletePortalFile(file: PortalFile) {
  if (useBlob()) {
    await del(file.pathname);
    return;
  }
  try {
    await unlink(path.join(ROOT, file.pathname));
  } catch {
    /* already gone */
  }
}

export function publicClient(client: ClientRecord) {
  return {
    id: client.id,
    email: client.email,
    name: client.name,
    createdAt: client.createdAt,
    activated: Boolean(client.passwordHash),
    event: client.event,
    inspiration: client.inspiration,
    documents: client.documents,
  };
}

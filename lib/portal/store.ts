import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";
import { emptyDb, type ClientRecord, type PortalDb, type PortalFile } from "./types";

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
    return { clients: parsed.clients ?? [] };
  }
  try {
    const raw = await readFile(path.join(ROOT, DB_PATH), "utf8");
    const parsed = JSON.parse(raw) as PortalDb;
    return { clients: parsed.clients ?? [] };
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

export async function saveClient(next: ClientRecord) {
  const db = await readDb();
  const index = db.clients.findIndex((client) => client.id === next.id);
  if (index === -1) db.clients.push(next);
  else db.clients[index] = next;
  await writeDb(db);
  return next;
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

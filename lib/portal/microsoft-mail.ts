import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import { site } from "@/lib/site";
import { HOTMAIL_MAILBOX, type MailFolder } from "./mailboxes";

const TOKEN_URL = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
const AUTHORIZE_URL = "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize";
const GRAPH = "https://graph.microsoft.com/v1.0";
const SCOPES = [
  "offline_access",
  "https://graph.microsoft.com/User.Read",
  "https://graph.microsoft.com/Mail.Read",
  "https://graph.microsoft.com/Mail.ReadWrite",
  "https://graph.microsoft.com/Mail.Send",
].join(" ");
const TOKEN_KEY = "mail/microsoft/token.json";
const EXPECTED = HOTMAIL_MAILBOX.address.toLowerCase();
const FOLDER_ID: Record<MailFolder, string> = {
  inbox: "inbox",
  sent: "sentitems",
  archive: "archive",
  trash: "deleteditems",
};

type SavedToken = {
  refreshToken: string;
  accessToken: string;
  expiresAt: number;
};

type GraphAddress = { emailAddress?: { name?: string; address?: string } };
type GraphMessage = {
  id?: string;
  subject?: string;
  from?: GraphAddress;
  toRecipients?: GraphAddress[];
  receivedDateTime?: string;
  sentDateTime?: string;
  isRead?: boolean;
  hasAttachments?: boolean;
  internetMessageId?: string;
  body?: { contentType?: string; content?: string };
};

export type MicrosoftLogin = { url: string; state: string; verifier: string };

function fail(code: string): never {
  const err = new Error(code);
  err.name = "HotmailMail";
  throw err;
}

function config() {
  const clientId = (process.env.MICROSOFT_CLIENT_ID || "").trim();
  const clientSecret = (process.env.MICROSOFT_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) fail("MISSING");
  return { clientId, clientSecret, redirectUri: `${site.url}/api/mail/microsoft/callback` };
}

function storesInBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readToken(): Promise<SavedToken | null> {
  if (storesInBlob()) {
    const result = await get(TOKEN_KEY, { access: "private", useCache: false });
    if (!result) return null;
    return JSON.parse(await new Response(result.stream).text()) as SavedToken;
  }
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "data", TOKEN_KEY), "utf8")) as SavedToken;
  } catch {
    return null;
  }
}

async function writeToken(value: SavedToken) {
  const body = JSON.stringify(value);
  if (storesInBlob()) {
    await put(TOKEN_KEY, body, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
    return;
  }
  const file = path.join(process.cwd(), "data", TOKEN_KEY);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body, "utf8");
}

export function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

export function beginLogin(): MicrosoftLogin {
  const { clientId, redirectUri } = config();
  const state = randomBytes(24).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "select_account");
  return { url: url.toString(), state, verifier };
}

function addressText(value: GraphAddress | undefined) {
  const name = value?.emailAddress?.name?.trim() || "";
  const address = value?.emailAddress?.address?.trim() || "";
  if (name && address) return `${name} <${address}>`;
  return address || name;
}

function messageIdOk(value: string) {
  return Boolean(value) && value.length <= 1024 && !/[\s\0]|\.\./.test(value);
}

async function tokenRequest(body: URLSearchParams) {
  const { clientId, clientSecret, redirectUri } = config();
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  body.set("redirect_uri", redirectUri);
  body.set("scope", SCOPES);
  const res = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  const json = (await res.json()) as { access_token?: string; refresh_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !json.access_token) fail(json.error === "invalid_client" ? "BAD_SECRET" : "NOT_CONNECTED");
  return json;
}

async function accessToken() {
  const saved = await readToken();
  if (!saved?.refreshToken) fail("NOT_CONNECTED");
  if (saved.accessToken && saved.expiresAt > Date.now() + 60_000) return saved.accessToken;
  const json = await tokenRequest(new URLSearchParams({ grant_type: "refresh_token", refresh_token: saved.refreshToken }));
  const next: SavedToken = {
    refreshToken: json.refresh_token || saved.refreshToken,
    accessToken: json.access_token || "",
    expiresAt: Date.now() + (json.expires_in || 3600) * 1000,
  };
  await writeToken(next);
  return next.accessToken;
}

async function graph(pathname: string, init?: RequestInit, retry = true): Promise<Response> {
  const token = await accessToken();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${GRAPH}${pathname}`, { ...init, headers, cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (res.status === 401 && retry) {
    const saved = await readToken();
    if (saved) await writeToken({ ...saved, accessToken: "", expiresAt: 0 });
    return graph(pathname, init, false);
  }
  return res;
}

async function graphJson<T>(pathname: string, init?: RequestInit): Promise<T> {
  const res = await graph(pathname, init);
  if (res.status === 204) return {} as T;
  const json = (await res.json().catch(() => ({}))) as T & { error?: { code?: string; message?: string } };
  if (!res.ok) {
    const code = json.error?.code || "";
    if (code === "ErrorAccessDenied" || res.status === 403) fail("DENIED");
    if (res.status === 404) fail("MISSING_MESSAGE");
    if (res.status === 429) fail("BUSY");
    fail("FAILED");
  }
  return json;
}

function summary(row: GraphMessage, folder: MailFolder) {
  const to = (row.toRecipients || []).map((item) => addressText(item)).filter(Boolean).join(", ");
  return {
    id: row.id || "",
    account: "hotmail" as const,
    folder,
    from: addressText(row.from),
    to,
    subject: row.subject || "(sin asunto)",
    seen: Boolean(row.isRead),
    files: row.hasAttachments ? 1 : 0,
    createdAt: row.receivedDateTime || row.sentDateTime || new Date().toISOString(),
    messageId: row.internetMessageId || "",
  };
}

function stripHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|base|svg)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|base|svg)\b[^>]*\/?>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, " $1=\"#\"")
    .slice(0, 500_000);
}

export async function finishLogin(code: string, verifier: string) {
  const json = await tokenRequest(new URLSearchParams({ grant_type: "authorization_code", code, code_verifier: verifier }));
  if (!json.refresh_token || !json.access_token) fail("NOT_CONNECTED");
  const profileRes = await fetch(`${GRAPH}/me?$select=mail,userPrincipalName,otherMails`, {
    headers: { Authorization: `Bearer ${json.access_token}` },
    cache: "no-store",
  });
  const profile = (await profileRes.json()) as { mail?: string; userPrincipalName?: string; otherMails?: string[] };
  const owned = [profile.mail, profile.userPrincipalName, ...(profile.otherMails || [])].map((item) => String(item || "").toLowerCase());
  if (!owned.some((item) => item === EXPECTED || item.startsWith("anabmtnez78@"))) fail("WRONG_ACCOUNT");
  await writeToken({
    refreshToken: json.refresh_token,
    accessToken: json.access_token,
    expiresAt: Date.now() + (json.expires_in || 3600) * 1000,
  });
}

export async function listHotmail(folder: MailFolder) {
  const box = FOLDER_ID[folder];
  const select = "id,subject,from,toRecipients,receivedDateTime,sentDateTime,isRead,hasAttachments,internetMessageId";
  const ordered = `/me/mailFolders/${box}/messages?$top=40&$select=${select}&$orderby=receivedDateTime desc`;
  const plain = `/me/mailFolders/${box}/messages?$top=40&$select=${select}`;
  const listed = await graphJson<{ value?: GraphMessage[] }>(ordered).catch(() => graphJson<{ value?: GraphMessage[] }>(plain));
  return (listed.value || []).map((row) => summary(row, folder)).filter((row) => messageIdOk(row.id));
}

export async function hotmailUnseen() {
  const folder = await graphJson<{ unreadItemCount?: number }>("/me/mailFolders/inbox?$select=unreadItemCount");
  const listed = await graphJson<{ value?: GraphMessage[] }>(
    "/me/mailFolders/inbox/messages?$top=20&$filter=isRead eq false&$select=id,subject,from",
  ).catch(() => ({ value: [] as GraphMessage[] }));
  return {
    count: folder.unreadItemCount || 0,
    items: (listed.value || []).filter((row) => messageIdOk(row.id || "")).map((row) => ({
      id: row.id || "",
      account: "hotmail" as const,
      from: addressText(row.from),
      subject: row.subject || "(sin asunto)",
    })),
  };
}

export async function readHotmail(id: string) {
  if (!messageIdOk(id)) fail("MISSING_MESSAGE");
  const row = await graphJson<GraphMessage>(`/me/messages/${encodeURIComponent(id)}?$select=id,subject,from,toRecipients,receivedDateTime,sentDateTime,isRead,hasAttachments,internetMessageId,body`);
  if (!row.isRead) {
    await graphJson(`/me/messages/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    }).catch(() => undefined);
  }
  const files = row.hasAttachments
    ? await graphJson<{ value?: Array<{ id?: string; name?: string; contentType?: string; size?: number; isInline?: boolean }> }>(`/me/messages/${encodeURIComponent(id)}/attachments?$select=id,name,contentType,size,isInline`)
    : { value: [] };
  const attachments = (files.value || []).filter((file) => file.id && !file.isInline).map((file) => ({
    id: file.id || "",
    filename: file.name || "adjunto",
    contentType: file.contentType || "application/octet-stream",
    size: file.size || 0,
  }));
  const html = row.body?.contentType === "html" ? stripHtml(row.body.content || "") : "";
  const text = row.body?.contentType === "html" ? "" : (row.body?.content || "");
  return { ...summary({ ...row, isRead: true, hasAttachments: attachments.length > 0 }, "inbox"), files: attachments.length, text, html, inReplyTo: "", attachments };
}

export async function readHotmailFile(messageId: string, fileId: string) {
  if (!messageIdOk(messageId) || !messageIdOk(fileId)) fail("MISSING_MESSAGE");
  const file = await graphJson<{ name?: string; contentType?: string; contentBytes?: string }>(`/me/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(fileId)}`);
  if (!file.contentBytes) fail("MISSING_MESSAGE");
  return {
    filename: file.name || "adjunto",
    contentType: file.contentType || "application/octet-stream",
    bytes: Buffer.from(file.contentBytes, "base64"),
  };
}

export async function hotmailAct(body: { action?: string; ids?: string[]; seen?: boolean; destination?: string; folder?: string }) {
  const ids = (body.ids || []).filter(messageIdOk).slice(0, 40);
  if (!ids.length) fail("MISSING_MESSAGE");
  if (body.action === "seen") {
    for (const id of ids) {
      await graphJson(`/me/messages/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: Boolean(body.seen) }),
      });
    }
    return;
  }
  if (body.action === "move") {
    const destination = body.destination === "inbox" ? "inbox" : body.destination === "archive" ? "archive" : body.destination === "trash" ? "deleteditems" : "";
    if (!destination) fail("BAD_FOLDER");
    for (const id of ids) {
      await graphJson(`/me/messages/${encodeURIComponent(id)}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId: destination }),
      });
    }
    return;
  }
  if (body.action === "delete") {
    for (const id of ids) {
      if (body.folder === "trash") await graphJson(`/me/messages/${encodeURIComponent(id)}`, { method: "DELETE" });
      else await graphJson(`/me/messages/${encodeURIComponent(id)}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId: "deleteditems" }),
      });
    }
    return;
  }
  fail("FAILED");
}

function recipients(value: string) {
  const to = value.split(/[,;]/).map((part) => part.trim()).filter(Boolean);
  if (!to.length || to.length > 10 || to.some((address) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))) fail("BAD_RECIPIENT");
  return to.map((address) => ({ emailAddress: { address } }));
}

export async function sendHotmail(input: {
  to: string;
  subject: string;
  text: string;
  replyId?: string;
  replyAll?: boolean;
  forwardId?: string;
  files?: Array<{ filename: string; contentType: string; contentBase64: string }>;
}) {
  const text = input.text.replace(/\0/g, "").trim().slice(0, 20_000);
  const files = (input.files || []).slice(0, 8);
  let total = 0;
  const attachments = files.map((file) => {
    const content = Buffer.from(file.contentBase64 || "", "base64");
    total += content.length;
    return {
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: String(file.filename || "adjunto").slice(0, 120),
      contentType: String(file.contentType || "application/octet-stream").slice(0, 160),
      contentBytes: content.toString("base64"),
    };
  });
  if (total > 3_000_000) fail("TOO_BIG");
  const replyId = input.replyId && messageIdOk(input.replyId) ? input.replyId : "";
  const forwardId = input.forwardId && messageIdOk(input.forwardId) ? input.forwardId : "";
  if (replyId || forwardId) {
    const pathName = forwardId ? "createForward" : input.replyAll ? "createReplyAll" : "createReply";
    const source = forwardId || replyId;
    const draft = await graphJson<{ id?: string }>(`/me/messages/${encodeURIComponent(source)}/${pathName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: text }),
    });
    if (!draft.id) fail("FAILED");
    if (forwardId) {
      await graphJson(`/me/messages/${encodeURIComponent(draft.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toRecipients: recipients(input.to) }),
      });
    }
    for (const file of attachments) {
      await graphJson(`/me/messages/${encodeURIComponent(draft.id)}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(file),
      });
    }
    await graphJson(`/me/messages/${encodeURIComponent(draft.id)}/send`, { method: "POST" });
    return;
  }
  if (!text && !attachments.length) fail("EMPTY");
  const message = {
    subject: input.subject.replace(/[\r\n\0]/g, "").trim().slice(0, 200) || "(sin asunto)",
    body: { contentType: "Text", content: text || "Te envío los archivos adjuntos." },
    toRecipients: recipients(input.to),
    attachments,
  };
  try {
    await graphJson("/me/sendMail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: { ...message, from: { emailAddress: { address: HOTMAIL_MAILBOX.address, name: HOTMAIL_MAILBOX.fromName } } },
        saveToSentItems: true,
      }),
    });
  } catch (err) {
    if (!(err instanceof Error) || err.message !== "FAILED") throw err;
    await graphJson("/me/sendMail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, saveToSentItems: true }),
    });
  }
}

export function hotmailMailError(err: unknown): { status: number; error: string; connect?: string } {
  const message = err instanceof Error ? err.message : "";
  if (message === "NOT_CONNECTED") return { status: 409, error: "Conecta Hotmail para ver esta bandeja.", connect: "/api/mail/microsoft/start" };
  if (message === "MISSING") return { status: 503, error: "Faltan las claves de Microsoft en Vercel." };
  if (message === "BAD_SECRET") return { status: 503, error: "La clave secreta de Microsoft en Vercel no coincide." };
  if (message === "WRONG_ACCOUNT") return { status: 400, error: "Entra con anabmtnez78@hotmail.com." };
  if (message === "DENIED") return { status: 403, error: "En Azure, en Permisos de API, añade Mail.Read, Mail.ReadWrite y Mail.Send." };
  if (message === "MISSING_MESSAGE") return { status: 404, error: "Ese mensaje ya no está." };
  if (message === "BAD_RECIPIENT") return { status: 400, error: "El destinatario no es un correo válido." };
  if (message === "EMPTY") return { status: 400, error: "Escribe el mensaje antes de enviarlo." };
  if (message === "TOO_BIG") return { status: 413, error: "Hotmail admite hasta 8 archivos y 3 MB." };
  if (message === "BAD_FOLDER") return { status: 400, error: "Esa carpeta no existe." };
  if (message === "BUSY") return { status: 429, error: "Hotmail está ocupado. Prueba otra vez en un momento." };
  if (err instanceof Error && err.name === "TimeoutError") return { status: 504, error: "Hotmail ha tardado demasiado." };
  return { status: 502, error: "No se ha podido abrir Hotmail." };
}

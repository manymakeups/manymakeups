import { SignJWT, jwtVerify } from "jose";
import { fetchCalendarEvents, type RemoteEvent } from "@/lib/portal/calendar";
import { site } from "@/lib/site";
import {
  clearGoogleCalendarLink,
  getGoogleCalendarLink,
  getStudioCalendars,
  setGoogleCalendarLink,
} from "@/lib/portal/store";

const SCOPE = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email";

type GoogleWhen = { date?: string; dateTime?: string };
type GoogleEvent = {
  id?: string;
  recurrence?: string[];
  start?: GoogleWhen;
  status?: string;
};

export function googleCalendarConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri(request: Request) {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  if (process.env.NODE_ENV === "production") return `${site.url}/api/admin/google-calendar/callback`;
  return new URL("/api/admin/google-calendar/callback", request.url).toString();
}

export function googleCalendarIdFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const match = /\/calendar\/ical\/([^/]+)/.exec(parsed.pathname);
    if (!match) return "";
    return decodeURIComponent(match[1]);
  } catch {
    return "";
  }
}

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") throw new Error("Falta AUTH_SECRET");
    return new TextEncoder().encode("manymakeups-dev-secret-not-for-prod");
  }
  return new TextEncoder().encode(secret);
}

export async function signGoogleState() {
  return new SignJWT({ purpose: "google-calendar" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretKey());
}

export async function readGoogleState(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.purpose === "google-calendar";
  } catch {
    return false;
  }
}

export function googleAuthUrl(redirectUri: string, state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID || "");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

async function tokenRequest(body: URLSearchParams) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(12000),
  });
  const data = (await response.json().catch(() => ({}))) as { access_token?: string; refresh_token?: string; error?: string };
  return { ok: response.ok, data };
}

export async function connectGoogleCalendar(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const exchanged = await tokenRequest(
    new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  );
  const refresh = exchanged.data.refresh_token || "";
  const access = exchanged.data.access_token || "";
  if (!exchanged.ok || !refresh || !access) return false;
  const info = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access}` },
    signal: AbortSignal.timeout(12000),
  });
  const profile = (await info.json().catch(() => ({}))) as { email?: string };
  await setGoogleCalendarLink(refresh, profile.email || "");
  return true;
}

async function accessToken(refreshToken: string) {
  const exchanged = await tokenRequest(
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  );
  if (exchanged.data.error === "invalid_grant") {
    await clearGoogleCalendarLink();
    return "";
  }
  return exchanged.ok ? exchanged.data.access_token || "" : "";
}

function madridStamp(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return { date: value, time: "" };
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { date: `${pick("year")}-${pick("month")}-${pick("day")}`, time: `${pick("hour")}:${pick("minute")}` };
}

function sameSlot(event: GoogleEvent, date: string, time: string) {
  const start = event.start?.date || event.start?.dateTime || "";
  if (!start) return false;
  const stamp = madridStamp(start);
  if (stamp.date !== date) return false;
  if (!time || !stamp.time) return true;
  return stamp.time === time;
}

function dayWindow(date: string) {
  const start = new Date(`${date}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 1);
  const end = new Date(`${date}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 2);
  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}

async function googleDelete(calendarId: string, eventId: string, token: string) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(12000) },
  );
  return response.status === 204 || response.status === 200 || response.status === 404 || response.status === 410;
}

async function deleteGoogleOccurrence(calendarId: string, token: string, uid: string, date: string, time: string) {
  const window = dayWindow(date);
  const listUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  listUrl.searchParams.set("iCalUID", uid);
  listUrl.searchParams.set("singleEvents", "true");
  listUrl.searchParams.set("orderBy", "startTime");
  listUrl.searchParams.set("timeMin", window.timeMin);
  listUrl.searchParams.set("timeMax", window.timeMax);
  listUrl.searchParams.set("showDeleted", "false");
  const response = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(12000),
  });
  const data = (await response.json().catch(() => ({}))) as { items?: GoogleEvent[] };
  let items = response.ok ? data.items || [] : [];
  if (!items.length && uid.endsWith("@google.com")) {
    const id = uid.slice(0, -"@google.com".length);
    const one = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(id)}`,
      { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(12000) },
    );
    if (one.ok) {
      const event = (await one.json()) as GoogleEvent;
      if (event.recurrence?.length && event.id) {
        const instancesUrl = new URL(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(event.id)}/instances`,
        );
        instancesUrl.searchParams.set("timeMin", window.timeMin);
        instancesUrl.searchParams.set("timeMax", window.timeMax);
        instancesUrl.searchParams.set("showDeleted", "false");
        const instances = await fetch(instancesUrl, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(12000),
        });
        const body = (await instances.json().catch(() => ({}))) as { items?: GoogleEvent[] };
        if (instances.ok) items = body.items || [];
      } else if (event.id) items = [event];
    } else if (one.status === 404 || one.status === 410) return true;
  }
  const matches = items.filter((item) => item.id && item.status !== "cancelled" && sameSlot(item, date, time));
  if (!matches.length) return items.length === 0;
  const results = await Promise.all(matches.map((item) => googleDelete(calendarId, item.id || "", token)));
  return results.every(Boolean);
}

type FeedEvent = RemoteEvent & { source: string };

async function studioEvents() {
  const { primary, google, extra } = await getStudioCalendars();
  const feeds = [
    { url: primary, source: "iPhone" },
    { url: google, source: "Google" },
    { url: extra, source: "Calendly" },
  ].filter((feed) => feed.url);
  const loaded = await Promise.all(
    feeds.map(async (feed) => {
      const result = await fetchCalendarEvents(feed.url);
      return result.events.map((event) => ({ ...event, source: feed.source, id: `${feed.source}-${event.id}` }));
    }),
  );
  return { events: loaded.flat() as FeedEvent[], googleUrl: google };
}

export async function removeStudioGoogleEvent(displayedId: string) {
  const id = displayedId.trim();
  const { events, googleUrl } = await studioEvents();
  const target = events.find((event) => event.id === id);
  if (!target) return { status: "local" as const, hideIds: [id] };
  const twins = events.filter(
    (event) => event.source === "Google" && event.date === target.date && event.time === target.time && event.title === target.title,
  );
  const googleEvents = target.source === "Google" ? [target, ...twins.filter((event) => event.id !== target.id)] : twins;
  const unique = new Map<string, FeedEvent>();
  for (const event of googleEvents) {
    if (!event.uid) continue;
    unique.set(`${event.uid}|${event.date}|${event.time}`, event);
  }
  const hideIds = [id, ...googleEvents.map((event) => event.id)];
  if (!unique.size) return { status: "local" as const, hideIds };
  if (!googleCalendarConfigured()) return { status: "needs-setup" as const, hideIds };
  const link = await getGoogleCalendarLink();
  if (!link.refreshToken) return { status: "needs-connection" as const, hideIds };
  const calendarId = googleCalendarIdFromUrl(googleUrl);
  const token = calendarId ? await accessToken(link.refreshToken) : "";
  if (!calendarId || !token) return { status: "failed" as const, hideIds };
  const results = await Promise.all(
    [...unique.values()].map((event) => deleteGoogleOccurrence(calendarId, token, event.uid || "", event.date, event.time)),
  );
  return { status: results.every(Boolean) ? ("deleted" as const) : ("failed" as const), hideIds };
}

export function googleRemovalQuery(status: "local" | "deleted" | "needs-setup" | "needs-connection" | "failed") {
  if (status === "deleted") return "ok=google-borrada";
  if (status === "needs-setup") return "error=google-config";
  if (status === "needs-connection") return "error=google-conexion";
  if (status === "failed") return "error=google";
  return "";
}

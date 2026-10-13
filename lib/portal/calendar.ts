export type RemoteEvent = {
  id: string;
  date: string;
  time: string;
  title: string;
  place: string;
  notes: string;
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export function weekdayLabels() {
  return WEEKDAYS;
}

export function madridToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function parseMonth(value: string | undefined, today = madridToday()) {
  const match = /^(\d{4})-(\d{2})$/.exec(value || "");
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) return { year, month };
  }
  const [year, month] = today.split("-").map(Number);
  return { year, month };
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function monthLabel(year: number, month: number) {
  const label = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function dayLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function monthCells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<string | null> = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

function isPrivateHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".localhost")) return true;
  if (host === "0.0.0.0" || host === "::1" || host === "metadata.google.internal") return true;
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!ipv4) return false;
  const parts = ipv4.slice(1).map(Number);
  if (parts.some((part) => part > 255)) return true;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

export function normalizeCalendarUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const raw = /^webcal:\/\//i.test(trimmed) ? `https://${trimmed.slice("webcal://".length)}` : trimmed;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || isPrivateHost(url.hostname)) return null;
  return url.toString();
}

function madridParts(instant: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { date: `${pick("year")}-${pick("month")}-${pick("day")}`, time: `${pick("hour")}:${pick("minute")}` };
}

function wallTime(value: string, params: Record<string, string>) {
  if ((params.VALUE || "").toUpperCase() === "DATE" || /^\d{8}$/.test(value)) {
    return { date: `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`, time: "" };
  }
  const match = /^(\d{8})T(\d{6})(Z)?$/.exec(value);
  if (!match) return null;
  const date = `${match[1].slice(0, 4)}-${match[1].slice(4, 6)}-${match[1].slice(6, 8)}`;
  const time = `${match[2].slice(0, 2)}:${match[2].slice(2, 4)}`;
  if (!match[3]) return { date, time };
  return madridParts(new Date(`${date}T${match[2].slice(0, 2)}:${match[2].slice(2, 4)}:${match[2].slice(4, 6)}Z`));
}

function unescapeIcs(value: string) {
  return value.replace(/\\([nN,;\\])/g, (_, char: string) => {
    if (char === "n" || char === "N") return "\n";
    return char;
  });
}

function unfold(text: string) {
  return text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n[ \t]/g, "");
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function dayDiff(start: string, end: string) {
  const [ys, ms, ds] = start.split("-").map(Number);
  const [ye, me, de] = end.split("-").map(Number);
  return Math.round((Date.UTC(ye, me - 1, de) - Date.UTC(ys, ms - 1, ds)) / 86400000);
}

function weekdayCode(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return BYDAY[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

function mondayOf(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return addDays(date, -((weekday + 6) % 7));
}

type Rule = {
  freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  count?: number;
  until?: string;
  byday?: string[];
};

function parseRule(value: string): Rule | null {
  const bits = Object.fromEntries(
    value.split(";").map((part) => {
      const [key, raw] = part.split("=");
      return [key, raw ?? ""];
    }),
  );
  const freq = bits.FREQ;
  if (freq !== "DAILY" && freq !== "WEEKLY" && freq !== "MONTHLY" && freq !== "YEARLY") return null;
  const count = Number(bits.COUNT);
  return {
    freq,
    interval: Math.max(1, Number(bits.INTERVAL) || 1),
    count: Number.isFinite(count) && count > 0 ? count : undefined,
    until: bits.UNTIL,
    byday: bits.BYDAY ? bits.BYDAY.split(",") : undefined,
  };
}

function matches(start: string, current: string, rule: Rule) {
  const diff = dayDiff(start, current);
  if (diff < 0) return false;
  if (rule.freq === "DAILY") return diff % rule.interval === 0;
  if (rule.freq === "WEEKLY") {
    const weeks = dayDiff(mondayOf(start), mondayOf(current)) / 7;
    if (weeks % rule.interval !== 0) return false;
    const days = rule.byday?.length ? rule.byday : [weekdayCode(start)];
    return days.includes(weekdayCode(current));
  }
  const [ys, ms, ds] = start.split("-").map(Number);
  const [yc, mc, dc] = current.split("-").map(Number);
  if (rule.freq === "MONTHLY") {
    const months = (yc - ys) * 12 + (mc - ms);
    return months >= 0 && months % rule.interval === 0 && dc === ds;
  }
  return yc >= ys && (yc - ys) % rule.interval === 0 && mc === ms && dc === ds;
}

function recurrenceDates(start: string, rule: Rule | null, untilDate: string) {
  if (!rule) return [start];
  const windowStart = addDays(madridToday(), -366 * 3);
  const horizon = addDays(madridToday(), 366 * 2);
  const limit = untilDate && untilDate < horizon ? untilDate : horizon;
  let cursor = start;
  if (!rule.count && start < windowStart) {
    cursor = rule.freq === "WEEKLY" ? addDays(windowStart, -7) : windowStart;
    if (cursor < start) cursor = start;
  }
  const dates: string[] = [];
  let seen = 0;
  for (let steps = 0; cursor <= limit && dates.length < 400 && steps < 8000; steps += 1) {
    if (matches(start, cursor, rule)) {
      seen += 1;
      if (rule.count && seen > rule.count) break;
      if (cursor >= windowStart) dates.push(cursor);
    }
    cursor = addDays(cursor, 1);
  }
  return dates;
}

function property(line: string) {
  const split = line.indexOf(":");
  if (split === -1) return null;
  const left = line.slice(0, split);
  const value = line.slice(split + 1);
  const [name, ...params] = left.split(";");
  const parsed: Record<string, string> = {};
  for (const param of params) {
    const [key, raw] = param.split("=");
    parsed[key.toUpperCase()] = raw ?? "";
  }
  return { name: name.toUpperCase(), params: parsed, value };
}

export function parseIcsEvents(source: string): RemoteEvent[] {
  const text = unfold(source);
  const events: RemoteEvent[] = [];
  for (const block of text.split("BEGIN:VEVENT").slice(1)) {
    const body = block.split("END:VEVENT")[0] ?? "";
    const fields = new Map<string, { params: Record<string, string>; value: string }>();
    const exdates = new Set<string>();
    let rule: Rule | null = null;
    for (const line of body.split("\n")) {
      const item = property(line.trim());
      if (!item) continue;
      if (item.name === "EXDATE") {
        for (const value of item.value.split(",")) {
          const when = wallTime(value, item.params);
          if (when) exdates.add(when.date);
        }
        continue;
      }
      if (item.name === "RRULE") {
        rule = parseRule(item.value);
        continue;
      }
      if (!fields.has(item.name)) fields.set(item.name, item);
    }
    const startRaw = fields.get("DTSTART");
    if (!startRaw) continue;
    const start = wallTime(startRaw.value, startRaw.params);
    if (!start?.date) continue;
    const untilRaw = rule?.until ? wallTime(rule.until, {}) : null;
    const title = unescapeIcs(fields.get("SUMMARY")?.value || "Cita");
    const place = unescapeIcs(fields.get("LOCATION")?.value || "");
    const notes = unescapeIcs(fields.get("DESCRIPTION")?.value || "");
    const uid = fields.get("UID")?.value || `${start.date}-${title}`;
    for (const date of recurrenceDates(start.date, rule, untilRaw?.date || "")) {
      if (exdates.has(date)) continue;
      events.push({
        id: `${uid}-${date}${start.time ? `-${start.time}` : ""}`,
        date,
        time: start.time,
        title,
        place,
        notes,
      });
    }
  }
  return events.sort((a, b) => `${a.date}${a.time}${a.title}`.localeCompare(`${b.date}${b.time}${b.title}`));
}

export async function fetchCalendarEvents(url: string) {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
      headers: { Accept: "text/calendar, text/plain, */*", "User-Agent": "ManyMakeups/1.0" },
    });
    if (!response.ok || isPrivateHost(new URL(response.url).hostname)) {
      return { events: [] as RemoteEvent[], error: "No he podido leer ese calendario." };
    }
    const text = await response.text();
    if (text.length > 2_000_000 || !text.includes("BEGIN:VCALENDAR")) {
      return { events: [] as RemoteEvent[], error: "Ese enlace no es un calendario." };
    }
    return { events: parseIcsEvents(text), error: "" };
  } catch {
    return { events: [] as RemoteEvent[], error: "No he podido leer ese calendario." };
  }
}

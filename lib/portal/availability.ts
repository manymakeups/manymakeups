import { eventSpans, fetchCalendarEvents, normalizeCalendarUrl } from "./calendar";
import { getStudioCalendars } from "./store";

const SLOT = 30;

type Span = { date: string; start: number; end: number };

/** Monday–Friday 10:00–14:00 and 16:00–19:00. Saturday 10:00–14:00. Sunday closed. */
export function bookingWindows(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  if (weekday === 0) return [];
  const morning = { start: 10 * 60, end: 14 * 60 };
  if (weekday === 6) return [morning];
  return [morning, { start: 16 * 60, end: 19 * 60 }];
}

function remaining(window: { start: number; end: number }, blocks: Span[]) {
  let open = [window];
  for (const block of blocks) {
    open = open.flatMap((span) => {
      if (block.end <= span.start || block.start >= span.end) return [span];
      const parts: Array<{ start: number; end: number }> = [];
      if (block.start > span.start) parts.push({ start: span.start, end: block.start });
      if (block.end < span.end) parts.push({ start: block.end, end: span.end });
      return parts;
    });
  }
  return open.some((span) => span.end - span.start >= SLOT);
}

export function dateIsBookable(date: string, spans: Span[]) {
  const windows = bookingWindows(date);
  if (!windows.length) return false;
  const mine = spans.filter((span) => span.date === date);
  return windows.some((window) => remaining(window, mine));
}

/** Dates with no opening left inside studio hours. Event titles stay on the server. */
export async function studioBusyDates() {
  const { primary, google, extra } = await getStudioCalendars();
  const feeds = [primary, google, extra]
    .map((url) => normalizeCalendarUrl(url))
    .filter((url): url is string => Boolean(url));
  const batches = await Promise.all(feeds.map((url) => fetchCalendarEvents(url)));
  const spans = batches.flatMap((batch) => batch.events.flatMap((event) => eventSpans(event)));
  const dates = new Set(spans.map((span) => span.date));
  return [...dates].filter((date) => !dateIsBookable(date, spans));
}

import { fetchCalendarEvents, normalizeCalendarUrl } from "./calendar";
import { getStudioCalendars } from "./store";

/** Dates that already have something on the studio calendars. Titles stay on the server. */
export async function studioBusyDates() {
  const { primary, google, extra } = await getStudioCalendars();
  const feeds = [primary, google, extra]
    .map((url) => normalizeCalendarUrl(url))
    .filter((url): url is string => Boolean(url));
  const batches = await Promise.all(feeds.map((url) => fetchCalendarEvents(url)));
  const dates = new Set<string>();
  for (const batch of batches) {
    for (const event of batch.events) dates.add(event.date);
  }
  return [...dates];
}

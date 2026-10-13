import { studioCalendarIcs, studioEvents, validCalendarToken } from "@/lib/portal/calendar";
import { listClients } from "@/lib/portal/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  if (!validCalendarToken(token)) {
    return new Response("No encontrado", { status: 404 });
  }
  const body = studioCalendarIcs(studioEvents(await listClients()));
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="manymakeups.ics"',
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}

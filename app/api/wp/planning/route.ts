import { NextResponse } from "next/server";
import { getPortalCopy } from "@/lib/i18n/portal-messages";
import { requestLocale } from "@/lib/portal/http";
import { fullName } from "@/lib/portal/names";
import { planningPdfFor } from "@/lib/portal/planning-document";
import { requirePlanner } from "@/lib/portal/session";
import { getClient } from "@/lib/portal/store";

export async function GET() {
  const session = await requirePlanner();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const client = await getClient(session.clientId);
  const planner = client?.planners.find((item) => item.id === session.sub);
  if (!client || !planner) return new NextResponse("Unauthorized", { status: 401 });
  const locale = await requestLocale();
  const pdf = await planningPdfFor(client, "evento", getPortalCopy(locale), locale);
  const name = fullName(client.event, client.name).replace(/[^\w.\- áéíóúüñÁÉÍÓÚÜÑ]+/gi, " ").trim() || "servicio";
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Planning ${name}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

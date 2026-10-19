import { NextResponse } from "next/server";
import { getPortalCopy } from "@/lib/i18n/portal-messages";
import { requestLocale } from "@/lib/portal/http";
import { fullName } from "@/lib/portal/names";
import { planningPdfFor, type PlanningPdfKind } from "@/lib/portal/planning-document";
import { requireClient, requirePlanner } from "@/lib/portal/session";
import { getClient } from "@/lib/portal/store";

function kindOf(value: string | null): PlanningPdfKind | null {
  if (value === "evento" || value === "glitter" || value === "beauty") return value;
  return null;
}

export async function GET(request: Request) {
  const planner = await requirePlanner();
  const session = planner ? null : await requireClient();
  if (!planner && !session) return new NextResponse("Unauthorized", { status: 401 });
  const client = await getClient(planner ? planner.clientId : session!.sub);
  if (!client || (planner && !client.planners.some((item) => item.id === planner.sub))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const kind = kindOf(new URL(request.url).searchParams.get("plan")) ?? "evento";
  if (kind === "glitter" && !client.event.glitterBar) return new NextResponse("Not found", { status: 404 });
  if (kind === "beauty" && !client.event.beautyCorner) return new NextResponse("Not found", { status: 404 });
  const locale = await requestLocale();
  const pdf = await planningPdfFor(client, kind, getPortalCopy(locale), locale);
  const who = fullName(client.event, client.name).replace(/[^\w.\- áéíóúüñÁÉÍÓÚÜÑ]+/gi, " ").trim() || "servicio";
  const title =
    kind === "glitter" ? "Glitter Bar" : kind === "beauty" ? "Beauty Corner" : "Planning";
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${title} ${who}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

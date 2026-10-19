import { NextResponse } from "next/server";
import { planningPdf } from "@/lib/portal/planning-pdf";
import { plannerPlanningLines } from "@/lib/portal/planner-view";
import { fullName } from "@/lib/portal/names";
import { requirePlanner } from "@/lib/portal/session";
import { getClient } from "@/lib/portal/store";

export async function GET() {
  const session = await requirePlanner();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const client = await getClient(session.clientId);
  const planner = client?.planners.find((item) => item.id === session.sub);
  if (!client || !planner) return new NextResponse("Unauthorized", { status: 401 });
  const pdf = planningPdf(plannerPlanningLines(client));
  const name = fullName(client.event, client.name).replace(/[^\w.\- áéíóúüñÁÉÍÓÚÜÑ]+/gi, " ").trim() || "servicio";
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Planning ${name}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

import { NextResponse } from "next/server";
import { getPortalCopy } from "@/lib/i18n/portal-messages";
import { requestLocale } from "@/lib/portal/http";
import { companionHeading, fullName } from "@/lib/portal/names";
import { productsPdf } from "@/lib/portal/products-document";
import { requireClient, requirePlanner } from "@/lib/portal/session";
import { getClient } from "@/lib/portal/store";
import { filledProducts, productsFor } from "@/lib/portal/types";

function personOf(value: string | null) {
  if (!value || value === "contractor") return "contractor" as const;
  if (/^\d+$/.test(value)) {
    const index = Number(value);
    if (index >= 0 && index < 20) return index;
  }
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
  const person = personOf(new URL(request.url).searchParams.get("person"));
  if (person == null) return new NextResponse("Not found", { status: 404 });
  const guest = typeof person === "number" ? client.event.people[person] : null;
  if (typeof person === "number" && !guest) return new NextResponse("Not found", { status: 404 });
  const locale = await requestLocale();
  const copy = getPortalCopy(locale);
  const source = guest ? guest.products : client.event.products;
  const legacy = (guest ? guest.productsUsed : client.event.productsUsed).trim();
  const makeup = filledProducts(productsFor(source, "maquillaje"));
  const hair = filledProducts(productsFor(source, "peinado"));
  if (!makeup.length && !hair.length && !legacy) return new NextResponse("Not found", { status: 404 });
  const guestNumber = typeof person === "number" ? person + 1 : 1;
  const name = guest
    ? companionHeading(guest, copy.whoOptions, copy.guestN.replace("{n}", String(guestNumber)))
    : fullName(client.event, client.name);
  const pdf = await productsPdf({
    name,
    makeup,
    hair,
    legacy: makeup.length || hair.length ? "" : legacy,
    copy,
  });
  const who = name.replace(/[^\w.\- áéíóúüñÁÉÍÓÚÜÑ]+/gi, " ").trim() || "productos";
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Productos ${who}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

import { NextResponse } from "next/server";
import { companionHeading, fullName } from "@/lib/portal/names";
import { getPortalCopy } from "@/lib/i18n/portal-messages";
import { requestLocale } from "@/lib/portal/http";
import { requireClient, requirePlanner } from "@/lib/portal/session";
import { getClient, readPortalFile } from "@/lib/portal/store";
import { CONTRACTOR_TRIAL_PHOTOS, filesFor, personTrialPhotoKey } from "@/lib/portal/types";
import { zipFiles } from "@/lib/portal/zip";

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
  const key = person === "contractor" ? CONTRACTOR_TRIAL_PHOTOS : personTrialPhotoKey(person);
  const photos = filesFor(client.workPhotos, key).slice(0, 40);
  const files = (
    await Promise.all(
      photos.map(async (photo) => {
        const payload = await readPortalFile(photo);
        return payload ? { name: photo.name || "foto", data: payload.buffer } : null;
      }),
    )
  ).filter((file) => file != null);
  if (!files.length) return new NextResponse("Not found", { status: 404 });
  const locale = await requestLocale();
  const copy = getPortalCopy(locale);
  const guest = typeof person === "number" ? client.event.people[person] : null;
  const guestNumber = typeof person === "number" ? person + 1 : 1;
  const name = guest
    ? companionHeading(guest, copy.whoOptions, copy.guestN.replace("{n}", String(guestNumber)))
    : fullName(client.event, client.name);
  const who = name.replace(/[^\w.\- áéíóúüñÁÉÍÓÚÜÑ]+/gi, " ").trim() || "fotos";
  return new NextResponse(new Uint8Array(zipFiles(files)), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="Fotos ${who}.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}

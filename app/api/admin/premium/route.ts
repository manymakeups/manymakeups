import { go } from "@/lib/portal/http";
import { mailPremiumPlanning } from "@/lib/portal/planning-mail";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";
import { asPlanning, type SidePlanning } from "@/lib/portal/types";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function flag(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

function sideFromForm(form: FormData): SidePlanning {
  return {
    on: true,
    location: text(form.get("location")),
    arrivalTime: text(form.get("arrivalTime")),
    arrivalEnd: text(form.get("arrivalEnd")),
    start: text(form.get("start")),
    end: text(form.get("end")),
    note: text(form.get("note")),
    packUpTime: text(form.get("packUpTime")),
    packUpEnd: text(form.get("packUpEnd")),
    packUp: text(form.get("packUp")),
  };
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = text(form.get("clientId"));
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  const intent = text(form.get("intent"));
  const current = client.event.planning;
  const back = `/privado/novias/${client.id}?tab=premium`;

  if (intent === "marks") {
    const glitterBar = flag(form.get("glitterBar"));
    const beautyCorner = flag(form.get("beautyCorner"));
    client.event.glitterBar = glitterBar;
    client.event.beautyCorner = beautyCorner;
    client.event.planning = asPlanning({
      ...current,
      glitter: { ...current.glitter, on: glitterBar },
      beauty: { ...current.beauty, on: beautyCorner },
    });
    await saveClient(client);
    return go(request, `${back}&ok=premium`);
  }

  const send = intent.endsWith("-send");
  const which = send ? intent.slice(0, -"-send".length) : intent;
  if (which !== "glitter" && which !== "beauty") return go(request, back);
  if (which === "glitter" && !client.event.glitterBar) return go(request, back);
  if (which === "beauty" && !client.event.beautyCorner) return go(request, back);
  client.event.planning = asPlanning({
    ...current,
    [which]: sideFromForm(form),
  });
  await saveClient(client);
  if (!send) return go(request, `${back}&sec=${which}&ok=premium`);
  const sent = await mailPremiumPlanning(client, which);
  return go(request, sent ? `${back}&sec=${which}&ok=premium-mail` : `${back}&sec=${which}&ok=premium&error=correo`);
}

import { go } from "@/lib/portal/http";
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
    arrivalTime: text(form.get("arrivalTime")),
    arrivalEnd: text(form.get("arrivalEnd")),
    start: text(form.get("start")),
    end: text(form.get("end")),
    note: text(form.get("note")),
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

  if (intent !== "glitter" && intent !== "beauty") return go(request, back);
  if (intent === "glitter" && !client.event.glitterBar) return go(request, back);
  if (intent === "beauty" && !client.event.beautyCorner) return go(request, back);
  client.event.planning = asPlanning({
    ...current,
    [intent]: sideFromForm(form),
  });
  await saveClient(client);
  return go(request, `${back}&sec=${intent}&ok=premium`);
}

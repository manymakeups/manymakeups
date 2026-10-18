import { go } from "@/lib/portal/http";
import { mailPlanning } from "@/lib/portal/planning-mail";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";
import { asPlanning } from "@/lib/portal/types";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = text(form.get("clientId"));
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  const slots = form.getAll("slotId").flatMap((value) => {
    const slotId = text(value);
    if (!/^(contractor|g:\d+)$/.test(slotId)) return [];
    return [{ id: slotId, time: text(form.get(`slotTime.${slotId}`)), note: text(form.get(`slotNote.${slotId}`)) }];
  });
  const extras = form.getAll("extraId").flatMap((value) => {
    const extraId = text(value);
    if (!/^[a-z0-9]{8,40}$/i.test(extraId)) return [];
    const preset = text(form.get(`extraPreset.${extraId}`));
    const label = preset === "otro" ? text(form.get(`extraCustom.${extraId}`)) : preset;
    return [
      {
        id: extraId,
        label,
        time: text(form.get(`extraTime.${extraId}`)),
        note: text(form.get(`extraNote.${extraId}`)),
      },
    ];
  });
  client.event.planning = asPlanning({
    location: text(form.get("location")),
    arrivalTime: text(form.get("arrivalTime")),
    setPrep: text(form.get("setPrep")),
    setPrepStart: text(form.get("setPrepStart")),
    setPrepEnd: text(form.get("setPrepEnd")),
    breaks: text(form.get("breaks")),
    breakTime: text(form.get("breakTime")),
    packUp: text(form.get("packUp")),
    packUpTime: text(form.get("packUpTime")),
    notes: text(form.get("notes")),
    slots,
    extras,
  });
  await saveClient(client);
  const back = `/privado/novias/${client.id}?tab=contratante&sec=planning`;
  if (text(form.get("intent")) !== "send") return go(request, `${back}&ok=planning`);
  const sent = await mailPlanning(client);
  return go(request, sent ? `${back}&ok=planning-mail` : `${back}&ok=planning&error=correo`);
}

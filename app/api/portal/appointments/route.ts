import { goPortal } from "@/lib/portal/http";
import { clientLabel, notifyStudio } from "@/lib/portal/notify";
import { requireClient } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const session = await requireClient();
  if (!session) return goPortal(request, "/area-novia");
  const client = await getClient(session.sub);
  if (!client) return goPortal(request, "/area-novia");
  const form = await request.formData();
  const id = text(form.get("id"));
  const item = client.appointments.find((entry) => entry.id === id);
  const back = "/area-novia/panel?tab=agenda&agenda=historico";
  if (!item || item.status === "hecha" || item.status === "anulada") return goPortal(request, back);
  const intent = text(form.get("intent"));
  if (intent === "cancel") {
    item.status = "anulada";
    const line = `${item.title || "Cita"} · ${item.date || "sin fecha"} ${item.time}`.trim();
    await saveClient(client, { kind: "agenda", scope: "contratante", message: `Ha anulado una cita.\n${line}` });
    await notifyStudio(`Cita anulada · ${clientLabel(client)}`, [line]);
    return goPortal(request, `${back}&ok=agenda`);
  }
  const date = text(form.get("date"));
  if (!date) return goPortal(request, back);
  item.date = date;
  item.time = text(form.get("time"));
  item.place = text(form.get("place"));
  item.notes = text(form.get("notes"));
  const line = `${item.title || "Cita"} · ${item.date} ${item.time}`.trim();
  await saveClient(client, {
    kind: "agenda",
    scope: "contratante",
    message: `Ha modificado una cita.\n${line}${item.place ? `\n${item.place}` : ""}`,
  });
  await notifyStudio(`Cita modificada · ${clientLabel(client)}`, [line, item.place]);
  return goPortal(request, `${back}&ok=agenda`);
}

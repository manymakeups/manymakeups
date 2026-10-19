import { NextResponse } from "next/server";
import { newId } from "@/lib/portal/crypto";
import { goPortal } from "@/lib/portal/http";
import { valueChange, valueChanges } from "@/lib/portal/notice-text";
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
  if (text(form.get("intent")) === "book") {
    const date = text(form.get("date"));
    const externalId = text(form.get("externalId")).slice(0, 240);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ ok: false }, { status: 400 });
    if (externalId && client.appointments.some((entry) => entry.externalId === externalId)) {
      return NextResponse.json({ ok: true });
    }
    client.appointments.push({
      id: newId(),
      title: "Cita",
      date,
      time: "",
      place: "",
      notes: "",
      amount: 0,
      status: "planificada",
      externalId: externalId || undefined,
    });
    await saveClient(client, {
      kind: "agenda",
      scope: "contratante",
      message: `Cita planificada · ${date}`,
    });
    return NextResponse.json({ ok: true });
  }
  const id = text(form.get("id"));
  const item = client.appointments.find((entry) => entry.id === id);
  const back = "/area-novia/panel?tab=agenda&agenda=historico";
  if (!item || item.status === "hecha" || item.status === "anulada") return goPortal(request, back);
  const intent = text(form.get("intent"));
  const previous = {
    title: item.title || "Cita",
    date: item.date,
    time: item.time,
    place: item.place,
    notes: item.notes,
  };
  if (intent === "cancel") {
    item.status = "anulada";
    const when = [previous.date, previous.time, previous.place].filter(Boolean).join(" · ");
    const message = valueChange(`Agenda · ${previous.title} · Estado`, when || "Planificada", "Anulada");
    await saveClient(client, { kind: "agenda", scope: "contratante", message });
    return goPortal(request, `${back}&ok=agenda`);
  }
  const date = text(form.get("date"));
  if (!date) return goPortal(request, back);
  item.date = date;
  item.time = text(form.get("time"));
  item.place = text(form.get("place"));
  item.notes = text(form.get("notes"));
  const message =
    valueChanges([
      { where: `Agenda · ${previous.title} · Fecha`, before: previous.date, after: item.date },
      { where: `Agenda · ${previous.title} · Hora`, before: previous.time, after: item.time },
      { where: `Agenda · ${previous.title} · Lugar`, before: previous.place, after: item.place },
      { where: `Agenda · ${previous.title} · Notas`, before: previous.notes, after: item.notes },
    ]) || valueChange(`Agenda · ${previous.title}`, "sin cambios", "sin cambios");
  await saveClient(client, {
    kind: "agenda",
    scope: "contratante",
    message,
  });
  return goPortal(request, `${back}&ok=agenda`);
}

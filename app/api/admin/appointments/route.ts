import { newId } from "@/lib/portal/crypto";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/lib/portal/types";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("clientId") ?? "");
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  const deleteId = text(form.get("deleteId"));
  if (deleteId) {
    client.appointments = client.appointments.filter((item) => item.id !== deleteId);
  } else {
    const statusRaw = text(form.get("status"));
    const status: AppointmentStatus = APPOINTMENT_STATUSES.includes(
      statusRaw as AppointmentStatus,
    )
      ? (statusRaw as AppointmentStatus)
      : "planificada";
    client.appointments.push({
      id: newId(),
      title: text(form.get("title")) || "Cita",
      date: text(form.get("date")),
      time: text(form.get("time")),
      place: text(form.get("place")),
      notes: text(form.get("notes")),
      status,
    });
  }
  await saveClient(client);
  return go(request, `/privado/novias/${client.id}?tab=agenda&ok=agenda`);
}

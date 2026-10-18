import { newId } from "@/lib/portal/crypto";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";
import { APPOINTMENT_STATUSES, APPOINTMENT_TITLES, type AppointmentStatus } from "@/lib/portal/types";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function money(value: string) {
  const amount = Number(value.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100) / 100;
}

function budgetLine(title: string) {
  if (title === "Maquillaje") return { title: "Sólo Maquillaje", name: "" };
  if (title === "Peinado") return { title: "Sólo peinado", name: "" };
  if (title === "Maquillaje y peinado") return { title: "Maquillaje y Peinado", name: "" };
  if (title === "Prueba") return { title: "Prueba", name: "" };
  if (title === "Tratamiento facial") return { title: "Tratamiento facial", name: title };
  if (title === "Tratamientos de ojos") return { title: "Servicios de ojos", name: title };
  if (title === "Curso") return { title: "Formaciones", name: title };
  return { title: "otro", name: title || "Cita" };
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
    client.history = client.history.filter((entry) => entry.appointmentId !== deleteId);
  } else {
    const statusRaw = text(form.get("status"));
    const status: AppointmentStatus = APPOINTMENT_STATUSES.includes(
      statusRaw as AppointmentStatus,
    )
      ? (statusRaw as AppointmentStatus)
      : "planificada";
    const titleRaw = text(form.get("title"));
    const title = (APPOINTMENT_TITLES as readonly string[]).includes(titleRaw)
      ? titleRaw
      : APPOINTMENT_TITLES[0];
    const appointmentId = newId();
    const amount = money(text(form.get("amount")));
    const date = text(form.get("date"));
    client.appointments.push({
      id: appointmentId,
      title,
      date,
      time: text(form.get("time")),
      place: text(form.get("place")),
      notes: text(form.get("notes")),
      amount,
      status,
    });
    if (amount > 0) {
      const line = budgetLine(title);
      client.history.push({
        id: newId(),
        kind: "servicio",
        title: line.title,
        name: line.name,
        date,
        notes: "",
        amount,
        paid: false,
        seenByClient: true,
        appointmentId,
        assignee: "contractor",
      });
    }
  }
  await saveClient(client);
  return go(request, `/privado/novias/${client.id}?tab=agenda&ok=agenda`);
}

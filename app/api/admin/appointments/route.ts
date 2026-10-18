import { newId } from "@/lib/portal/crypto";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";
import { APPOINTMENT_STATUSES, APPOINTMENT_TITLES, type Appointment, type AppointmentStatus, type ClientRecord } from "@/lib/portal/types";

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
  const intent = text(form.get("intent"));
  const editId = text(form.get("editId"));
  if (deleteId) {
    client.appointments = client.appointments.filter((item) => item.id !== deleteId);
    client.history = client.history.filter((entry) => entry.appointmentId !== deleteId);
  } else if (intent === "cancel" && editId) {
    const appointment = client.appointments.find((item) => item.id === editId);
    if (appointment) appointment.status = "anulada";
    await saveClient(client);
    return go(request, `/privado/novias/${client.id}?tab=agenda&ok=anulada`);
  } else if (intent === "update" && editId) {
    const appointment = client.appointments.find((item) => item.id === editId);
    if (appointment) {
      const next = readAppointment(form);
      const dateChanged = next.date !== appointment.date;
      appointment.title = next.title;
      appointment.date = next.date;
      appointment.time = next.time;
      appointment.place = next.place;
      appointment.notes = next.notes;
      appointment.amount = next.amount;
      appointment.status = next.status;
      if (dateChanged) appointment.reminder7For = undefined;
      syncCharge(client, appointment);
    }
  } else {
    const next = readAppointment(form);
    const appointmentId = newId();
    client.appointments.push({ id: appointmentId, ...next });
    if (next.amount > 0) {
      const line = budgetLine(next.title);
      client.history.push({
        id: newId(),
        kind: "servicio",
        title: line.title,
        name: line.name,
        date: next.date,
        notes: "",
        amount: next.amount,
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

function readAppointment(form: FormData) {
  const statusRaw = text(form.get("status"));
  const status: AppointmentStatus = APPOINTMENT_STATUSES.includes(statusRaw as AppointmentStatus)
    ? (statusRaw as AppointmentStatus)
    : "planificada";
  const titleRaw = text(form.get("title"));
  const title = (APPOINTMENT_TITLES as readonly string[]).includes(titleRaw) ? titleRaw : APPOINTMENT_TITLES[0];
  return {
    title,
    date: text(form.get("date")),
    time: text(form.get("time")),
    place: text(form.get("place")),
    notes: text(form.get("notes")),
    amount: money(text(form.get("amount"))),
    status,
  };
}

function syncCharge(client: ClientRecord, appointment: Appointment) {
  const existing = client.history.find((entry) => entry.appointmentId === appointment.id);
  if (appointment.amount > 0) {
    const line = budgetLine(appointment.title);
    if (existing) {
      existing.title = line.title;
      existing.name = line.name;
      existing.date = appointment.date;
      existing.amount = appointment.amount;
    } else {
      client.history.push({
        id: newId(),
        kind: "servicio",
        title: line.title,
        name: line.name,
        date: appointment.date,
        notes: "",
        amount: appointment.amount,
        paid: false,
        seenByClient: true,
        appointmentId: appointment.id,
        assignee: "contractor",
      });
    }
  } else if (existing) {
    client.history = client.history.filter((entry) => entry.appointmentId !== appointment.id);
  }
}

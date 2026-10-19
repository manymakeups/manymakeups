import { newId } from "@/lib/portal/crypto";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, listClients, saveClient } from "@/lib/portal/store";
import { APPOINTMENT_STATUSES, APPOINTMENT_TITLES, type Appointment, type AppointmentStatus, type ClientRecord } from "@/lib/portal/types";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function money(value: string) {
  const amount = Number(value.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100) / 100;
}

function budgetLine(title: string, calendar = false) {
  if (calendar && title === "Maquillaje") return { title: "Maquillaje", name: "Maquillaje" };
  if (calendar && title === "Peinado") return { title: "Peinado", name: "Peinado" };
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
  if (text(form.get("intent")) === "assign") return assignFromCalendar(request, form);
  const id = String(form.get("clientId") ?? "");
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  const deleteId = text(form.get("deleteId"));
  const intent = text(form.get("intent"));
  const editId = text(form.get("editId"));
  if (deleteId) {
    client.appointments = client.appointments.filter((item) => item.id !== deleteId);
    client.history = client.history.filter((entry) => entry.appointmentId !== deleteId);
    await saveClient(client);
    const next = text(form.get("next"));
    if (next.startsWith("/privado/calendario")) return go(request, next);
    return go(request, `/privado/novias/${client.id}?tab=agenda&ok=agenda`);
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

async function assignFromCalendar(request: Request, form: FormData) {
  const externalId = text(form.get("externalId")).slice(0, 240);
  const nextUrl = text(form.get("next"));
  const back = nextUrl.startsWith("/privado/calendario") ? nextUrl : "/privado/calendario";
  const join = back.includes("?") ? "&" : "?";
  const fail = () => go(request, `${back}${join}error=datos`);
  if (!externalId.startsWith("cal:")) return fail();
  const targetId = text(form.get("clientId"));
  const target = await getClient(targetId);
  if (!target) return fail();
  const next = readAppointment(form);
  if (!next.date) return fail();
  const owner = (await listClients()).find((item) => item.appointments.some((entry) => entry.externalId === externalId));
  const existing = owner?.appointments.find((entry) => entry.externalId === externalId);
  if (owner && owner.id !== target.id && existing) {
    const previous = await getClient(owner.id);
    if (previous) {
      previous.appointments = previous.appointments.filter((entry) => entry.id !== existing.id);
      previous.history = previous.history.filter((entry) => entry.appointmentId !== existing.id);
      await saveClient(previous);
    }
  }
  const current = await getClient(target.id);
  if (!current) return fail();
  const slot = current.appointments.find((entry) => entry.externalId === externalId);
  if (slot) {
    slot.title = next.title;
    slot.date = next.date;
    slot.time = next.time;
    slot.place = next.place;
    slot.notes = next.notes;
    slot.amount = next.amount;
    slot.status = next.status === "anulada" ? "planificada" : next.status;
    syncCharge(current, slot);
  } else {
    const appointment: Appointment = {
      id: existing && owner?.id !== target.id ? existing.id : newId(),
      title: next.title,
      date: next.date,
      time: next.time,
      place: next.place,
      notes: next.notes,
      amount: next.amount,
      status: next.status === "anulada" ? "planificada" : next.status,
      externalId,
    };
    current.appointments.push(appointment);
    syncCharge(current, appointment);
  }
  await saveClient(current);
  return go(request, `${back}${join}ok=asignada`);
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
  const calendar = Boolean(appointment.externalId?.startsWith("cal:"));
  const visit = calendar && (appointment.title === "Maquillaje" || appointment.title === "Peinado");
  if (appointment.amount > 0 || visit) {
    const line = budgetLine(appointment.title, calendar);
    if (existing) {
      existing.title = line.title;
      existing.name = line.name;
      existing.date = appointment.date;
      existing.notes = appointment.notes;
      existing.amount = appointment.amount;
    } else {
      client.history.push({
        id: newId(),
        kind: "servicio",
        title: line.title,
        name: line.name,
        date: appointment.date,
        notes: appointment.notes,
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

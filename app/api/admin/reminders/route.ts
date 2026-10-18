import { site } from "@/lib/site";
import { go } from "@/lib/portal/http";
import { deliverActivationReminder, deliverAppointmentReminder } from "@/lib/portal/reminders";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("clientId") ?? form.get("id") ?? "");
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  const intent = String(form.get("intent") ?? "");

  if (intent === "activation") {
    const ok = await deliverActivationReminder(client);
    await saveClient(client);
    if (!ok) {
      const invite = client.inviteToken
        ? `${site.url}/area-novia/activar?token=${encodeURIComponent(client.inviteToken)}`
        : "";
      const extra = invite
        ? `&invite=${encodeURIComponent(invite)}&client=${encodeURIComponent(client.id)}`
        : "";
      return go(request, `/privado/novias?ok=recordatorio&error=correo${extra}`);
    }
    return go(request, "/privado/novias?ok=recordatorio");
  }

  if (intent === "appointment") {
    const appointment = client.appointments.find((item) => item.id === String(form.get("appointmentId") ?? ""));
    const back = `/privado/novias/${client.id}?tab=agenda`;
    if (!appointment) return go(request, `${back}&error=cita`);
    const ok = await deliverAppointmentReminder(client, appointment);
    if (ok) await saveClient(client);
    return go(request, ok ? `${back}&ok=recordatorio` : `${back}&ok=recordatorio&error=correo`);
  }

  return go(request, `/privado/novias/${client.id}?tab=agenda`);
}

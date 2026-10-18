import { hashToken } from "@/lib/portal/crypto";
import { goPortal } from "@/lib/portal/http";
import { getClient, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const form = await request.formData();
  const clientId = String(form.get("cliente") ?? "");
  const appointmentId = String(form.get("cita") ?? "");
  const token = String(form.get("token") ?? "");
  const back = `/area-novia/confirmar-cita?cliente=${encodeURIComponent(clientId)}&cita=${encodeURIComponent(appointmentId)}&token=${encodeURIComponent(token)}`;
  const client = await getClient(clientId);
  const appointment = client?.appointments.find((item) => item.id === appointmentId);
  if (!client || !appointment || !token || appointment.confirmTokenHash !== hashToken(token)) {
    return goPortal(request, `${back}&error=1`);
  }
  appointment.status = "confirmada";
  await saveClient(client);
  return goPortal(request, `${back}&ok=1`);
}

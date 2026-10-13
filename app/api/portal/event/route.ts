import { contractorFromForm } from "@/lib/portal/event-parse";
import { go } from "@/lib/portal/http";
import { clientLabel, notifyStudio } from "@/lib/portal/notify";
import { requireClient } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const session = await requireClient();
  if (!session) return go(request, "/area-novia");
  const client = await getClient(session.sub);
  if (!client) return go(request, "/area-novia");
  client.event = contractorFromForm(await request.formData(), client.event);
  await saveClient(client);
  await notifyStudio(`Ficha de evento · ${clientLabel(client)}`, [
    `Nombre: ${client.event.clientName}`,
    `Pareja: ${client.event.partnerName || "—"}`,
    `Teléfono: ${client.event.phone || "—"}`,
    `Tipo: ${client.event.eventType}`,
    `Fecha: ${client.event.eventDate || "—"}`,
    `Lugar: ${client.event.venue || "—"}`,
  ]);
  return go(request, "/area-novia/panel?tab=contratante&ok=evento");
}

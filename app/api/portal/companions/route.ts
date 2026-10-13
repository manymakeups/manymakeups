import { companionsFromForm } from "@/lib/portal/event-parse";
import { go } from "@/lib/portal/http";
import { clientLabel, notifyStudio } from "@/lib/portal/notify";
import { requireClient } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const session = await requireClient();
  if (!session) return go(request, "/area-novia");
  const client = await getClient(session.sub);
  if (!client) return go(request, "/area-novia");
  client.event = companionsFromForm(await request.formData(), client.event);
  await saveClient(client);
  await notifyStudio(`Acompañantes · ${clientLabel(client)}`, [
    `Personas a atender: ${client.event.peopleCount}`,
    ...client.event.people.map((person, i) => {
      const trial = person.wantsTrial ? "con prueba" : "sin prueba";
      return `${i + 1}. ${person.who || "—"} · ${person.service} · ${trial}`;
    }),
  ]);
  return go(request, "/area-novia/panel?tab=acompanantes&ok=evento");
}

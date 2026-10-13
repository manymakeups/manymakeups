import { companionsFromForm } from "@/lib/portal/event-parse";
import { goPortal } from "@/lib/portal/http";
import { companionsSummary } from "@/lib/portal/notice-text";
import { clientLabel, notifyStudio } from "@/lib/portal/notify";
import { requireClient } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const session = await requireClient();
  if (!session) return goPortal(request, "/area-novia");
  const client = await getClient(session.sub);
  if (!client) return goPortal(request, "/area-novia");
  if (client.event.peopleLocked) {
    return goPortal(request, "/area-novia/panel?tab=acompanantes");
  }
  const event = {
    ...companionsFromForm(await request.formData(), client.event),
    peopleLocked: true,
  };
  client.event = event;
  const summary = companionsSummary(event);
  await saveClient(client, {
    kind: "acompanantes",
    scope: "acompanante",
    message: summary,
  });
  await notifyStudio(`Acompañantes · ${clientLabel(client)}`, summary.split("\n"));
  return goPortal(request, "/area-novia/panel?tab=acompanantes&ok=evento");
}

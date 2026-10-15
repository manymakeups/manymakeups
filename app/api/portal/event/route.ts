import { contractorFromForm } from "@/lib/portal/event-parse";
import { goPortal } from "@/lib/portal/http";
import { eventChangeMessage } from "@/lib/portal/notice-text";
import { clientLabel, notifyStudio } from "@/lib/portal/notify";
import { requireClient } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const session = await requireClient();
  if (!session) return goPortal(request, "/area-novia");
  const client = await getClient(session.sub);
  if (!client) return goPortal(request, "/area-novia");
  const form = await request.formData();
  if (String(form.get("intent") ?? "") === "trial-notes") {
    if (client.event.contractorLocked) {
      return goPortal(request, "/area-novia/panel?tab=contratante&sec=comentarios");
    }
    const previous = client.event;
    client.event = { ...client.event, trialNotes: String(form.get("trialNotes") ?? "").trim() };
    const message = eventChangeMessage(previous, client.event);
    await saveClient(client, {
      kind: "ficha",
      scope: "contratante",
      message,
    });
    await notifyStudio(`Ficha de evento · ${clientLabel(client)}`, message.split("\n"));
    return goPortal(request, "/area-novia/panel?tab=contratante&sec=comentarios&ok=evento");
  }
  if (client.event.contractorLocked) {
    return goPortal(request, "/area-novia/panel?tab=contratante");
  }
  const previous = client.event;
  const event = {
    ...contractorFromForm(form, previous),
    contractorLocked: true,
  };
  client.event = event;
  const message = eventChangeMessage(previous, event);
  await saveClient(client, {
    kind: "ficha",
    scope: "contratante",
    message,
  });
  await notifyStudio(`Ficha de evento · ${clientLabel(client)}`, message.split("\n"));
  return goPortal(request, "/area-novia/panel?tab=contratante&ok=evento");
}

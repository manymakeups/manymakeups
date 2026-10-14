import { companionsFromForm, peopleFields } from "@/lib/portal/event-parse";
import { goPortal } from "@/lib/portal/http";
import { companionsSummary } from "@/lib/portal/notice-text";
import { clientLabel, notifyStudio } from "@/lib/portal/notify";
import { requireClient } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";
import { emptyAttendee } from "@/lib/portal/types";

export async function POST(request: Request) {
  const session = await requireClient();
  if (!session) return goPortal(request, "/area-novia");
  const client = await getClient(session.sub);
  if (!client) return goPortal(request, "/area-novia");
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  if (intent === "add") {
    if (client.event.people.length >= 20) {
      return goPortal(request, "/area-novia/panel?tab=acompanantes");
    }
    const person = peopleFields(form, 0, emptyAttendee());
    client.event.people = [...client.event.people, person];
    client.event.peopleCount = client.event.people.length;
    client.event.peopleLocked = true;
    const summary = companionsSummary(client.event);
    await saveClient(client, {
      kind: "acompanantes",
      scope: "acompanante",
      message: summary,
    });
    await notifyStudio(`Acompañantes · ${clientLabel(client)}`, summary.split("\n"));
    return goPortal(request, "/area-novia/panel?tab=acompanantes&ok=evento");
  }
  if (client.event.peopleLocked) {
    return goPortal(request, "/area-novia/panel?tab=acompanantes");
  }
  const event = {
    ...companionsFromForm(form, client.event),
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

import { companionsFromForm, peopleFields } from "@/lib/portal/event-parse";
import { goPortal } from "@/lib/portal/http";
import { companionsChangeMessage, newCompanionMessage } from "@/lib/portal/notice-text";
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
    const message = newCompanionMessage(person, client.event.people.length - 1);
    await saveClient(client, {
      kind: "acompanantes",
      scope: "acompanante",
      personIndex: client.event.people.length - 1,
      message,
    });
    await notifyStudio(`Acompañantes · ${clientLabel(client)}`, message.split("\n"));
    return goPortal(request, "/area-novia/panel?tab=acompanantes&ok=evento");
  }
  if (client.event.peopleLocked) {
    return goPortal(request, "/area-novia/panel?tab=acompanantes");
  }
  const previous = client.event;
  const event = {
    ...companionsFromForm(form, previous),
    peopleLocked: true,
  };
  client.event = event;
  const message = companionsChangeMessage(previous, event);
  await saveClient(client, {
    kind: "acompanantes",
    scope: "acompanante",
    message,
  });
  await notifyStudio(`Acompañantes · ${clientLabel(client)}`, message.split("\n"));
  return goPortal(request, "/area-novia/panel?tab=acompanantes&ok=evento");
}

import { newId } from "@/lib/portal/crypto";
import { goPortal } from "@/lib/portal/http";
import { clientLabel, notifyStudio } from "@/lib/portal/notify";
import { requireClient } from "@/lib/portal/session";
import { addStudioNotice, getClient, mutateNotices } from "@/lib/portal/store";

export async function POST(request: Request) {
  const session = await requireClient();
  if (!session) return goPortal(request, "/area-novia");
  const client = await getClient(session.sub);
  if (!client) return goPortal(request, "/area-novia");
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const text = String(form.get("reply") ?? "").trim();
  const back = "/area-novia/panel?tab=historico";
  if (text.length < 2 || !id) return goPortal(request, `${back}&error=respuesta`);
  let found = false;
  let scope: "contratante" | "acompanante" = "contratante";
  let personIndex: number | undefined;
  await mutateNotices((notices) =>
    notices.map((notice) => {
      if (notice.id !== id || notice.clientId !== client.id) return notice;
      found = true;
      scope = notice.scope;
      personIndex = notice.personIndex;
      return {
        ...notice,
        replies: [
          ...notice.replies,
          { id: newId(), createdAt: new Date().toISOString(), text, fromClient: true },
        ],
      };
    }),
  );
  if (!found) return goPortal(request, back);
  await addStudioNotice(client.id, {
    kind: "respuesta",
    scope,
    personIndex,
    message: text,
  });
  await notifyStudio(`Respuesta · ${clientLabel(client)}`, [text]);
  return goPortal(request, `${back}&ok=respuesta`);
}

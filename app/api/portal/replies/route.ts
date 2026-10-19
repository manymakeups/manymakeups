import { newId } from "@/lib/portal/crypto";
import { goPortal } from "@/lib/portal/http";
import { valueChange } from "@/lib/portal/notice-text";
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
  let original = "";
  let scope: "contratante" | "acompanante" = "contratante";
  let personIndex: number | undefined;
  await mutateNotices((notices) =>
    notices.map((notice) => {
      if (notice.id !== id || notice.clientId !== client.id) return notice;
      found = true;
      original = notice.message;
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
  const notice = valueChange("Comunicaciones", original, text);
  await addStudioNotice(client.id, {
    kind: "respuesta",
    scope,
    personIndex,
    message: notice,
  });
  return goPortal(request, `${back}&ok=respuesta`);
}

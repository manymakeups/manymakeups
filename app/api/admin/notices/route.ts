import { mailClient } from "@/lib/portal/client-mail";
import { newId } from "@/lib/portal/crypto";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { addStudioNotice, getClient, mutateNotices } from "@/lib/portal/store";

function idsFrom(form: FormData) {
  const listed = form.getAll("ids").map((value) => String(value)).filter(Boolean);
  const single = String(form.get("id") ?? "");
  if (listed.length) return [...new Set(listed)];
  return single ? [single] : [];
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "read");
  const next = String(form.get("next") ?? "/privado/avisos");
  const safeNext = next.startsWith("/privado") ? next : "/privado/avisos";
  const ids = idsFrom(form);

  if (intent === "compose") {
    const clientId = String(form.get("clientId") ?? "");
    const message = String(form.get("message") ?? "").trim();
    const join = safeNext.includes("?") ? "&" : "?";
    if (message.length < 2 || !clientId) return go(request, `${safeNext}${join}error=mensaje`);
    const client = await getClient(clientId);
    if (!client) return go(request, safeNext);
    await addStudioNotice(clientId, {
      kind: "cambio",
      scope: "contratante",
      message,
      fromStudio: true,
    });
    const sent = await mailClient(client, "reply", { reply: message, original: "" });
    return go(request, sent ? `${safeNext}${join}ok=mensaje` : `${safeNext}${join}ok=mensaje&error=correo`);
  }

  if (intent === "readAll") {
    await mutateNotices((notices) => notices.map((notice) => ({ ...notice, read: true })));
    return go(request, safeNext);
  }

  if (intent === "unreadAll") {
    await mutateNotices((notices) => notices.map((notice) => ({ ...notice, read: false })));
    return go(request, safeNext);
  }

  if (!ids.length) return go(request, safeNext);

  if (intent === "delete") {
    const chosen = new Set(ids);
    await mutateNotices((notices) => notices.filter((notice) => !chosen.has(notice.id)));
    return go(request, safeNext);
  }

  if (intent === "read" || intent === "unread") {
    const chosen = new Set(ids);
    const read = intent === "read";
    await mutateNotices((notices) =>
      notices.map((notice) => (chosen.has(notice.id) ? { ...notice, read } : notice)),
    );
    return go(request, safeNext);
  }

  if (intent === "reply") {
    const text = String(form.get("reply") ?? "").trim();
    const id = ids[0];
    const join = safeNext.includes("?") ? "&" : "?";
    if (text.length < 2 || !id) return go(request, `${safeNext}${join}error=respuesta`);
    let clientId = "";
    let original = "";
    await mutateNotices((notices) =>
      notices.map((notice) => {
        if (notice.id !== id) return notice;
        clientId = notice.clientId;
        original = notice.message;
        return {
          ...notice,
          read: notice.fromStudio ? false : true,
          replies: [
            ...notice.replies,
            { id: newId(), createdAt: new Date().toISOString(), text },
          ],
        };
      }),
    );
    let sent = false;
    if (clientId) {
      const client = await getClient(clientId);
      if (client) {
        sent = await mailClient(client, "reply", { reply: text, original });
      }
    }
    return go(request, sent ? `${safeNext}${join}ok=respuesta` : `${safeNext}${join}error=correo`);
  }

  return go(request, safeNext);
}

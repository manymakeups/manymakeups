import { NextResponse } from "next/server";
import { newId } from "@/lib/portal/crypto";
import { INSPIRATION_MAX, isImageUpload, maxBytes, safeFileName } from "@/lib/portal/files";
import { goPortal } from "@/lib/portal/http";
import { clientLabel, notifyStudio } from "@/lib/portal/notify";
import { requireClient } from "@/lib/portal/session";
import { deletePortalFile, getClient, putPortalFile, saveClient } from "@/lib/portal/store";
import { CONTRACTOR_INSPIRATION, type PortalFile } from "@/lib/portal/types";

function personLabel(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return CONTRACTOR_INSPIRATION;
  if (value === CONTRACTOR_INSPIRATION || value === "contratante-maquillaje" || value === "contratante-peinado") {
    return value;
  }
  const match = /^persona-(\d+)(?:-(maquillaje|peinado))?$/.exec(value);
  if (!match) return CONTRACTOR_INSPIRATION;
  const index = Number(match[1]);
  if (!Number.isInteger(index) || index < 0 || index > 19) return CONTRACTOR_INSPIRATION;
  return value;
}

export async function POST(request: Request) {
  const session = await requireClient();
  if (!session) return goPortal(request, "/area-novia");
  const client = await getClient(session.sub);
  if (!client) return goPortal(request, "/area-novia");
  const form = await request.formData();
  const uploads = form
    .getAll("files")
    .filter((item): item is File => item instanceof File && item.size > 0);
  if (client.inspiration.length + uploads.length > INSPIRATION_MAX) {
    return goPortal(request, "/area-novia/panel?error=limite");
  }
  const added: string[] = [];
  for (const upload of uploads) {
    if (!isImageUpload(upload) || upload.size > maxBytes("inspiration")) {
      return goPortal(request, "/area-novia/panel?error=archivo");
    }
    const id = newId();
    const record: PortalFile = {
      id,
      name: safeFileName(upload.name),
      pathname: `portal/files/${client.id}/inspiration/${id}`,
      mime: upload.type,
      size: upload.size,
      uploadedAt: new Date().toISOString(),
      kind: "inspiration",
      label: personLabel(form.get("person")),
    };
    await putPortalFile(record, Buffer.from(await upload.arrayBuffer()));
    client.inspiration.push(record);
    added.push(record.name);
  }
  const label = personLabel(form.get("person"));
  const where = inspirationWhere(label);
  const lines = [`${added.length} foto(s) en ${where}.`, ...added];
  const place = inspirationScope(label);
  await saveClient(
    client,
    added.length
      ? { kind: "fotos", scope: place.scope, personIndex: place.personIndex, message: lines.join("\n") }
      : undefined,
  );
  if (added.length) {
    await notifyStudio(`Inspiración nueva · ${clientLabel(client)}`, lines);
  }
  const tab = typeof form.get("tab") === "string" && form.get("tab") ? String(form.get("tab")) : "contratante";
  const sec = typeof form.get("sec") === "string" ? String(form.get("sec")) : "";
  const section = sec ? `&sec=${encodeURIComponent(sec)}` : "";
  return goPortal(request, `/area-novia/panel?tab=${encodeURIComponent(tab)}${section}&ok=fotos`);
}

export async function DELETE(request: Request) {
  const session = await requireClient();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const client = await getClient(session.sub);
  if (!client) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = (await request.json()) as { id?: string };
  const file = client.inspiration.find((item) => item.id === id);
  if (!file) return NextResponse.json({ ok: false }, { status: 404 });
  await deletePortalFile(file);
  client.inspiration = client.inspiration.filter((item) => item.id !== id);
  const where = inspirationWhere(file.label);
  const place = inspirationScope(file.label);
  const message = `Ha quitado una foto de ${where}.`;
  await saveClient(client, { kind: "fotos", scope: place.scope, personIndex: place.personIndex, message });
  await notifyStudio(`Inspiración quitada · ${clientLabel(client)}`, [message]);
  return NextResponse.json({ ok: true });
}

function inspirationScope(label: string) {
  const person = /^persona-(\d+)/.exec(label);
  if (!person) return { scope: "contratante" as const };
  return { scope: "acompanante" as const, personIndex: Number(person[1]) };
}

function inspirationWhere(label: string) {
  const person = /^persona-(\d+)(?:-(maquillaje|peinado))?$/.exec(label);
  if (person) {
    const who = `acompañante ${Number(person[1]) + 1}`;
    if (person[2] === "peinado") return `${who}, peinado`;
    if (person[2] === "maquillaje") return `${who}, maquillaje`;
    return who;
  }
  if (label.includes("peinado")) return "su peinado";
  return "su maquillaje";
}

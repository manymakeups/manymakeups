import { NextResponse } from "next/server";
import { newId } from "@/lib/portal/crypto";
import { INSPIRATION_MAX, isImageUpload, maxBytes, portalFileHref, safeFileName } from "@/lib/portal/files";
import { goPortal } from "@/lib/portal/http";
import { inspirationPlace, valueChange } from "@/lib/portal/notice-text";
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
  const added: PortalFile[] = [];
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
    added.push(record);
  }
  const label = personLabel(form.get("person"));
  const where = inspirationPlace(label, client.event.people);
  const message = valueChange(where, "", added.map((file) => file.name).join(", "));
  const place = inspirationScope(label);
  await saveClient(
    client,
    added.length
      ? {
          kind: "fotos",
          scope: place.scope,
          personIndex: place.personIndex,
          message,
          links: added.map((file) => ({ href: portalFileHref(client.id, file.id), label: file.name })),
        }
      : undefined,
  );
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
  const place = inspirationScope(file.label);
  const message = valueChange(inspirationPlace(file.label, client.event.people), file.name, "");
  await saveClient(client, { kind: "fotos", scope: place.scope, personIndex: place.personIndex, message });
  return NextResponse.json({ ok: true });
}

function inspirationScope(label: string) {
  const person = /^persona-(\d+)/.exec(label);
  if (!person) return { scope: "contratante" as const };
  return { scope: "acompanante" as const, personIndex: Number(person[1]) };
}


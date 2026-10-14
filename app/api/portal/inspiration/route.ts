import { NextResponse } from "next/server";
import { newId } from "@/lib/portal/crypto";
import { INSPIRATION_MAX, isImageUpload, maxBytes, safeFileName } from "@/lib/portal/files";
import { goPortal } from "@/lib/portal/http";
import { clientLabel, notifyStudio } from "@/lib/portal/notify";
import { requireClient } from "@/lib/portal/session";
import { deletePortalFile, getClient, putPortalFile, saveClient } from "@/lib/portal/store";
import {
  CONTRACTOR_INSPIRATION,
  personInspirationKey,
  type PortalFile,
} from "@/lib/portal/types";

function personLabel(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return CONTRACTOR_INSPIRATION;
  if (value === CONTRACTOR_INSPIRATION) return value;
  const match = /^persona-(\d+)$/.exec(value);
  if (!match) return CONTRACTOR_INSPIRATION;
  const index = Number(match[1]);
  if (!Number.isInteger(index) || index < 0 || index > 19) return CONTRACTOR_INSPIRATION;
  return personInspirationKey(index);
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
  await saveClient(client);
  if (added.length) {
    await notifyStudio(`Inspiración nueva · ${clientLabel(client)}`, [
      `${added.length} foto(s): ${added.join(", ")}`,
    ]);
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
  await saveClient(client);
  return NextResponse.json({ ok: true });
}

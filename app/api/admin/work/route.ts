import { NextResponse } from "next/server";
import { newId } from "@/lib/portal/crypto";
import { isImageUpload, maxBytes, safeFileName } from "@/lib/portal/files";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { deletePortalFile, getClient, putPortalFile, saveClient } from "@/lib/portal/store";
import {
  CONTRACTOR_TRIAL_PHOTOS,
  personTrialPhotoKey,
  type PortalFile,
} from "@/lib/portal/types";

function personLabel(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return CONTRACTOR_TRIAL_PHOTOS;
  if (value === CONTRACTOR_TRIAL_PHOTOS) return value;
  const match = /^prueba-persona-(\d+)$/.exec(value);
  if (!match) return CONTRACTOR_TRIAL_PHOTOS;
  const index = Number(match[1]);
  if (!Number.isInteger(index) || index < 0 || index > 19) return CONTRACTOR_TRIAL_PHOTOS;
  return personTrialPhotoKey(index);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const clientId = String(form.get("clientId") ?? "");
  const tab = typeof form.get("tab") === "string" ? form.get("tab") : "contratante";
  const sec = typeof form.get("sec") === "string" ? String(form.get("sec")) : "";
  const section = sec ? `&sec=${encodeURIComponent(sec)}` : "";
  const client = await getClient(clientId);
  if (!client) return go(request, "/privado/novias?error=datos");
  const uploads = form
    .getAll("files")
    .filter((item): item is File => item instanceof File && item.size > 0);
  for (const upload of uploads) {
    if (!isImageUpload(upload) || upload.size > maxBytes("work")) {
      return go(request, `/privado/novias/${client.id}?tab=${tab}${section}&error=archivo`);
    }
    const id = newId();
    const record: PortalFile = {
      id,
      name: safeFileName(upload.name),
      pathname: `portal/files/${client.id}/work/${id}`,
      mime: upload.type,
      size: upload.size,
      uploadedAt: new Date().toISOString(),
      kind: "work",
      label: personLabel(form.get("person")),
    };
    await putPortalFile(record, Buffer.from(await upload.arrayBuffer()));
    client.workPhotos.push(record);
  }
  await saveClient(client);
  return go(request, `/privado/novias/${client.id}?tab=${tab}${section}&ok=fotos`);
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const { clientId, id } = (await request.json()) as { clientId?: string; id?: string };
  const client = clientId ? await getClient(clientId) : null;
  const file = client?.workPhotos.find((item) => item.id === id);
  if (!client || !file) return NextResponse.json({ ok: false }, { status: 404 });
  await deletePortalFile(file);
  client.workPhotos = client.workPhotos.filter((item) => item.id !== id);
  await saveClient(client);
  return NextResponse.json({ ok: true });
}

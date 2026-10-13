import { NextResponse } from "next/server";
import { newId } from "@/lib/portal/crypto";
import { allowedType, maxBytes, safeFileName } from "@/lib/portal/files";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { deletePortalFile, getClient, putPortalFile, saveClient } from "@/lib/portal/store";
import type { PortalFile } from "@/lib/portal/types";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const clientId = String(form.get("clientId") ?? "");
  const label = String(form.get("label") ?? "").trim() || "Documento";
  const upload = form.get("file");
  const client = await getClient(clientId);
  if (!client || !(upload instanceof File) || !upload.size) {
    return go(request, "/privado/novias?error=archivo");
  }
  if (!allowedType("document", upload.type) || upload.size > maxBytes("document")) {
    return go(request, `/privado/novias/${client.id}?error=archivo`);
  }
  const id = newId();
  const record: PortalFile = {
    id,
    name: safeFileName(upload.name),
    pathname: `portal/files/${client.id}/documents/${id}`,
    mime: upload.type,
    size: upload.size,
    uploadedAt: new Date().toISOString(),
    kind: "document",
    label,
  };
  await putPortalFile(record, Buffer.from(await upload.arrayBuffer()));
  client.documents.push(record);
  await saveClient(client);
  return go(request, `/privado/novias/${client.id}?ok=doc`);
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const { clientId, id } = (await request.json()) as { clientId?: string; id?: string };
  const client = clientId ? await getClient(clientId) : null;
  const file = client?.documents.find((item) => item.id === id);
  if (!client || !file) return NextResponse.json({ ok: false }, { status: 404 });
  await deletePortalFile(file);
  client.documents = client.documents.filter((item) => item.id !== id);
  await saveClient(client);
  return NextResponse.json({ ok: true });
}

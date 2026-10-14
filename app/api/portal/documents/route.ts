import { newId } from "@/lib/portal/crypto";
import { allowedType, isImageUpload, maxBytes, safeFileName } from "@/lib/portal/files";
import { goPortal } from "@/lib/portal/http";
import { valueChange } from "@/lib/portal/notice-text";
import { clientLabel, notifyStudio } from "@/lib/portal/notify";
import { requireClient } from "@/lib/portal/session";
import { getClient, putPortalFile, saveClient } from "@/lib/portal/store";
import type { PortalFile } from "@/lib/portal/types";

function isDocument(file: File) {
  if (allowedType("document", file.type) || isImageUpload(file)) return true;
  return /\.pdf$/i.test(file.name);
}

export async function POST(request: Request) {
  const session = await requireClient();
  if (!session) return goPortal(request, "/area-novia");
  const client = await getClient(session.sub);
  if (!client) return goPortal(request, "/area-novia");
  const form = await request.formData();
  const upload = form.get("file");
  if (!(upload instanceof File) || !upload.size || !isDocument(upload) || upload.size > maxBytes("document")) {
    return goPortal(request, "/area-novia/panel?tab=documentacion&error=archivo");
  }
  const id = newId();
  const mime = upload.type || (/\.pdf$/i.test(upload.name) ? "application/pdf" : "application/octet-stream");
  const record: PortalFile = {
    id,
    name: safeFileName(upload.name),
    pathname: `portal/files/${client.id}/documents/${id}`,
    mime,
    size: upload.size,
    uploadedAt: new Date().toISOString(),
    kind: "document",
    label: "Clienta",
  };
  await putPortalFile(record, Buffer.from(await upload.arrayBuffer()));
  client.documents.push(record);
  const message = valueChange("Documentación", "", record.name);
  await saveClient(client, { kind: "documento", scope: "contratante", message });
  await notifyStudio(`Documentación nueva · ${clientLabel(client)}`, [message]);
  return goPortal(request, "/area-novia/panel?tab=documentacion&ok=doc");
}

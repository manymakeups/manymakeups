"use client";

import { useRef, useState } from "react";
import { DeleteFileButton } from "@/app/components/portal/FileActions";
import { isImageType, portalFileHref } from "@/lib/portal/files";
import { filesFor, type FileKind, type PortalFile } from "@/lib/portal/types";

export function PhotoGrid({
  files,
  clientId,
  canDelete,
  kind,
}: {
  files: PortalFile[];
  clientId: string;
  canDelete?: boolean;
  kind: FileKind;
}) {
  if (!files.length) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {files.map((file) => (
        <li key={file.id} className="border border-ink/10 bg-white/40 p-2">
          {isImageType(file.mime) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portalFileHref(clientId, file.id)}
              alt=""
              className="aspect-[4/5] w-full object-cover"
            />
          ) : null}
          <p className="mt-2 truncate text-xs">{file.name}</p>
          {canDelete ? (
            <DeleteFileButton id={file.id} clientId={clientId} kind={kind} label="Quitar" />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function PhotoPicker({
  personKey,
  files,
  clientId,
  action,
  fieldName = "person",
  label = "Inspiraciones",
  tab,
  kind = "inspiration",
}: {
  personKey: string;
  files: PortalFile[];
  clientId: string;
  action: string;
  fieldName?: string;
  label?: string;
  tab?: string;
  kind?: FileKind;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const shown = filesFor(files, personKey);

  async function upload() {
    const chosen = inputRef.current?.files;
    if (!chosen?.length) return;
    const body = new FormData();
    body.set(fieldName, personKey);
    if (tab) body.set("tab", tab);
    body.set("clientId", clientId);
    for (const file of chosen) body.append("files", file);
    setBusy(true);
    await fetch(action, { method: "POST", body });
    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="field-label">
        {label}
        <input
          ref={inputRef}
          className="field"
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
        />
      </label>
      <button className="btn-atelier self-start" type="button" disabled={busy} onClick={upload}>
        {busy ? "Subiendo…" : "Adjuntar fotos"}
      </button>
      <PhotoGrid files={shown} clientId={clientId} canDelete kind={kind} />
    </div>
  );
}

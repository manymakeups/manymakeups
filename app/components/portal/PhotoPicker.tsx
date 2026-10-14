"use client";

import { useEffect, useRef, useState } from "react";
import { DeleteFileButton } from "@/app/components/portal/FileActions";
import { usePortalCopy } from "@/app/components/portal/usePortalCopy";
import { isImageType, portalFileHref } from "@/lib/portal/files";
import { filesFor, type FileKind, type PortalFile } from "@/lib/portal/types";

function PhotoBook({
  images,
  clientId,
  onClose,
  closeLabel,
  canDelete,
  kind,
  removeLabel,
  confirmText,
}: {
  images: PortalFile[];
  clientId: string;
  onClose: () => void;
  closeLabel: string;
  canDelete?: boolean;
  kind: FileKind;
  removeLabel: string;
  confirmText?: string;
}) {
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<1 | -1 | 0>(0);
  const [hold, setHold] = useState(false);
  const startX = useRef(0);
  const closeRef = useRef(onClose);
  const indexRef = useRef(index);
  const turnRef = useRef(turn);
  const holdRef = useRef(hold);
  closeRef.current = onClose;
  indexRef.current = index;
  turnRef.current = turn;
  holdRef.current = hold;
  const page = images[index];

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const dir = event.key === "ArrowRight" ? 1 : -1;
      if (turnRef.current !== 0 || holdRef.current) return;
      const next = indexRef.current + dir;
      if (next < 0 || next >= images.length) return;
      setTurn(dir);
    }
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [images.length]);

  const turned = useRef(false);

  function go(dir: 1 | -1) {
    if (turn !== 0 || hold) return;
    const next = index + dir;
    if (next < 0 || next >= images.length) return;
    turned.current = false;
    setTurn(dir);
  }

  function finishTurn() {
    if (turned.current || turn === 0) return;
    turned.current = true;
    const dir = turn;
    setHold(true);
    setIndex((current) => current + dir);
    setTurn(0);
    requestAnimationFrame(() => {
      setHold(false);
      turned.current = false;
    });
  }

  useEffect(() => {
    if (turn === 0) return;
    const timer = window.setTimeout(finishTurn, 1040);
    return () => window.clearTimeout(timer);
  }, [turn]);

  const under = images[Math.min(images.length - 1, Math.max(0, index + (turn === 0 ? 1 : turn)))];

  return (
    <div className="fixed inset-0 z-[80]" role="presentation">
      <button type="button" className="absolute inset-0 bg-ink/70" aria-label={closeLabel} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${index + 1} / ${images.length}`}
        className="pointer-events-none relative flex min-h-full items-center justify-center overflow-y-auto p-4"
      >
        <div className="pointer-events-auto flex w-[min(92vw,420px)] flex-col items-center">
        <div className="mb-4 flex w-full max-w-md items-center justify-between text-porcelain">
          <p className="text-[0.68rem] uppercase tracking-[0.16em]">
            {index + 1} / {images.length}
          </p>
          <button className="text-[0.68rem] uppercase tracking-[0.16em] text-porcelain/80 hover:text-porcelain" type="button" onClick={onClose} autoFocus>
            {closeLabel}
          </button>
        </div>
        <div
          className="relative aspect-[4/5] w-[min(78vw,420px)] [perspective:900px]"
          onPointerDown={(event) => {
            startX.current = event.clientX;
          }}
          onPointerUp={(event) => {
            const delta = event.clientX - startX.current;
            if (Math.abs(delta) > 40) {
              go(delta < 0 ? 1 : -1);
              return;
            }
            const rect = event.currentTarget.getBoundingClientRect();
            go(event.clientX - rect.left > rect.width / 2 ? 1 : -1);
          }}
        >
          {under && under.id !== page?.id ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={portalFileHref(clientId, under.id)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-linen" />
          )}
          {turn !== 0 ? <div className={turn === -1 ? "page-cast-back" : "page-cast"} /> : null}
          {page ? (
            <div
              key={`${page.id}-${hold ? "hold" : "live"}`}
              className={`page-sheet ${hold ? "" : turn === 1 ? "page-peel-forward" : turn === -1 ? "page-peel-back" : ""}`}
              onAnimationEnd={(event) => {
                if (event.animationName.startsWith("page-peel")) finishTurn();
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portalFileHref(clientId, page.id)} alt="" className="h-full w-full object-cover [backface-visibility:hidden]" />
              <span className="page-crease" />
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex w-full max-w-md items-center justify-between text-porcelain">
          <button className="text-[0.68rem] uppercase tracking-[0.16em] disabled:opacity-30" type="button" onClick={() => go(-1)} disabled={index === 0}>
            ←
          </button>
          <button className="text-[0.68rem] uppercase tracking-[0.16em] disabled:opacity-30" type="button" onClick={() => go(1)} disabled={index >= images.length - 1}>
            →
          </button>
        </div>
        {canDelete && page ? (
          <div className="mt-4 bg-porcelain px-4 py-2">
            <DeleteFileButton id={page.id} clientId={clientId} kind={kind} label={removeLabel} confirmText={confirmText} />
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}

export function PhotoGrid({
  files,
  clientId,
  canDelete,
  kind,
  removeLabel,
  confirmText,
  openLabel = "Ver fotos",
  closeLabel = "Cerrar",
}: {
  files: PortalFile[];
  clientId: string;
  canDelete?: boolean;
  kind: FileKind;
  removeLabel?: string;
  confirmText?: string;
  openLabel?: string;
  closeLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const images = files.filter((file) => isImageType(file.mime));
  if (!images.length) return null;
  const cover = images[0];
  const depth = Math.min(images.length - 1, 3);
  return (
    <>
      <button
        type="button"
        className="relative mb-4 mr-8 block w-40 text-left sm:w-48"
        onClick={() => setOpen(true)}
        aria-label={`${openLabel}, ${images.length}`}
      >
        <span className="relative block">
          {Array.from({ length: depth }, (_, layer) => {
            const step = depth - layer;
            return (
              <span
                key={step}
                aria-hidden
                className="absolute inset-0 border border-ink/10 bg-[#f7f3ec] shadow-sm"
                style={{ transform: `translate(${step * 7}px, ${step * 5}px) rotate(${step * 1.8}deg)` }}
              />
            );
          })}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={portalFileHref(clientId, cover.id)} alt="" className="relative aspect-[4/5] w-full object-cover shadow-[0_16px_30px_rgba(26,22,19,0.16)]" />
          {images.length > 1 ? (
            <span className="absolute right-2 top-2 bg-ink px-2 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-porcelain">
              {images.length}
            </span>
          ) : null}
        </span>
      </button>
      {open ? (
        <PhotoBook
          images={images}
          clientId={clientId}
          onClose={() => setOpen(false)}
          closeLabel={closeLabel}
          canDelete={canDelete}
          kind={kind}
          removeLabel={removeLabel || "Quitar"}
          confirmText={confirmText}
        />
      ) : null}
    </>
  );
}

export function PhotoPicker({
  personKey,
  files,
  clientId,
  action,
  fieldName = "person",
  label,
  tab,
  kind = "inspiration",
  localize = false,
}: {
  personKey: string;
  files: PortalFile[];
  clientId: string;
  action: string;
  fieldName?: string;
  label?: string;
  tab?: string;
  kind?: FileKind;
  localize?: boolean;
}) {
  const copy = usePortalCopy();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const shown = filesFor(files, personKey);
  const fieldLabel = label ?? (localize ? copy.inspiration : "Inspiraciones");
  const attach = localize ? copy.attachPhotos : "Adjuntar fotos";
  const uploading = localize ? copy.uploading : "Subiendo…";
  const remove = localize ? copy.remove : "Quitar";
  const confirmText = localize ? copy.removeConfirm : "¿Quitar este archivo?";

  async function prepare(file: File) {
    if (file.type === "image/gif" || (file.size < 1_200_000 && /jpe?g|png|webp/i.test(file.type))) return file;
    if (typeof createImageBitmap !== "function") return file;
    try {
      const bitmap = await createImageBitmap(file);
      const longest = Math.max(bitmap.width, bitmap.height);
      const scale = Math.min(1, 1800 / longest);
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return file;
      context.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
      if (!blob) return file;
      const name = file.name.replace(/\.[^.]+$/, "") || "foto";
      return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
    } catch {
      return file;
    }
  }

  async function upload(list?: FileList | File[] | null) {
    const chosen = [...(list ?? inputRef.current?.files ?? [])];
    if (!chosen.length) {
      inputRef.current?.click();
      return;
    }
    setBusy(true);
    try {
      const ready: File[] = [];
      for (const file of chosen) ready.push(await prepare(file));
      const chunks: File[][] = [];
      let chunk: File[] = [];
      let size = 0;
      for (const file of ready) {
        if (chunk.length && size + file.size > 3_500_000) {
          chunks.push(chunk);
          chunk = [];
          size = 0;
        }
        chunk.push(file);
        size += file.size;
      }
      if (chunk.length) chunks.push(chunk);
      let landed = "";
      for (const group of chunks) {
        const body = new FormData();
        body.set(fieldName, personKey);
        if (tab) body.set("tab", tab);
        body.set("clientId", clientId);
        for (const file of group) body.append("files", file);
        const response = await fetch(action, { method: "POST", body });
        landed = response.url;
        if (response.url.includes("error=")) break;
      }
      if (inputRef.current) inputRef.current.value = "";
      if (landed) {
        const next = new URL(landed);
        window.location.assign(`${next.pathname}${next.search}`);
        return;
      }
      window.location.reload();
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="field-label">{fieldLabel}</p>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        onChange={(event) => {
          const picked = event.currentTarget.files;
          if (picked?.length) void upload(picked);
        }}
      />
      <button className="btn-atelier self-start" type="button" disabled={busy} onClick={() => void upload()}>
        {busy ? uploading : attach}
      </button>
      <PhotoGrid
        files={shown}
        clientId={clientId}
        canDelete
        kind={kind}
        removeLabel={remove}
        confirmText={confirmText}
        openLabel={localize ? copy.photoOpen : "Ver fotos"}
        closeLabel={localize ? copy.photoClose : "Cerrar"}
      />
    </div>
  );
}

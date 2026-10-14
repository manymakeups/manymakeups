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
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const dir = event.key === "ArrowRight" ? 1 : -1;
      if (turnRef.current !== 0 || holdRef.current) return;
      const next = indexRef.current + dir;
      if (next < 0 || next >= images.length) return;
      setTurn(dir);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
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
    const timer = window.setTimeout(finishTurn, 760);
    return () => window.clearTimeout(timer);
  }, [turn]);

  const under = images[Math.min(images.length - 1, Math.max(0, index + (turn === 0 ? 1 : turn)))];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-ink/70 p-4" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={page?.name || closeLabel}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex w-full max-w-md items-center justify-between text-porcelain">
          <p className="text-[0.68rem] uppercase tracking-[0.16em]">
            {index + 1} / {images.length}
          </p>
          <button className="text-[0.68rem] uppercase tracking-[0.16em] text-porcelain/80 hover:text-porcelain" type="button" onClick={onClose} autoFocus>
            {closeLabel}
          </button>
        </div>
        <div
          className="relative aspect-[4/5] w-[min(78vw,420px)] [perspective:1400px]"
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
          {page ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${page.id}-${hold ? "hold" : "live"}`}
              src={portalFileHref(clientId, page.id)}
              alt={page.name}
              onTransitionEnd={(event) => {
                if (event.propertyName === "transform") finishTurn();
              }}
              className={`absolute inset-0 h-full w-full object-cover shadow-2xl [backface-visibility:hidden] ${hold ? "" : "transition-transform duration-700 ease-in-out"} ${turn === 1 ? "origin-left [transform:rotateY(-172deg)]" : turn === -1 ? "origin-right [transform:rotateY(172deg)]" : "origin-left"}`}
            />
          ) : null}
        </div>
        <div className="mt-4 flex w-full max-w-md items-center justify-between gap-4 text-porcelain">
          <button className="text-[0.68rem] uppercase tracking-[0.16em] disabled:opacity-30" type="button" onClick={() => go(-1)} disabled={index === 0}>
            ←
          </button>
          <p className="truncate text-sm">{page?.name}</p>
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
        {fieldLabel}
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

"use client";

import { useEffect, useRef, useState } from "react";
import { DeleteFileButton } from "@/app/components/portal/FileActions";
import { usePortalCopy } from "@/app/components/portal/usePortalCopy";
import { isImageType, portalFileHref } from "@/lib/portal/files";
import { filesFor, type FileKind, type PortalFile } from "@/lib/portal/types";

function loadSheet(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image"));
    image.src = src;
  });
}

function coverSheet(image: HTMLImageElement, width: number, height: number) {
  const sheet = document.createElement("canvas");
  sheet.width = width;
  sheet.height = height;
  const ctx = sheet.getContext("2d");
  if (!ctx || !image.width || !image.height) return sheet;
  const scale = Math.max(width / image.width, height / image.height);
  const drawnWidth = image.width * scale;
  const drawnHeight = image.height * scale;
  ctx.drawImage(image, (width - drawnWidth) / 2, (height - drawnHeight) / 2, drawnWidth, drawnHeight);
  return sheet;
}

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function drawCurl(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLCanvasElement,
  under: HTMLCanvasElement | null,
  width: number,
  height: number,
  progress: number,
  direction: 1 | -1,
) {
  const t = smoothstep(progress);
  ctx.clearRect(0, 0, width, height);
  if (under) ctx.drawImage(under, 0, 0, width, height);
  else {
    ctx.fillStyle = "#ece6dc";
    ctx.fillRect(0, 0, width, height);
  }

  const radius = width * 0.4 * Math.sin(Math.PI * t);
  if (radius < 1.5) {
    if (t < 0.5) ctx.drawImage(sheet, 0, 0, width, height);
    return;
  }

  const sign = direction === 1 ? 1 : -1;
  const crest = direction === 1 ? width * (1 - t) : width * t;
  const fold = crest - sign * radius;
  const maxAngle = Math.PI * 0.72;
  const shade = Math.sin(Math.PI * t) * 0.42;
  const reach = radius * 2.1;

  if (direction === 1) {
    const shadow = ctx.createLinearGradient(crest, 0, crest + reach, 0);
    shadow.addColorStop(0, `rgba(26,22,19,${shade})`);
    shadow.addColorStop(1, "rgba(26,22,19,0)");
    ctx.fillStyle = shadow;
    ctx.fillRect(crest, 0, reach, height);
  } else {
    const shadow = ctx.createLinearGradient(crest - reach, 0, crest, 0);
    shadow.addColorStop(0, "rgba(26,22,19,0)");
    shadow.addColorStop(1, `rgba(26,22,19,${shade})`);
    ctx.fillStyle = shadow;
    ctx.fillRect(crest - reach, 0, reach, height);
  }

  function project(pageX: number) {
    const past = direction === 1 ? pageX - fold : fold - pageX;
    if (past <= 0) return pageX;
    const angle = past / radius;
    if (angle >= maxAngle) return null;
    return fold + sign * Math.sin(angle) * radius;
  }

  const strips = 80;
  const backs: { x: number; w: number; angle: number }[] = [];
  for (let i = 0; i < strips; i += 1) {
    const x0 = (width * i) / strips;
    const x1 = (width * (i + 1)) / strips;
    const mid = (x0 + x1) / 2;
    const past = direction === 1 ? mid - fold : fold - mid;
    if (past <= 0) {
      ctx.drawImage(sheet, x0, 0, x1 - x0, height, x0 - 0.5, 0, x1 - x0 + 1, height);
      continue;
    }
    const angle = past / radius;
    if (angle >= maxAngle) continue;
    const left = project(x0);
    const right = project(x1);
    if (left === null || right === null) continue;
    const destX = Math.min(left, right);
    const destW = Math.max(1, Math.abs(right - left) + 1);
    if (angle <= Math.PI / 2) {
      ctx.drawImage(sheet, x0, 0, x1 - x0, height, destX, 0, destW, height);
      ctx.fillStyle = `rgba(26,22,19,${(angle / (Math.PI / 2)) * 0.2})`;
      ctx.fillRect(destX, 0, destW, height);
    } else {
      backs.push({ x: destX, w: destW, angle });
    }
  }

  if (backs.length) {
    const lipX = Math.min(...backs.map((back) => back.x));
    const lipEnd = Math.max(...backs.map((back) => back.x + back.w));
    const paper = ctx.createLinearGradient(direction === 1 ? lipX : lipEnd, 0, direction === 1 ? lipEnd : lipX, 0);
    paper.addColorStop(0, "#d9cebe");
    paper.addColorStop(0.55, "#f4ecdf");
    paper.addColorStop(1, "#fffaf3");
    ctx.fillStyle = paper;
    ctx.fillRect(lipX, 0, lipEnd - lipX, height);
    const cylinder = ctx.createLinearGradient(0, 0, 0, height);
    cylinder.addColorStop(0, "rgba(26,22,19,0.16)");
    cylinder.addColorStop(0.45, "rgba(255,250,244,0.2)");
    cylinder.addColorStop(1, "rgba(26,22,19,0.2)");
    ctx.fillStyle = cylinder;
    ctx.fillRect(lipX, 0, lipEnd - lipX, height);
  }
}

function CurlCanvas({
  front,
  under,
  direction,
  onDone,
}: {
  front: string;
  under: string;
  direction: 1 | -1;
  onDone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const stage = canvasRef.current;
    if (!stage) return;
    let frame = 0;
    let cancelled = false;

    async function run(surface: HTMLCanvasElement) {
      const ctx = surface.getContext("2d");
      if (!ctx) {
        doneRef.current();
        return;
      }
      const [frontImage, underImage] = await Promise.all([
        loadSheet(front),
        under ? loadSheet(under).catch(() => null) : Promise.resolve(null),
      ]).catch(() => [null, null] as const);
      if (cancelled) return;
      if (!frontImage) {
        doneRef.current();
        return;
      }

      const started = performance.now();
      const duration = 1100;
      let sheet: HTMLCanvasElement | null = null;
      let below: HTMLCanvasElement | null = null;
      let sized = "";

      function tick(now: number) {
        if (cancelled || !ctx || !frontImage) return;
        const rect = surface.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.round(rect.width * dpr));
        const height = Math.max(1, Math.round(rect.height * dpr));
        if (rect.width < 2) {
          frame = window.requestAnimationFrame(tick);
          return;
        }
        if (surface.width !== width || surface.height !== height) {
          surface.width = width;
          surface.height = height;
        }
        const key = `${width}x${height}`;
        if (key !== sized) {
          sheet = coverSheet(frontImage, width, height);
          below = underImage ? coverSheet(underImage, width, height) : null;
          sized = key;
        }
        const progress = Math.min(1, (now - started) / duration);
        if (sheet) drawCurl(ctx, sheet, below, width, height, progress, direction);
        if (progress < 1) frame = window.requestAnimationFrame(tick);
        else doneRef.current();
      }

      frame = window.requestAnimationFrame(tick);
    }

    void run(stage);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [direction, front, under]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

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
  const startX = useRef(0);
  const closeRef = useRef(onClose);
  const indexRef = useRef(index);
  const turnRef = useRef(turn);
  closeRef.current = onClose;
  indexRef.current = index;
  turnRef.current = turn;
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
      if (turnRef.current !== 0) return;
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
    if (turn !== 0) return;
    const next = index + dir;
    if (next < 0 || next >= images.length) return;
    turned.current = false;
    setTurn(dir);
  }

  function finishTurn() {
    if (turned.current || turn === 0) return;
    turned.current = true;
    const dir = turn;
    setIndex((current) => current + dir);
    setTurn(0);
    requestAnimationFrame(() => {
      turned.current = false;
    });
  }

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
          {page && turn === 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={portalFileHref(clientId, page.id)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-linen" />
          )}
          {page && turn !== 0 ? (
            <CurlCanvas
              front={portalFileHref(clientId, page.id)}
              under={under && under.id !== page.id ? portalFileHref(clientId, under.id) : ""}
              direction={turn}
              onDone={finishTurn}
            />
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

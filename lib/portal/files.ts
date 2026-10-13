const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const DOC_TYPES = new Set([
  ...IMAGE_TYPES,
  "application/pdf",
]);

export const INSPIRATION_MAX = 24;
export const INSPIRATION_BYTES = 8 * 1024 * 1024;
export const DOCUMENT_BYTES = 15 * 1024 * 1024;

export function isImageType(mime: string) {
  return IMAGE_TYPES.has(mime);
}

export function allowedType(kind: "inspiration" | "document", mime: string) {
  return kind === "inspiration" ? IMAGE_TYPES.has(mime) : DOC_TYPES.has(mime);
}

export function maxBytes(kind: "inspiration" | "document") {
  return kind === "inspiration" ? INSPIRATION_BYTES : DOCUMENT_BYTES;
}

export function safeFileName(name: string) {
  return name.replace(/[^\w.\- áéíóúüñÁÉÍÓÚÜÑ]+/gi, "_").slice(0, 80) || "archivo";
}

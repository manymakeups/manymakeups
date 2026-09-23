"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";

type LightboxPhoto = { src: string; alt: string; name?: string };

export function PhotoLightbox({
  photos,
  openIndex,
  onClose,
  onIndex,
}: {
  photos: LightboxPhoto[];
  openIndex: number | null;
  onClose: () => void;
  onIndex: (index: number) => void;
}) {
  const { messages: t } = useI18n();
  const open = openIndex === null ? null : photos[openIndex];

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onIndex((openIndex + 1) % photos.length);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onIndex((openIndex - 1 + photos.length) % photos.length);
      }
    };

    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, onIndex, openIndex, photos.length]);

  if (!open) return null;

  const gif = open.name ? /\.gif$/i.test(open.name) : /\.gif$/i.test(open.src);
  const step = (delta: number) => {
    if (openIndex === null) return;
    onIndex((openIndex + delta + photos.length) % photos.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 md:p-12"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={open.alt}
    >
      <button
        type="button"
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 px-3 py-4 text-porcelain/90 transition hover:text-porcelain md:left-6"
        onClick={(event) => {
          event.stopPropagation();
          step(-1);
        }}
        aria-label={t.common.prevPhoto}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          aria-hidden
        >
          <path d="M15 5 8 12l7 7" />
        </svg>
      </button>
      {gif ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={open.src}
          alt={open.alt}
          className="max-h-[88vh] w-auto max-w-full object-contain"
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <Image
          key={open.src}
          src={open.src}
          alt={open.alt}
          width={1600}
          height={1200}
          className="max-h-[88vh] w-auto max-w-full object-contain"
          onClick={(event) => event.stopPropagation()}
          priority
        />
      )}
      <button
        type="button"
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 px-3 py-4 text-porcelain/90 transition hover:text-porcelain md:right-6"
        onClick={(event) => {
          event.stopPropagation();
          step(1);
        }}
        aria-label={t.common.nextPhoto}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          aria-hidden
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { PhotoLightbox } from "./PhotoLightbox";
import type { Photo } from "@/lib/photos";
import { useI18n } from "@/lib/i18n/context";

const PAGE = 6;

export function ServiceImageGrid({
  images,
  wideHero = false,
  imageFrame = "portrait",
  paginate = false,
}: {
  images: Photo[];
  wideHero?: boolean;
  imageFrame?: "portrait" | "landscape";
  paginate?: boolean;
}) {
  const { messages: t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const cellAspect =
    imageFrame === "landscape" ? "aspect-[3/2]" : "aspect-[4/5]";
  const shown = paginate ? images.slice(0, limit) : images;

  if (!images.length) return null;

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-3">
        {shown.map((photo, i) => {
          const gif = /\.gif$/i.test(photo.name);
          const hero = wideHero && i === 0;
          return (
            <button
              key={photo.src}
              type="button"
              className={`group relative overflow-hidden bg-linen ${
                hero ? "col-span-2 aspect-[3/2]" : cellAspect
              }`}
              onClick={() => setOpenIndex(i)}
              aria-label={`${t.common.enlarge}: ${photo.alt}`}
            >
              {gif ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={
                    hero
                      ? "(min-width: 768px) 60vw, 100vw"
                      : "(min-width: 768px) 30vw, 50vw"
                  }
                  className={`object-cover transition duration-700 group-hover:scale-[1.03] ${
                    hero ? "object-[center_72%]" : ""
                  }`}
                  priority={i === 0}
                />
              )}
            </button>
          );
        })}
      </div>
      {paginate && images.length > limit ? (
        <button
          type="button"
          className="btn-atelier mt-10"
          onClick={() => setLimit((n) => n + PAGE)}
        >
          {t.common.moreLooks}
        </button>
      ) : null}
      <PhotoLightbox
        photos={images}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndex={setOpenIndex}
      />
    </>
  );
}

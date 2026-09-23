"use client";

import Image from "next/image";
import { useState } from "react";
import { PhotoLightbox } from "./PhotoLightbox";
import type { Photo } from "@/lib/photos";
import { useI18n } from "@/lib/i18n/context";

export function ServiceImageGrid({
  images,
  wideHero = false,
  imageFrame = "portrait",
}: {
  images: Photo[];
  wideHero?: boolean;
  imageFrame?: "portrait" | "landscape";
}) {
  const { messages: t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const cellAspect =
    imageFrame === "landscape" ? "aspect-[3/2]" : "aspect-[4/5]";

  if (!images.length) return null;

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-3">
        {images.map((photo, i) => {
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
      <PhotoLightbox
        photos={images}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndex={setOpenIndex}
      />
    </>
  );
}

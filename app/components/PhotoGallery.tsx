"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { PhotoLightbox } from "./PhotoLightbox";
import { useI18n } from "@/lib/i18n/context";

type Photo = { src: string; alt: string };

type PhotoGalleryProps = {
  parejas: Photo[];
  peinado: Photo[];
  maquillaje: Photo[];
};

const tabIds = ["parejas", "peinado", "maquillaje"] as const;

export function PhotoGallery({
  parejas,
  peinado,
  maquillaje,
}: PhotoGalleryProps) {
  const { messages: t } = useI18n();
  const tabs = tabIds.map((id) => ({ id, label: t.gallery[id] }));
  const [tab, setTab] = useState<(typeof tabIds)[number]>("parejas");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const photos = useMemo(() => {
    if (tab === "peinado") return peinado;
    if (tab === "maquillaje") return maquillaje;
    return parejas;
  }, [tab, parejas, peinado, maquillaje]);

  return (
    <div>
      <div className="flex flex-wrap gap-6" role="tablist" aria-label={t.nav.lookbook}>
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`nav-link ${tab === item.id ? "text-ink" : "text-ash"}`}
            onClick={() => {
              setTab(item.id);
              setOpenIndex(null);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            className="group relative aspect-[4/5] overflow-hidden bg-linen"
            onClick={() => setOpenIndex(index)}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 768px) 30vw, 50vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>
      <PhotoLightbox
        photos={photos}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndex={setOpenIndex}
      />
    </div>
  );
}

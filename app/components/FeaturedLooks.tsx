import Image from "next/image";
import type { Photo } from "@/lib/photos";

export function FeaturedLooks({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {photos.map((photo, i) => (
        <div
          key={photo.src}
          className={`relative overflow-hidden bg-linen ${
            i === 0 ? "aspect-[3/4] md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[520px]" : "aspect-[4/5]"
          }`}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority={i === 0}
            sizes={
              i === 0
                ? "(min-width: 768px) 50vw, 100vw"
                : "(min-width: 768px) 25vw, 50vw"
            }
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

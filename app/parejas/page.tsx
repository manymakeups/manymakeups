import { ServiceView } from "@/app/components/ServiceView";
import { getPhotos } from "@/lib/photos";
import { getLocale, getMessages, pageMeta } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getMessages(await getLocale()).pages.parejas;
  return pageMeta({
    path: "/parejas",
    title: copy.seoTitle,
    description: copy.seoDescription,
  });
}

export default async function ParejasPage() {
  const photos = await getPhotos();
  const copy = getMessages(await getLocale()).pages.parejas;
  const rings = {
    name: "anillos.jpg",
    src: "/photos/atelier/anillos.jpg",
    alt: "Alianzas de boda. Many Makeups trabaja con novias, novios y novies.",
  };

  return (
    <ServiceView
      kicker={copy.kicker}
      title={copy.title}
      lead={copy.lead}
      images={[rings, ...photos.featured]}
      wideHero
      ctaHref="/#contacto"
      paragraphs={copy.paragraphs}
      points={copy.points}
    />
  );
}

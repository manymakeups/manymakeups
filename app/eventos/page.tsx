import { ServiceView } from "@/app/components/ServiceView";
import { getPhotos } from "@/lib/photos";
import { getLocale, getMessages, pageMeta } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getMessages(await getLocale()).pages.eventos;
  return pageMeta({
    path: "/eventos",
    title: copy.seoTitle,
    description: copy.seoDescription,
  });
}

export default async function EventosPage() {
  const photos = await getPhotos();
  const copy = getMessages(await getLocale()).pages.eventos;

  return (
    <ServiceView
      kicker={copy.kicker}
      title={copy.title}
      lead={copy.lead}
      images={photos.gallery.eventos}
      showAllImages
      imageFrame="landscape"
      video={{
        src: "/photos/glitter-bar/mesa-luces.mp4",
        title: "Mesa de Glitter Bar montada con luces",
      }}
      paragraphs={copy.paragraphs}
      pullQuote={copy.pullQuote}
      points={copy.points}
    />
  );
}

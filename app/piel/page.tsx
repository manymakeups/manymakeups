import { ServiceView } from "@/app/components/ServiceView";
import { getLocale, getMessages, pageMeta } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getMessages(await getLocale()).pages.piel;
  return pageMeta({
    path: "/piel",
    title: copy.seoTitle,
    description: copy.seoDescription,
  });
}

export default async function PielPage() {
  const copy = getMessages(await getLocale()).pages.piel;

  return (
    <ServiceView
      kicker={copy.kicker}
      title={copy.title}
      lead={copy.lead}
      images={[
        {
          name: "piel.jpg",
          src: "/photos/atelier/piel.jpg",
          alt: "Cabina de cuidado de la piel: productos, toalla y camilla.",
        },
      ]}
      wideHero
      ctaHref="/#contacto"
      paragraphs={copy.paragraphs}
      points={copy.points}
    />
  );
}

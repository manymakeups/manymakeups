import { ServiceView } from "@/app/components/ServiceView";
import { getLocale, getMessages, pageMeta } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getMessages(await getLocale()).pages.formacion;
  return pageMeta({
    path: "/formacion",
    title: copy.seoTitle,
    description: copy.seoDescription,
  });
}

export default async function FormacionPage() {
  const copy = getMessages(await getLocale()).pages.formacion;

  return (
    <ServiceView
      kicker={copy.kicker}
      title={copy.title}
      lead={copy.lead}
      images={[
        {
          name: "formacion.jpg",
          src: "/photos/atelier/formacion.jpg",
          alt: "Curso de automaquillaje: espejo de mesa, brochas y práctica.",
        },
      ]}
      wideHero
      ctaHref="/#contacto"
      paragraphs={copy.paragraphs}
      points={copy.points}
      pointsColumns={2}
    />
  );
}

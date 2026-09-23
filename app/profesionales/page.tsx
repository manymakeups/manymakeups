import { ServiceView } from "@/app/components/ServiceView";
import { getLocale, getMessages, pageMeta } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getMessages(await getLocale()).pages.profesionales;
  return pageMeta({
    path: "/profesionales",
    title: copy.seoTitle,
    description: copy.seoDescription,
  });
}

export default async function ProfesionalesPage() {
  const copy = getMessages(await getLocale()).pages.profesionales;

  return (
    <ServiceView
      kicker={copy.kicker}
      title={copy.title}
      lead={copy.lead}
      images={[
        {
          name: "profesionales.jpg",
          src: "/photos/atelier/profesionales.jpg",
          alt: "Formación profesional de maquillaje: oficio frente al espejo.",
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

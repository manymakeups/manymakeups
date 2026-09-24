import { Atelier } from "./components/Atelier";
import { BeforeAfterGrid } from "./components/BeforeAfterGrid";
import { BrandLogo } from "./components/BrandLogo";
import { ContactForm } from "./components/ContactForm";
import { DrawFrame } from "./components/DrawFrame";
import { FaqJsonLd } from "./components/FaqJsonLd";
import { FeaturedLooks } from "./components/FeaturedLooks";
import { GoogleReviews } from "./components/GoogleReviews";
import { PhotoGallery } from "./components/PhotoGallery";
import { Reveal } from "./components/Reveal";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { getPhotos } from "@/lib/photos";
import { getLocale, getMessages, localePath, pageMeta } from "@/lib/i18n";
import type { Metadata } from "next";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale());
  return pageMeta({
    path: "/",
    title: t.meta.homeTitle,
    description: t.meta.homeDescription,
    absolute: true,
  });
}

export default async function Home() {
  const photos = await getPhotos();
  const locale = await getLocale();
  const t = getMessages(locale);

  return (
    <div className="min-h-full bg-porcelain text-ink">
      <FaqJsonLd />
      <SiteHeader />

      <main>
        <section className="mx-auto grid max-w-[1120px] items-center gap-12 px-6 pb-24 pt-6 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:px-10 md:pt-10">
          <div>
            <p className="hero-kicker text-[0.62rem] uppercase tracking-[0.16em] text-gilt sm:text-[0.68rem] sm:tracking-[0.2em] md:whitespace-nowrap">
              {t.home.kicker}
            </p>
            <h1 className="mt-6 font-serif font-medium tracking-tight">
              {t.home.heroLines.map((line, i) => (
                <span
                  key={line}
                  className={`hero-line block text-[2.55rem] leading-[0.95] sm:text-5xl md:text-[4.6rem] ${
                    i === 1 ? "italic" : ""
                  }`}
                >
                  <span>{line}</span>
                </span>
              ))}
            </h1>
            <p className="hero-copy mt-8 max-w-xl text-[1.05rem] leading-relaxed text-ash">
              {t.home.heroCopy}
            </p>
            <div className="hero-actions mt-10 flex flex-wrap gap-3">
              <a
                className="btn-atelier-solid btn-atelier"
                href={localePath(locale, "/#contacto")}
              >
                {t.common.book}
              </a>
              <a className="btn-atelier" href={localePath(locale, "/#servicios")}>
                {t.common.seeAtelier}
              </a>
            </div>
          </div>

          <div className="hero-frame">
            <DrawFrame eager className="bg-linen p-3 md:p-4" delay={280}>
              <div className="relative min-h-[420px] md:min-h-[520px]">
                {photos.hero ? (
                  <Image
                    src={photos.hero.src}
                    alt={photos.hero.alt}
                    fill
                    priority
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
            </DrawFrame>
          </div>
        </section>

        <section id="looks" className="border-t border-ink/10 py-24">
          <div className="mx-auto max-w-[1120px] px-6 md:px-10">
            <Reveal>
              <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gilt">
                {t.home.looksKicker}
              </p>
            </Reveal>
            <Reveal
              as="h2"
              variant="line"
              delay={80}
              className="mt-3 font-serif text-4xl md:text-5xl"
            >
              {t.home.looksTitle}
            </Reveal>
            <div className="mt-12">
              <FeaturedLooks photos={photos.featured} />
            </div>
          </div>
        </section>

        <Atelier
          images={{
            parejas: {
              name: "anillos.jpg",
              src: "/photos/atelier/anillos.jpg",
              alt: "Alianzas de boda sobre eucalipto",
            },
            eventos: {
              name: "eventos.jpg",
              src: "/photos/atelier/eventos.jpg",
              alt: "Glitter Bar de Many Makeups: pinceles, glitter y beauty corner",
            },
            formacion: {
              name: "formacion.jpg",
              src: "/photos/atelier/formacion.jpg",
              alt: "Curso de automaquillaje: espejo, brochas y práctica",
            },
            piel: {
              name: "piel.jpg",
              src: "/photos/atelier/piel.jpg",
              alt: "Cabina de cuidado de la piel: productos y camilla",
            },
            profesionales: {
              name: "profesionales.jpg",
              src: "/photos/atelier/profesionales.jpg",
              alt: "Formación profesional de maquillaje en estudio",
            },
          }}
        />

        <section id="cambio" className="border-t border-ink/10 py-24">
          <div className="mx-auto max-w-[1120px] px-6 md:px-10">
            <Reveal>
              <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gilt">
                {t.home.baKicker}
              </p>
            </Reveal>
            <Reveal
              as="h2"
              variant="line"
              delay={80}
              className="mt-3 font-serif text-4xl md:text-5xl"
            >
              {t.home.baTitle}
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 text-ash">{t.home.baCopy}</p>
            </Reveal>
            <BeforeAfterGrid
              featured={photos.beforeAfter.featured}
              rest={photos.beforeAfter.rest}
            />
          </div>
        </section>

        <section id="metodo" className="bg-linen/80 py-24">
          <div className="mx-auto max-w-[1120px] px-6 md:px-10">
            <Reveal
              as="h2"
              variant="line"
              className="font-serif text-4xl md:text-5xl"
            >
              {t.home.methodTitle}
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-4 text-ash">{t.home.methodCopy}</p>
            </Reveal>
            <div className="mt-16 grid gap-12 md:grid-cols-3">
              {t.process.map((item, i) => (
                <Reveal key={item.n} delay={i * 110}>
                  <p className="font-serif text-3xl italic text-gilt">
                    {item.n}
                  </p>
                  <h3 className="mt-4 font-serif text-2xl">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ash">
                    {item.text}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="ana"
          className="mx-auto grid max-w-[1120px] gap-12 px-6 py-24 md:grid-cols-2 md:items-center md:px-10"
        >
          <DrawFrame
            className="relative aspect-[3/4] overflow-hidden bg-linen md:min-h-[520px]"
            delay={80}
          >
            {photos.portrait ? (
              <Image
                src={photos.portrait.src}
                alt={photos.portrait.alt}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover object-[center_20%]"
              />
            ) : (
              <div className="flex h-full min-h-[280px] flex-col justify-end p-10">
                <p className="text-[0.65rem] uppercase tracking-[0.32em] text-gilt">
                  {t.home.portraitFallback}
                </p>
                <p className="mt-4 font-serif text-4xl leading-tight">
                  Ana Zarza
                </p>
              </div>
            )}
          </DrawFrame>
          <div>
            {t.ana.heading.map((line, i) => (
              <Reveal
                key={line}
                as={i === 0 ? "h2" : "p"}
                variant="line"
                delay={i * 80}
                className={`font-serif text-4xl md:text-5xl ${
                  i === 2 ? "italic" : ""
                } ${i > 0 ? "" : ""}`}
              >
                {line}
              </Reveal>
            ))}
            <Reveal delay={240}>
              <p className="mt-8 text-lg leading-relaxed text-ash">{t.ana.bio}</p>
            </Reveal>
          </div>
        </section>

        <section id="lookbook" className="border-t border-ink/10 py-24">
          <div className="mx-auto max-w-[1120px] px-6 md:px-10">
            <Reveal
              as="h2"
              variant="line"
              className="font-serif text-4xl md:text-5xl"
            >
              {t.nav.lookbook}
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-4 text-ash">{t.home.lookbookCopy}</p>
            </Reveal>
            <div className="mt-12">
              <PhotoGallery
                parejas={photos.gallery.parejas}
                peinado={photos.gallery.peinado}
                maquillaje={photos.gallery.maquillaje}
              />
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="border-t border-ink/10 py-24"
          aria-labelledby="faq-heading"
        >
          <div className="mx-auto max-w-[1120px] px-6 md:px-10">
            <Reveal
              as="h2"
              variant="line"
              className="font-serif text-4xl md:text-5xl"
              id="faq-heading"
            >
              {t.home.faqTitle}
            </Reveal>
            <div className="mt-12 divide-y divide-ink/10 border-t border-ink/10">
              {t.faqs.map((item, i) => (
                <Reveal key={item.q} delay={i * 50}>
                  <div className="py-8">
                    <h3 className="font-serif text-2xl leading-snug">
                      {item.q}
                    </h3>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ash">
                      {item.a}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="border-t border-ink/10 px-6 py-24 md:px-10">
          <div className="mx-auto max-w-[1120px]">
            <Reveal
              as="h2"
              variant="line"
              className="font-serif text-4xl md:text-6xl"
            >
              {t.home.contactTitle}
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-3xl text-ash">{t.home.contactCopy}</p>
            </Reveal>
            <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <ContactForm />
              </div>
              <div className="hidden lg:flex lg:items-center lg:justify-center lg:px-4">
                <BrandLogo size="block" />
              </div>
            </div>
            <div className="mt-16">
              <GoogleReviews />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

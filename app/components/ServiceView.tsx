import { DrawFrame } from "./DrawFrame";
import { Reveal } from "./Reveal";
import { ServiceImageGrid } from "./ServiceImageGrid";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { site } from "@/lib/site";
import { getLocale, getMessages, localePath } from "@/lib/i18n";
import type { Photo } from "@/lib/photos";

type ServiceViewProps = {
  kicker: string;
  title: string;
  lead: string;
  paragraphs: string[];
  points: { title: string; text: string }[];
  images?: Photo[];
  wideHero?: boolean;
  showAllImages?: boolean;
  imageFrame?: "portrait" | "landscape";
  video?: { src: string; title: string };
  ctaHref?: string;
  pullQuote?: string;
  pointsColumns?: 1 | 2;
};

export async function ServiceView({
  kicker,
  title,
  lead,
  paragraphs,
  points,
  images = [],
  wideHero = false,
  showAllImages = false,
  imageFrame = "portrait",
  video,
  ctaHref = site.calendlyUrl,
  pullQuote,
  pointsColumns = 1,
}: ServiceViewProps) {
  const locale = await getLocale();
  const t = getMessages(locale);
  const href =
    ctaHref.startsWith("http") || ctaHref.startsWith("mailto:")
      ? ctaHref
      : localePath(locale, ctaHref);
  return (
    <div className="min-h-full bg-porcelain text-ink">
      <SiteHeader />
      <main>
        <article className="mx-auto max-w-[960px] px-6 pb-24 pt-6 md:px-10 md:pt-10">
          <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gilt">
            {kicker}
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-[0.95] tracking-tight md:text-[4.2rem]">
            {title}
          </h1>
          <p className="mt-8 text-[1.05rem] leading-relaxed text-ash">{lead}</p>
          {video ? (
            <div className="mt-10 flex justify-center">
              <div className="relative aspect-[9/16] w-full max-w-[420px] overflow-hidden bg-ink">
                <video
                  className="size-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  aria-label={video.title}
                  suppressHydrationWarning
                >
                  <source src={video.src} type="video/mp4" />
                </video>
              </div>
            </div>
          ) : null}
          <ServiceImageGrid
            images={
              showAllImages ? images : images.slice(0, wideHero ? 5 : 4)
            }
            wideHero={wideHero}
            imageFrame={imageFrame}
            paginate={showAllImages}
          />
          <div
            className={
              pullQuote
                ? "mt-8 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(14rem,36%)] md:gap-12"
                : "mt-8"
            }
          >
            <div className="space-y-5 text-base leading-relaxed">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-ash">
                  {paragraph}
                </p>
              ))}
            </div>
            {pullQuote ? (
              <blockquote className="border-l border-gilt pl-5 font-serif text-4xl leading-[1.08] tracking-tight text-ink italic md:text-[2.75rem]">
                {pullQuote}
              </blockquote>
            ) : null}
          </div>
          <div
            className={`mt-16 grid gap-6 ${
              pointsColumns === 2 ? "md:grid-cols-2 md:auto-rows-fr" : ""
            }`}
          >
            {points.map((point, i) => (
              <Reveal key={point.title} delay={i * 80} className="h-full">
                <DrawFrame className="flex h-full flex-col p-8" delay={80}>
                  <h2 className="font-serif text-2xl">{point.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ash">
                    {point.text}
                  </p>
                </DrawFrame>
              </Reveal>
            ))}
          </div>
          <a
            className="btn-atelier-solid btn-atelier mt-12"
            href={href}
            {...(href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {t.common.book}
          </a>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

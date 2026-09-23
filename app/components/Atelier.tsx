import Image from "next/image";
import { DrawFrame } from "./DrawFrame";
import { Reveal } from "./Reveal";
import { services } from "@/lib/site";
import { getLocale, getMessages, localePath } from "@/lib/i18n";
import type { Photo } from "@/lib/photos";

const clientLines = services.filter((service) => service.slug !== "profesionales");
const professionals = services.find((service) => service.slug === "profesionales");

function Icon({ slug }: { slug: string }) {
  const common = {
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.15,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "size-14",
    "aria-hidden": true as const,
  };

  if (slug === "parejas") {
    return (
      <svg {...common}>
        <circle cx="19.5" cy="26" r="8.4" />
        <circle cx="28.5" cy="22" r="8.4" />
      </svg>
    );
  }
  if (slug === "eventos") {
    return (
      <svg {...common}>
        <path d="M24 9 35 34H13z" />
        <circle cx="24" cy="9" r="2.15" />
        <path d="M14.2 31.2c3.2-2.2 7.4-2.2 10.8 0 3.2 2 7.2 2 9.8 0" />
        <path d="M8.5 18 10 20.2 8.5 22.4 7 20.2z" />
        <path d="M39 16.5 40.6 18.8 39 21.1 37.4 18.8z" />
        <path d="M7.5 28c2.8 1.4 2.8 4.6 0 6" />
        <path d="M40.5 26c2.6 1.2 2.6 4.2 0 5.4" />
      </svg>
    );
  }
  if (slug === "formacion") {
    return (
      <svg {...common}>
        <circle cx="19" cy="17.5" r="8.2" />
        <circle cx="19" cy="17.5" r="6.2" />
        <path d="M19 25.8v7.4" />
        <path d="M13.5 35.8h11" />
        <path d="M32.5 36V18.5" />
        <ellipse cx="32.5" cy="16" rx="2.1" ry="3.1" />
        <path d="M38 36V22" />
        <ellipse cx="38" cy="19.6" rx="1.7" ry="2.6" />
      </svg>
    );
  }
  if (slug === "piel") {
    return (
      <svg {...common}>
        <path d="M24 9c6.5 7 10.5 12.4 10.5 17.4A10.5 10.5 0 0 1 24 36.9 10.5 10.5 0 0 1 13.5 26.4C13.5 21.4 17.5 16 24 9z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="24" cy="18.5" r="8.6" />
      <circle cx="24" cy="18.5" r="4.4" />
      <path d="M19.2 26.2 16 39.5 24 33.8 32 39.5 28.8 26.2" />
    </svg>
  );
}

function VeilCard({
  href,
  slug,
  n,
  title,
  text,
  photo,
  featured = false,
}: {
  href: string;
  slug: string;
  n: string;
  title: string;
  text: string;
  photo?: Photo;
  featured?: boolean;
}) {
  return (
    <a href={href} className={`group flex h-full ${featured ? "sm:col-span-2" : ""}`}>
      <DrawFrame
        className={`atelier-card relative h-full w-full overflow-hidden ${featured ? "md:flex md:items-center md:gap-10 md:p-12" : ""} p-8 md:p-10`}
        delay={80}
      >
        {photo ? (
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className={`atelier-photo object-cover ${
              slug === "parejas"
                ? "object-[center_72%]"
                : slug === "eventos"
                  ? "object-[center_40%]"
                  : slug === "profesionales"
                    ? "object-[center_38%]"
                    : slug === "formacion"
                      ? "object-[center_42%]"
                      : slug === "piel"
                        ? "object-[center_45%]"
                        : ""
            }`}
          />
        ) : null}
        <span className="atelier-veil" />
        <div
          className={`relative z-[1] ${
            featured
              ? "md:flex md:w-full md:items-start md:gap-12"
              : ""
          }`}
        >
          <div className="text-gilt transition-colors duration-500 group-hover:text-gilt-deep">
            <Icon slug={slug} />
          </div>
          <div className={featured ? "md:min-w-0 md:flex-1" : ""}>
            <p className="mt-6 text-[0.65rem] tracking-[0.28em] text-gilt md:mt-8">
              {n}
            </p>
            <h3 className="mt-3 font-serif text-3xl md:text-4xl">{title}</h3>
            <p
              className={`mt-3 text-sm leading-relaxed text-ash ${
                featured ? "" : "max-w-lg"
              }`}
            >
              {text}
            </p>
          </div>
        </div>
      </DrawFrame>
    </a>
  );
}

export async function Atelier({
  images,
}: {
  images: Partial<Record<(typeof services)[number]["slug"], Photo | undefined>>;
}) {
  const locale = await getLocale();
  const t = getMessages(locale);

  return (
    <section id="servicios" className="border-t border-ink/10 py-24">
      <div className="mx-auto max-w-[1120px] px-6 md:px-10">
        <Reveal>
          <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gilt">
            {t.nav.atelier}
          </p>
        </Reveal>
        <Reveal
          as="h2"
          variant="line"
          delay={80}
          className="mt-3 font-serif text-4xl md:text-5xl"
        >
          {t.home.atelierTitle}
        </Reveal>
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {clientLines.map((item, i) => {
            const copy = t.pages[item.slug];
            return (
              <Reveal key={item.n} delay={i * 90} className="h-full">
                <VeilCard
                  href={localePath(locale, item.href)}
                  slug={item.slug}
                  n={item.n}
                  title={copy.navTitle}
                  text={copy.lead}
                  photo={images[item.slug]}
                />
              </Reveal>
            );
          })}
          {professionals ? (
            <Reveal delay={200} className="h-full sm:col-span-2">
              <VeilCard
                href={localePath(locale, professionals.href)}
                slug={professionals.slug}
                n={professionals.n}
                title={t.home.professionalsCard}
                text={t.pages.profesionales.lead}
                photo={images.profesionales}
                featured
              />
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

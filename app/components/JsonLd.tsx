import { getLocale, getMessages, localePath } from "@/lib/i18n";
import { services, site } from "@/lib/site";

export async function JsonLd() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BeautySalon",
        "@id": `${site.url}/#salon`,
        name: site.name,
        alternateName: site.legalName,
        url: site.url,
        logo: `${site.url}${site.logo}`,
        image: `${site.url}/photos/ana/corporativa.jpg`,
        email: site.email,
        telephone: site.phone,
        description: t.meta.homeDescription,
        foundingDate: String(site.founded),
        priceRange: "€€",
        areaServed: [
          { "@type": "City", name: site.city },
          { "@type": "AdministrativeArea", name: site.region },
          { "@type": "AdministrativeArea", name: site.autonomousCommunity },
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: site.streetAddress,
          postalCode: site.postalCode,
          addressLocality: site.city,
          addressRegion: site.region,
          addressCountry: site.country,
        },
        founder: { "@id": `${site.url}/#ana` },
        sameAs: site.sameAs,
        potentialAction: {
          "@type": "ReserveAction",
          name: t.common.book,
          target: site.calendlyUrl,
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Atelier Many Makeups",
          itemListElement: services.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: t.pages[service.slug].navTitle,
              url: `${site.url}${localePath(locale, service.href)}`,
              description: t.pages[service.slug].lead,
            },
          })),
        },
      },
      {
        "@type": "Person",
        "@id": `${site.url}/#ana`,
        name: site.founder,
        jobTitle: "Esteticista y estilista",
        worksFor: { "@id": `${site.url}/#salon` },
        url: site.url,
        image: `${site.url}/photos/ana/corporativa.jpg`,
        knowsLanguage: ["es", "en", "fr"],
        sameAs: site.sameAs,
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: locale,
        publisher: { "@id": `${site.url}/#salon` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

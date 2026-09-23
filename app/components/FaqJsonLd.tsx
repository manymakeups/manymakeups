import { getLocale, getMessages } from "@/lib/i18n";
import { site } from "@/lib/site";

export async function FaqJsonLd() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${site.url}/#faq`,
    inLanguage: locale,
    mainEntity: t.faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

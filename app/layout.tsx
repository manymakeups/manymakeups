import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { IntroSplash } from "./components/IntroSplash";
import { JsonLd } from "./components/JsonLd";
import { ScrollJump } from "./components/ScrollJump";
import "./globals.css";
import { site } from "@/lib/site";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { I18nProvider } from "@/lib/i18n/context";
import { Analytics } from "@vercel/analytics/next";

const sans = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const isProduction =
  process.env.VERCEL_ENV === "production" ||
  (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production");

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const ogLocale =
    locale === "en" ? "en_GB" : locale === "fr" ? "fr_FR" : "es_ES";

  return {
    metadataBase: new URL(site.url),
    title: {
      default: messages.meta.homeTitle,
      template: "%s | Many Makeups",
    },
    description: messages.meta.homeDescription,
    applicationName: site.name,
    authors: [{ name: site.founder, url: site.url }],
    creator: site.founder,
    publisher: site.legalName,
    category: "beauty",
    keywords: [
      "maquillaje novia Castellón",
      "maquillaje novio Castellón",
      "maquillaje boda LGTBIQ+ Castellón",
      "maquillaje novia Nules",
      "peinado novia Castellón",
      "maquillaje eventos Castellón",
      "estilista Ana Zarza",
      "Many Makeups",
      "automaquillaje Castellón",
      "formación maquillaje profesional Castellón",
    ],
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: site.url,
      siteName: site.name,
      title: messages.meta.ogTitle,
      description: messages.meta.homeDescription,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    },
    twitter: {
      card: "summary_large_image",
      title: messages.meta.ogTitle,
      description: messages.meta.homeDescription,
    },
    robots: isProduction
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false },
  };
}

export const viewport = {
  themeColor: "#f4f1ea",
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const messages = getMessages(locale);

  return (
    <html
      lang={locale}
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <I18nProvider locale={locale} messages={messages}>
          <JsonLd />
          <IntroSplash />
          {children}
          <ScrollJump />
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}

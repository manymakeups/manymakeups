import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";
import { services, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = [
    "/",
    ...services.map((service) => service.href),
    "/aviso-legal",
    "/privacidad",
    "/cookies",
  ];

  return paths.flatMap((path, i) => {
    const languages = Object.fromEntries(
      locales.map((locale) => [
        locale,
        `${site.url}${localePath(locale, path)}`,
      ]),
    );
    return locales.map((locale) => ({
      url: `${site.url}${localePath(locale, path)}`,
      lastModified,
      changeFrequency: (path.startsWith("/aviso") ||
      path === "/privacidad" ||
      path === "/cookies"
        ? "yearly"
        : "monthly") as "yearly" | "monthly",
      priority: path === "/" ? 1 : i < 6 ? 0.8 : 0.3,
      alternates: { languages },
    }));
  });
}

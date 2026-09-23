export {
  defaultLocale,
  isLocale,
  localeLabels,
  localeNames,
  locales,
} from "./config";
export type { Locale } from "./config";
export { getMessages, es } from "./messages";
export type { Messages, ServiceCopy } from "./messages";
export { localeFromPath, localePath, stripLocale } from "./path";
export { getLocale, getRequestPathname } from "./server";
export { I18nProvider, useI18n } from "./context";
export { languageMap, pageMeta } from "./seo";

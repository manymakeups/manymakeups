"use client";

import { useI18n } from "@/lib/i18n/context";
import { getPortalCopy } from "@/lib/i18n/portal-messages";

export function usePortalCopy() {
  const { locale } = useI18n();
  return getPortalCopy(locale);
}

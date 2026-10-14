"use client";

import { site } from "@/lib/site";
import { useI18n } from "@/lib/i18n/context";

export function CalendlyEmbed({ eager = false, month, date }: { eager?: boolean; month?: string; date?: string }) {
  const { messages: t } = useI18n();
  const day = /^\d{4}-\d{2}-\d{2}$/.test(date || "") ? date : "";
  const src = `${site.calendlyUrl}?hide_gdpr_banner=1&background_color=f4f1ea&text_color=1a1613&primary_color=9c7d52${month ? `&month=${month}` : ""}${day ? `&date=${day}` : ""}`;
  return (
    <iframe
      className="h-[min(70vh,640px)] w-full border-0 bg-porcelain"
      src={src}
      title={t.common.phoneAppointment}
      loading={eager ? "eager" : "lazy"}
    />
  );
}

import { site } from "@/lib/site";

const logoUrl = `${site.url}/brand/mail/logo.png?v=5`;
const signatureUrl = `${site.url}/brand/mail/firma.png?v=4`;
const signatureWidth = 168;

const sans = "font-family:Skia,'Skia-Regular',Palatino,'Palatino Linotype',serif;";

const DETAIL_ICONS = {
  service: "icon-service.png",
  date: "icon-date.png",
  time: "icon-time.png",
  place: "icon-place.png",
  amount: "icon-amount.png",
} as const;

export type DetailIcon = keyof typeof DETAIL_ICONS;

type MailBlock =
  | { text: string; muted?: boolean; quote?: boolean; strong?: string }
  | { href: string; label: string }
  | { rows: { label: string; value: string }[] }
  | { details: { title: string; rows: { icon: DetailIcon; label: string; value: string }[] } };

export type ClientEmail = {
  blocks: MailBlock[];
  signoff: string[];
  lang?: string;
  footer?: { href: string; label: string };
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("\n", "<br>");
}

export function brandedClientEmail(input: ClientEmail) {
  const textLines: string[] = [];
  for (const block of input.blocks) {
    if ("href" in block) textLines.push("", block.label, block.href);
    else if ("details" in block) {
      textLines.push("", block.details.title);
      for (const row of block.details.rows) textLines.push(`${row.label}: ${row.value}`);
    } else if ("rows" in block) {
      textLines.push("");
      for (const row of block.rows) textLines.push(`${row.label}: ${row.value}`);
    } else textLines.push("", block.strong ? `${block.strong} ${block.text}` : block.text);
  }
  textLines.push("", ...input.signoff);
  if (input.footer) textLines.push("", input.footer.label, input.footer.href);
  const text = textLines.join("\n").replace(/^\n/, "");

  const body = input.blocks
    .map((block) => {
      if ("href" in block) {
        return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;"><tr><td bgcolor="#1c1714" style="background:#1c1714;">
          <a href="${escapeHtml(block.href)}" style="${sans}display:inline-block;padding:12px 18px;color:#fbf8f3;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;text-decoration:none;">${escapeHtml(block.label)}</a>
        </td></tr></table>`;
      }
      if ("details" in block) {
        const lines = block.details.rows
          .filter((row) => row.value.trim())
          .map((row, index, all) => {
            const rule = index === all.length - 1 ? "" : "border-bottom:1px solid #eadfce;";
            const icon = `${site.url}/brand/mail/${DETAIL_ICONS[row.icon]}?v=4`;
            return `<tr>
              <td width="52" valign="middle" style="width:52px;padding:12px 0 12px 16px;${rule}">
                <img src="${icon}" width="28" height="28" alt="" style="display:block;width:28px;height:28px;border:0;" />
              </td>
              <td valign="middle" style="padding:12px 16px 12px 8px;${rule}">
                <p style="margin:0;${sans}font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9a7b49;">${escapeHtml(row.label)}</p>
                <p style="margin:3px 0 0;${sans}font-size:17px;line-height:1.35;color:#1c1714;">${escapeHtml(row.value)}</p>
              </td>
            </tr>`;
          })
          .join("");
        if (!lines) return "";
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;border:1px solid #e4d8c6;background:#f7f1e8;">
          <tr><td colspan="2" style="padding:16px 16px 12px;border-bottom:1px solid #e4d8c6;">
            <p style="margin:0;${sans}font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#9a7b49;">${escapeHtml(block.details.title)}</p>
          </td></tr>
          ${lines}
        </table>`;
      }
      if ("rows" in block) {
        const lines = block.rows
          .filter((row) => row.value.trim())
          .map(
            (row) =>
              `<tr><td style="padding:10px 0;border-bottom:1px solid #e6dccb;">
                <p style="margin:0;${sans}font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9a7b49;">${escapeHtml(row.label)}</p>
                <p style="margin:4px 0 0;${sans}font-size:16px;line-height:1.45;color:#1c1714;">${escapeHtml(row.value)}</p>
              </td></tr>`,
          )
          .join("");
        if (!lines) return "";
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px;">${lines}</table>`;
      }
      const color = block.muted ? "#6e655c" : "#1c1714";
      const quote = block.quote ? "padding:14px 16px;border-left:2px solid #9a7b49;background:#f3efe8;" : "";
      const lead = block.strong ? `<strong>${escapeHtml(block.strong)}</strong> ` : "";
      return `<p style="margin:0 0 16px;${sans}font-size:16px;line-height:1.6;color:${color};${quote}">${lead}${escapeHtml(block.text)}</p>`;
    })
    .join("");
  const signoff = `<p style="margin:8px 0 0;${sans}font-size:16px;line-height:1.6;color:#1c1714;">${input.signoff.map(escapeHtml).join("<br>")}</p>
    <img src="${signatureUrl}" width="${signatureWidth}" alt="Ana Zarza, Makeup Artist. Many Makeups." style="display:block;width:${signatureWidth}px;max-width:100%;height:auto;border:0;margin:12px 0 0;" />`;
  const footer = input.footer
    ? `<p style="margin:18px 0 0;${sans}font-size:11px;line-height:1.5;letter-spacing:0.04em;"><a href="${escapeHtml(input.footer.href)}" style="color:#6e655c;text-decoration:underline;">${escapeHtml(input.footer.label)}</a></p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(input.lang || "es")}">
  <head>
    <meta charset="utf-8" />
    <style>
      body, table, td, p, a, span, font { ${sans} }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f4f1ea;${sans}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;${sans}">
      <tr>
        <td align="center" style="padding:36px 16px;${sans}">
          <font face="Skia, Palatino, serif">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;${sans}">
            <tr>
              <td align="center" style="padding:0 0 22px;${sans}">
                <img src="${logoUrl}" width="240" alt="Many Makeups" style="display:block;width:240px;max-width:240px;height:auto;border:0;margin:0 auto;" />
              </td>
            </tr>
            <tr>
              <td style="background:#fbf8f3;border:1px solid #e4d8c6;padding:36px 32px 32px;${sans}">
                <p style="margin:0 0 22px;width:42px;border-top:1px solid #9a7b49;font-size:0;line-height:0;">&nbsp;</p>
                ${body}
                ${signoff}
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:18px 8px 0;${sans}">
                ${footer}
              </td>
            </tr>
          </table>
          </font>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

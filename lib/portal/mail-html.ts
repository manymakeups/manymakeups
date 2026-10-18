import { site } from "@/lib/site";

const signatureUrl = `${site.url}/brand/firmas-correo/info.png?v=2`;
const signatureWidth = 180;
const typeface = "font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;";

type MailBlock = { text: string; muted?: boolean; quote?: boolean } | { href: string; label: string };

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
    if ("href" in block) {
      textLines.push("", block.label, block.href);
    } else {
      textLines.push("", block.text);
    }
  }
  textLines.push("", ...input.signoff);
  if (input.footer) textLines.push("", input.footer.label, input.footer.href);
  const text = textLines.join("\n").replace(/^\n/, "");

  const body = input.blocks
    .map((block) => {
      if ("href" in block) {
        return `<p style="margin:0 0 14px;${typeface}"><a href="${escapeHtml(block.href)}" style="${typeface}color:#7d6240;text-decoration:underline;">${escapeHtml(block.label)}</a></p>`;
      }
      const color = block.muted ? "#6d645b" : "#1a1613";
      const quote = block.quote ? "padding:12px 14px;border-left:3px solid #9c7d52;background:#ece6dc;" : "";
      return `<p style="margin:0 0 14px;${typeface}color:${color};${quote}">${escapeHtml(block.text)}</p>`;
    })
    .join("");
  const signoff = `<p style="margin:0 0 24px;${typeface}color:#1a1613;">${input.signoff.map(escapeHtml).join("<br>")}</p>`;
  const footer = input.footer
    ? `<p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;"><a href="${escapeHtml(input.footer.href)}" style="color:#6d645b;text-decoration:underline;">${escapeHtml(input.footer.label)}</a></p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(input.lang || "es")}">
  <body style="margin:0;padding:0;background:#f4f1ea;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#1a1613;">
                ${body}
                ${signoff}
                ${footer}
                <img src="${signatureUrl}" width="${signatureWidth}" alt="Ana Zarza, Makeup Artist. Many Makeups. @m.any_makeups · www.manymakeups.com · +34 645 800 760 · info@manymakeups.com" style="display:block;width:${signatureWidth}px;max-width:100%;height:auto;border:0;" />
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

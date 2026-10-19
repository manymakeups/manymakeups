import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { Locale } from "@/lib/i18n/config";
import { dateLocale, interpolate, type PortalCopy } from "@/lib/i18n/portal-messages";
import { contractedServiceNames, serviceAmountDue } from "./budget";
import { companionHeading, fullName } from "./names";
import { planningTimeline, sidePlanningRows } from "./planning-timeline";
import type { ClientRecord } from "./types";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const OUTER = 36;
const PAD = 28;

const porcelain = rgb(244 / 255, 241 / 255, 234 / 255);
const card = rgb(251 / 255, 248 / 255, 243 / 255);
const frame = rgb(228 / 255, 216 / 255, 198 / 255);
const hair = rgb(234 / 255, 223 / 255, 206 / 255);
const gilt = rgb(154 / 255, 123 / 255, 73 / 255);
const ink = rgb(74 / 255, 67 / 255, 62 / 255);
const ash = rgb(138 / 255, 129 / 255, 120 / 255);

export type PlanningPdfKind = "evento" | "glitter" | "beauty";

function linesOf(text: string, font: PDFFont, size: number, max: number, tracking = 0) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (!words.length) return [];
  const width = (value: string) => {
    const chars = [...value];
    return chars.reduce((sum, char) => sum + font.widthOfTextAtSize(char, size), 0) + tracking * Math.max(0, chars.length - 1);
  };
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (width(next) > max && current) {
      lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines;
}

class Sheet {
  page!: PDFPage;
  y = 0;
  private pages: PDFPage[] = [];
  private cardBottom = 0;
  private contentLeft = 0;
  private contentRight = 0;
  private opening = true;

  constructor(
    private pdf: PDFDocument,
    private font: PDFFont,
    private logo: PDFImage,
    private signature: PDFImage,
    private foot: string,
  ) {
    this.addPage();
  }

  private addPage(cardHeight?: number) {
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    this.pages.push(this.page);
    this.page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: porcelain });
    let top = PAGE_H - OUTER;
    if (this.opening) {
      const width = 168;
      const height = (width * this.logo.height) / this.logo.width;
      this.page.drawImage(this.logo, {
        x: (PAGE_W - width) / 2,
        y: top - height,
        width,
        height,
      });
      top -= height + 14;
      this.opening = false;
    }
    const footLines = this.foot ? linesOf(this.foot, this.font, 7.5, PAGE_W - OUTER * 2) : [];
    const footReserve = OUTER + (footLines.length ? 18 + footLines.length * 10 : 16);
    this.cardBottom = cardHeight ? Math.max(footReserve, top - cardHeight) : footReserve;
    this.page.drawRectangle({
      x: OUTER,
      y: this.cardBottom,
      width: PAGE_W - OUTER * 2,
      height: Math.max(80, top - this.cardBottom),
      color: card,
      borderColor: frame,
      borderWidth: 0.8,
    });
    this.contentLeft = OUTER + PAD;
    this.contentRight = PAGE_W - OUTER - PAD;
    this.y = top - PAD;
  }

  private need(height: number) {
    if (this.y - height < this.cardBottom + 18) this.addPage();
  }

  private text(value: string, x: number, y: number, size: number, color: typeof ink) {
    this.page.drawText(value, { x, y, size, font: this.font, color });
  }

  private tracked(value: string, x: number, y: number, size: number, color: typeof ink, tracking: number) {
    let cursor = x;
    for (const char of value) {
      this.text(char, cursor, y, size, color);
      cursor += this.font.widthOfTextAtSize(char, size) + tracking;
    }
  }

  rule() {
    this.need(20);
    this.page.drawLine({
      start: { x: this.contentLeft, y: this.y },
      end: { x: this.contentLeft + 42, y: this.y },
      thickness: 0.7,
      color: gilt,
    });
    this.y -= 18;
  }

  title(value: string) {
    const size = 20;
    this.need(size + 8);
    this.y -= size;
    this.text(value, this.contentLeft, this.y, size, ink);
    this.y -= 10;
  }

  kicker(value: string) {
    const size = 8;
    this.need(size + 8);
    this.y -= size;
    this.tracked(value.toUpperCase(), this.contentLeft, this.y, size, gilt, 1.15);
    this.y -= 12;
  }

  quiet(value: string) {
    const size = 11;
    const lines = linesOf(value, this.font, size, this.contentRight - this.contentLeft);
    for (const line of lines) {
      this.need(size + 4);
      this.y -= size;
      this.text(line, this.contentLeft, this.y, size, ash);
      this.y -= 4;
    }
    this.y -= 4;
  }

  prose(value: string, color: typeof ink = ink) {
    const size = 11;
    const lines = linesOf(value, this.font, size, this.contentRight - this.contentLeft);
    for (const line of lines) {
      this.need(size + 4);
      this.y -= size;
      this.text(line, this.contentLeft, this.y, size, color);
      this.y -= 4.5;
    }
    this.y -= 6;
  }

  field(label: string, value: string, note = "", marked = false) {
    const labelSize = 8;
    const valueSize = 12.5;
    const noteSize = 10;
    const width = this.contentRight - this.contentLeft;
    const labels = linesOf(label.toUpperCase(), this.font, labelSize, width * 0.84, 1.05);
    const values = value.trim() ? linesOf(value, this.font, valueSize, width) : [];
    const notes = note.trim() ? linesOf(note, this.font, noteSize, width) : [];
    const height =
      labels.length * 12 +
      values.length * 16 +
      notes.length * 13 +
      18;
    this.need(height);
    for (const line of labels) {
      this.y -= labelSize;
      this.tracked(line, this.contentLeft, this.y, labelSize, gilt, 1.05);
      this.y -= 4;
    }
    this.y -= 1;
    values.forEach((line, index) => {
      this.y -= valueSize;
      this.text(line, this.contentLeft, this.y, valueSize, ink);
      if (marked && index === values.length - 1) {
        const x = this.contentLeft + this.font.widthOfTextAtSize(line, valueSize) + 1.5;
        this.text("*", x, this.y + 3, 9, gilt);
      }
      this.y -= 3;
    });
    for (const line of notes) {
      this.y -= noteSize;
      this.text(line, this.contentLeft, this.y, noteSize, ash);
      this.y -= 3;
    }
    this.y -= 7;
    this.page.drawLine({
      start: { x: this.contentLeft, y: this.y },
      end: { x: this.contentRight, y: this.y },
      thickness: 0.45,
      color: hair,
    });
    this.y -= 13;
  }

  sign() {
    const width = 128;
    const height = (width * this.signature.height) / this.signature.width;
    if (this.y - height - 12 < this.cardBottom + 18) this.addPage(height + PAD * 2);
    else this.y -= 8;
    this.page.drawImage(this.signature, {
      x: this.contentLeft,
      y: this.y - height,
      width,
      height,
    });
    this.y -= height;
  }

  finish() {
    if (!this.foot.trim()) return;
    const size = 7.5;
    const lines = linesOf(this.foot, this.font, size, PAGE_W - OUTER * 2);
    for (const page of this.pages) {
      let y = 12 + lines.length * 10;
      for (const line of lines) {
        y -= 10;
        page.drawText(line, { x: OUTER, y, size, font: this.font, color: ash });
      }
    }
  }
}

function peopleOf(client: ClientRecord, copy: PortalCopy) {
  return [
    {
      id: "contractor",
      label: fullName(client.event, client.name) || copy.contractor,
      service: contractedServiceNames(client.event).join(" y "),
    },
    ...client.event.people.map((person, index) => ({
      id: `g:${index}`,
      label: companionHeading(person, copy.whoOptions, interpolate(copy.guestN, { n: index + 1 })),
      service: person.service?.trim() ?? "",
    })),
  ];
}

export async function planningPdfFor(client: ClientRecord, kind: PlanningPdfKind, copy: PortalCopy, locale: Locale) {
  const event = client.event;
  const name = fullName(event, client.name);
  const date = event.eventDate
    ? new Date(`${event.eventDate}T12:00:00`).toLocaleDateString(dateLocale(locale), {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const premium = kind === "glitter" || kind === "beauty";
  const side = kind === "glitter" ? event.planning.glitter : kind === "beauty" ? event.planning.beauty : null;
  const title = kind === "glitter" ? copy.glitterBar : kind === "beauty" ? copy.beautyCorner : copy.planningTab;
  const location = side ? side.location : event.planning.location;
  const rows = side
    ? sidePlanningRows({ ...side, on: true }, title, copy)
    : planningTimeline(event.planning, peopleOf(client, copy), copy);
  const notes = side ? "" : event.planning.notes;
  const due = premium ? 0 : serviceAmountDue(client);
  const amount =
    due > 0 ? new Intl.NumberFormat(dateLocale(locale), { style: "currency", currency: "EUR" }).format(due) : "";
  const pendingLabel = copy.planningPending.split(":")[0].trim();

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(await readFile(path.join(process.cwd(), "lib/portal/fonts/Skia.ttf")), {
    subset: true,
  });
  const logo = await pdf.embedPng(await readFile(path.join(process.cwd(), "public/brand/mail/logo.png")));
  const signature = await pdf.embedPng(await readFile(path.join(process.cwd(), "public/brand/mail/firma.png")));
  const sheet = new Sheet(pdf, font, logo, signature, amount ? `* ${copy.planningCashNote}` : "");

  sheet.rule();
  if (name) sheet.title(name);
  sheet.kicker(title);
  if (date) sheet.quiet(date);
  if (location.trim()) sheet.quiet(location);
  sheet.y -= 6;

  if (premium) {
    sheet.prose(copy.premiumMailTimesTitle, gilt);
    sheet.prose(copy.premiumMailTimes);
    sheet.prose(copy.premiumMailImportant, gilt);
    sheet.prose(copy.premiumMailImportantBody);
  }

  if (amount) sheet.field(pendingLabel, amount, "", true);

  if (!rows.length && !notes.trim() && !amount) sheet.quiet(copy.planningEmpty);
  for (const row of rows) sheet.field(row.label, row.when, row.note);
  if (notes.trim()) sheet.field(copy.planningNotes, notes);
  sheet.sign();
  sheet.finish();

  return pdf.save();
}

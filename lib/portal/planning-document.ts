import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { Locale } from "@/lib/i18n/config";
import { dateLocale, interpolate, type PortalCopy } from "@/lib/i18n/portal-messages";
import { contractedServiceNames, serviceAmountDue } from "./budget";
import { companionHeading, fullName } from "./names";
import { planningTimeline, sidePlanningRows } from "./planning-timeline";
import type { ClientRecord } from "./types";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 52;

const porcelain = rgb(244 / 255, 241 / 255, 234 / 255);
const ink = rgb(28 / 255, 23 / 255, 20 / 255);
const gilt = rgb(154 / 255, 123 / 255, 73 / 255);
const ash = rgb(110 / 255, 102 / 255, 94 / 255);

export type PlanningPdfKind = "evento" | "glitter" | "beauty";

function plain(value: string) {
  return value
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("…", "...")
    .replaceAll("\u00a0", " ");
}

function wrap(text: string, font: PDFFont, size: number, max: number) {
  const words = plain(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > max && current) {
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

  constructor(
    private pdf: PDFDocument,
    private font: PDFFont,
    private bold: PDFFont,
    private logo: PDFImage,
  ) {
    this.addPage();
  }

  private paint() {
    this.page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: porcelain });
  }

  addPage() {
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    this.paint();
    this.y = PAGE_H - MARGIN;
  }

  private need(height: number) {
    if (this.y - height < MARGIN) this.addPage();
  }

  logoMark() {
    const width = 168;
    const height = (width * this.logo.height) / this.logo.width;
    this.need(height + 8);
    this.page.drawImage(this.logo, {
      x: (PAGE_W - width) / 2,
      y: this.y - height,
      width,
      height,
    });
    this.y -= height + 18;
  }

  center(text: string, size: number, font: PDFFont, color: typeof ink, gap = 8) {
    const line = plain(text).trim();
    if (!line) return;
    this.need(size + gap);
    const width = font.widthOfTextAtSize(line, size);
    this.page.drawText(line, {
      x: (PAGE_W - width) / 2,
      y: this.y - size,
      size,
      font,
      color,
    });
    this.y -= size + gap;
  }

  paragraph(text: string, size: number, font: PDFFont, color: typeof ink, gap = 4) {
    const lines = wrap(text, font, size, PAGE_W - MARGIN * 2);
    for (const line of lines) {
      this.need(size + gap);
      this.page.drawText(line, { x: MARGIN, y: this.y - size, size, font, color });
      this.y -= size + gap;
    }
    this.y -= 6;
  }

  rule() {
    this.need(16);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_W - MARGIN, y: this.y },
      thickness: 0.6,
      color: gilt,
      opacity: 0.55,
    });
    this.y -= 16;
  }

  row(when: string, label: string, note: string) {
    const labelSize = 13;
    const whenSize = 9;
    const noteSize = 10;
    const column = 118;
    const labelWidth = PAGE_W - MARGIN - column - MARGIN;
    const labels = wrap(label, this.bold, labelSize, labelWidth);
    const notes = note.trim() ? wrap(note, this.font, noteSize, labelWidth) : [];
    const height = Math.max(labelSize, labels.length * (labelSize + 3)) + notes.length * (noteSize + 3) + 16;
    this.need(height);
    const baseline = this.y - labelSize;
    if (when.trim()) {
      this.page.drawText(plain(when), {
        x: MARGIN,
        y: baseline + 1,
        size: whenSize,
        font: this.font,
        color: gilt,
      });
    }
    labels.forEach((line, index) => {
      this.page.drawText(line, {
        x: MARGIN + column,
        y: baseline - index * (labelSize + 3),
        size: labelSize,
        font: this.bold,
        color: ink,
      });
    });
    const noteTop = baseline - labels.length * (labelSize + 3) - 2;
    notes.forEach((line, index) => {
      this.page.drawText(line, {
        x: MARGIN + column,
        y: noteTop - index * (noteSize + 3),
        size: noteSize,
        font: this.font,
        color: ash,
      });
    });
    this.y = noteTop - notes.length * (noteSize + 3) - 8;
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_W - MARGIN, y: this.y },
      thickness: 0.4,
      color: ink,
      opacity: 0.12,
    });
    this.y -= 12;
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

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const logo = await pdf.embedPng(await readFile(path.join(process.cwd(), "public/brand/mail/logo.png")));
  const sheet = new Sheet(pdf, font, bold, logo);

  sheet.logoMark();
  sheet.center(name, 22, bold, ink, 8);
  sheet.center(title.toUpperCase(), 10, font, gilt, 10);
  if (date) sheet.center(date, 12, font, ink, 6);
  if (location.trim()) sheet.center(location.toUpperCase(), 10, font, ink, 8);
  sheet.y -= 8;
  sheet.rule();

  if (premium) {
    sheet.paragraph(copy.premiumMailTimesTitle, 13, bold, ink, 5);
    sheet.paragraph(copy.premiumMailTimes, 11, font, ink, 4);
    sheet.paragraph(copy.premiumMailImportant, 11, bold, ink, 3);
    sheet.paragraph(copy.premiumMailImportantBody, 11, font, ink, 4);
    sheet.y -= 4;
  }

  if (amount) {
    sheet.center(interpolate(copy.planningPending, { amount }), 13, bold, ink, 6);
    sheet.paragraph(copy.planningCashNote, 10, font, ash, 3);
    sheet.rule();
  }

  if (!rows.length && !notes.trim()) {
    sheet.center(copy.planningEmpty, 12, font, ash, 8);
  }
  for (const row of rows) sheet.row(row.when, row.label, row.note);
  if (notes.trim()) {
    sheet.y -= 6;
    sheet.paragraph(copy.planningNotes, 10, font, gilt, 4);
    sheet.paragraph(notes, 11, font, ink, 4);
  }

  return pdf.save();
}

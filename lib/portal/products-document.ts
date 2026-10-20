import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { PortalCopy } from "@/lib/i18n/portal-messages";
import { HAIR_ZONES, PRODUCT_ZONES, type UsedProduct } from "./types";

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
  private opening = true;
  private cardBottom = 0;
  private contentLeft = 0;
  private contentRight = 0;

  constructor(
    private pdf: PDFDocument,
    private font: PDFFont,
    private logo: PDFImage,
  ) {
    this.addPage();
  }

  private addPage() {
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    this.page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: porcelain });
    let top = PAGE_H - OUTER;
    if (this.opening) {
      const width = 168;
      const height = (width * this.logo.height) / this.logo.width;
      this.page.drawImage(this.logo, { x: (PAGE_W - width) / 2, y: top - height, width, height });
      top -= height + 14;
      this.opening = false;
    }
    this.cardBottom = OUTER + 16;
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

  private fit(value: string) {
    return [...value]
      .filter((char) => {
        try {
          this.font.encodeText(char);
          return true;
        } catch {
          return false;
        }
      })
      .join("");
  }

  private text(value: string, x: number, y: number, size: number, color: typeof ink) {
    const safe = this.fit(value);
    if (!safe) return;
    this.page.drawText(safe, { x, y, size, font: this.font, color });
  }

  private tracked(value: string, x: number, y: number, size: number, color: typeof ink, tracking: number) {
    let cursor = x;
    for (const char of this.fit(value)) {
      this.text(char, cursor, y, size, color);
      cursor += this.font.widthOfTextAtSize(char, size) + tracking;
    }
  }

  title(value: string) {
    this.block(this.fit(value), 18, ink, 8);
  }

  heading(value: string) {
    this.block(this.fit(value), 15, ink, 10);
  }

  private block(value: string, size: number, color: typeof ink, after: number) {
    const lines = linesOf(value, this.font, size, this.contentRight - this.contentLeft);
    if (!lines.length) return;
    this.need(lines.length * (size + 4) + after);
    for (const line of lines) {
      this.y -= size;
      this.text(line, this.contentLeft, this.y, size, color);
      this.y -= 4;
    }
    this.y -= after;
  }

  kicker(value: string) {
    const size = 8;
    this.need(size + 16);
    this.y -= 8;
    this.page.drawLine({
      start: { x: this.contentLeft, y: this.y },
      end: { x: this.contentLeft + 36, y: this.y },
      thickness: 0.7,
      color: gilt,
    });
    this.y -= 14;
    this.y -= size;
    this.tracked(value.toUpperCase(), this.contentLeft, this.y, size, gilt, 1.1);
    this.y -= 12;
  }

  prose(value: string) {
    this.block(this.fit(value), 12, ink, 0);
  }

  product(copy: PortalCopy, item: UsedProduct) {
    const rows = [
      item.name.trim() ? { label: copy.productName, value: item.name.trim() } : null,
      item.brand.trim() ? { label: copy.productBrand, value: item.brand.trim() } : null,
      item.shade.trim() ? { label: copy.productShade, value: item.shade.trim() } : null,
    ].filter((row) => row != null);
    if (!rows.length) return;
    const width = this.contentRight - this.contentLeft;
    const wrapped = rows.map((row) => ({
      label: row.label.toUpperCase(),
      lines: linesOf(this.fit(row.value), this.font, 12, width),
    })).filter((row) => row.lines.length);
    if (!wrapped.length) return;
    const height = wrapped.reduce((sum, row) => sum + 12 + row.lines.length * 16, 18);
    this.need(height);
    for (const row of wrapped) {
      this.y -= 8;
      this.tracked(row.label, this.contentLeft, this.y, 7.5, gilt, 1.05);
      this.y -= 6;
      for (const line of row.lines) {
        this.y -= 12;
        this.text(line, this.contentLeft, this.y, 12, ink);
        this.y -= 3;
      }
    }
    this.y -= 6;
    this.page.drawLine({
      start: { x: this.contentLeft, y: this.y },
      end: { x: this.contentRight, y: this.y },
      thickness: 0.4,
      color: hair,
    });
    this.y -= 14;
  }
}

function grouped(products: UsedProduct[], zones: readonly string[]) {
  const buckets = new Map<string, UsedProduct[]>();
  for (const product of products) {
    const zone = product.zone || "Otra";
    const list = buckets.get(zone) ?? [];
    list.push(product);
    buckets.set(zone, list);
  }
  const known = zones.filter((zone) => buckets.has(zone));
  const extra = [...buckets.keys()].filter((zone) => !zones.includes(zone));
  return [...known, ...extra].map((zone) => ({ zone, products: buckets.get(zone) ?? [] }));
}

export async function productsPdf(input: {
  name: string;
  makeup: UsedProduct[];
  hair: UsedProduct[];
  legacy?: string;
  copy: PortalCopy;
}) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(await readFile(path.join(process.cwd(), "lib/portal/fonts/Skia.ttf")), { subset: true });
  const logo = await pdf.embedPng(await readFile(path.join(process.cwd(), "public/brand/mail/logo.png")));
  const sheet = new Sheet(pdf, font, logo);
  if (input.name) sheet.title(input.name);
  const sections = [
    { title: input.copy.makeupTab, products: input.makeup, zones: PRODUCT_ZONES },
    { title: input.copy.hairTab, products: input.hair, zones: HAIR_ZONES },
  ].filter((section) => section.products.length);
  for (const section of sections) {
    sheet.heading(section.title);
    for (const group of grouped(section.products, section.zones)) {
      sheet.kicker(input.copy.productZones[group.zone] || group.zone);
      for (const product of group.products) sheet.product(input.copy, product);
    }
  }
  if (!sections.length && input.legacy?.trim()) sheet.prose(input.legacy.trim());
  return pdf.save();
}

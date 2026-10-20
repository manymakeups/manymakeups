import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { PortalCopy } from "@/lib/i18n/portal-messages";
import { HAIR_ZONES, PRODUCT_ZONES, type UsedProduct } from "./types";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 32;

const porcelain = rgb(244 / 255, 241 / 255, 234 / 255);
const paper = rgb(251 / 255, 248 / 255, 243 / 255);
const ink = rgb(26 / 255, 22 / 255, 19 / 255);
const ash = rgb(109 / 255, 100 / 255, 91 / 255);
const gilt = rgb(156 / 255, 125 / 255, 82 / 255);

const NAME_X = MARGIN + 28;
const BRAND_X = MARGIN + 236;
const SHADE_X = MARGIN + 372;
const RIGHT = PAGE_W - MARGIN - 28;

function widthOf(font: PDFFont, value: string, size: number, tracking = 0) {
  const chars = [...value];
  return chars.reduce((sum, char) => sum + font.widthOfTextAtSize(char, size), 0) + tracking * Math.max(0, chars.length - 1);
}

function linesOf(text: string, font: PDFFont, size: number, max: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (widthOf(font, next, size) > max && current) {
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
  private opening = true;
  private bottom = MARGIN + 22;
  private documentTitle = "";

  constructor(
    private pdf: PDFDocument,
    private font: PDFFont,
    private logo: PDFImage,
  ) {}

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

  private clip(value: string, size: number, max: number) {
    const text = this.fit(value).replace(/\s+/g, " ").trim();
    if (!text || widthOf(this.font, text, size) <= max) return text;
    const mark = this.fit("…") || "...";
    let cut = text;
    while (cut && widthOf(this.font, `${cut}${mark}`, size) > max) cut = [...cut].slice(0, -1).join("");
    return `${cut.trimEnd()}${mark}`;
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

  private trackedWidth(value: string, size: number, tracking: number) {
    return widthOf(this.font, this.fit(value), size, tracking);
  }

  private centerTracked(value: string, y: number, size: number, color: typeof ink, tracking: number) {
    const safe = this.fit(value);
    if (!safe) return;
    const x = (PAGE_W - this.trackedWidth(safe, size, tracking)) / 2;
    this.tracked(safe, x, y, size, color, tracking);
  }

  private centerText(value: string, y: number, size: number, color: typeof ink) {
    const safe = this.fit(value);
    if (!safe) return;
    const x = (PAGE_W - this.font.widthOfTextAtSize(safe, size)) / 2;
    this.text(safe, x, y, size, color);
  }

  private frame() {
    this.page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: porcelain });
    this.page.drawRectangle({
      x: MARGIN,
      y: MARGIN,
      width: PAGE_W - MARGIN * 2,
      height: PAGE_H - MARGIN * 2,
      borderColor: gilt,
      borderWidth: 0.6,
      color: paper,
    });
    this.page.drawRectangle({
      x: MARGIN + 5,
      y: MARGIN + 5,
      width: PAGE_W - (MARGIN + 5) * 2,
      height: PAGE_H - (MARGIN + 5) * 2,
      borderColor: gilt,
      borderWidth: 0.25,
      borderOpacity: 0.45,
    });
  }

  private addPage() {
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    this.pages.push(this.page);
    this.frame();
    this.y = PAGE_H - MARGIN - 36;
    if (!this.opening && this.documentTitle) {
      const size = 11;
      this.centerText(this.documentTitle, this.y, size, ink);
      this.y -= 12;
      const rule = 28;
      this.page.drawLine({
        start: { x: (PAGE_W - rule) / 2, y: this.y },
        end: { x: (PAGE_W + rule) / 2, y: this.y },
        thickness: 0.6,
        color: gilt,
      });
      this.y -= 26;
    }
  }

  open(title: string, name: string) {
    this.documentTitle = title;
    this.addPage();
    const logoWidth = 132;
    const logoHeight = (logoWidth * this.logo.height) / this.logo.width;
    this.page.drawImage(this.logo, {
      x: (PAGE_W - logoWidth) / 2,
      y: this.y - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });
    this.y -= logoHeight + 16;
    const rule = 42;
    this.page.drawLine({
      start: { x: (PAGE_W - rule) / 2, y: this.y },
      end: { x: (PAGE_W + rule) / 2, y: this.y },
      thickness: 0.7,
      color: gilt,
    });
    this.y -= 28;
    const size = 22;
    const lines = linesOf(this.fit(title), this.font, size, PAGE_W - 140);
    for (const line of lines) {
      this.y -= size;
      this.centerText(line, this.y, size, ink);
      this.y -= 4;
    }
    if (name.trim()) {
      this.y -= 8;
      this.centerText(name.trim(), this.y - 11, 12, ash);
      this.y -= 16;
    }
    this.y -= 18;
    this.opening = false;
  }

  private ensure(height: number) {
    if (this.y - height >= this.bottom) return;
    this.addPage();
    this.y -= 8;
  }

  look(title: string) {
    this.ensure(52);
    this.y -= 6;
    const size = 8;
    const tracking = 1.6;
    const label = title.toUpperCase();
    const labelWidth = this.trackedWidth(label, size, tracking);
    const x = (PAGE_W - labelWidth) / 2;
    this.y -= size;
    this.tracked(label, x, this.y, size, gilt, tracking);
    this.y -= 10;
    const line = Math.min(160, labelWidth + 36);
    this.page.drawLine({
      start: { x: (PAGE_W - line) / 2, y: this.y },
      end: { x: (PAGE_W + line) / 2, y: this.y },
      thickness: 0.45,
      color: gilt,
      opacity: 0.7,
    });
    this.y -= 18;
  }

  columns(copy: PortalCopy) {
    this.ensure(18);
    const size = 6.5;
    const tracking = 0.85;
    this.y -= size;
    this.tracked(copy.productName.toUpperCase(), NAME_X, this.y, size, gilt, tracking);
    this.tracked(copy.productBrand.toUpperCase(), BRAND_X, this.y, size, gilt, tracking);
    this.tracked(copy.productShade.toUpperCase(), SHADE_X, this.y, size, gilt, tracking);
    this.y -= 8;
  }

  zone(value: string) {
    this.ensure(26);
    this.y -= 12;
    this.tracked(value.toUpperCase(), NAME_X, this.y, 7.5, ink, 1.15);
    this.y -= 8;
  }

  row(name: string, brand: string, shade: string) {
    this.ensure(24);
    const size = 11;
    this.y -= size;
    this.text(this.clip(name, size, BRAND_X - NAME_X - 14), NAME_X, this.y, size, ink);
    this.text(this.clip(brand, size, SHADE_X - BRAND_X - 14), BRAND_X, this.y, size, ash);
    this.text(this.clip(shade, size, RIGHT - SHADE_X), SHADE_X, this.y, size, ash);
    this.y -= 7;
    this.page.drawLine({
      start: { x: NAME_X, y: this.y },
      end: { x: RIGHT, y: this.y },
      thickness: 0.35,
      color: ink,
      opacity: 0.12,
    });
    this.y -= 8;
  }

  prose(value: string) {
    const size = 12;
    const lines = linesOf(this.fit(value), this.font, size, RIGHT - NAME_X);
    for (const line of lines) {
      this.ensure(size + 6);
      this.y -= size;
      this.text(line, NAME_X, this.y, size, ink);
      this.y -= 5;
    }
  }

  finish() {
    if (this.pages.length < 2) return;
    this.pages.forEach((page, index) => {
      const label = String(index + 1);
      const size = 8;
      page.drawText(label, {
        x: (PAGE_W - this.font.widthOfTextAtSize(label, size)) / 2,
        y: 16,
        size,
        font: this.font,
        color: ash,
      });
    });
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
  sheet.open(input.copy.productsDocumentTitle, input.name);
  const sections = [
    { title: input.copy.makeupTab, products: input.makeup, zones: PRODUCT_ZONES },
    { title: input.copy.hairTab, products: input.hair, zones: HAIR_ZONES },
  ].filter((section) => section.products.length);
  for (const section of sections) {
    sheet.look(section.title);
    sheet.columns(input.copy);
    for (const group of grouped(section.products, section.zones)) {
      sheet.zone(input.copy.productZones[group.zone] || group.zone);
      for (const product of group.products) sheet.row(product.name, product.brand, product.shade);
    }
  }
  if (!sections.length && input.legacy?.trim()) sheet.prose(input.legacy.trim());
  sheet.finish();
  return pdf.save();
}

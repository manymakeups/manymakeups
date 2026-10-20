import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PDFDocument } from "pdf-lib";

const FONT_DIR = path.join(process.cwd(), "lib/portal/fonts");

export async function embedDocumentFonts(pdf: PDFDocument) {
  const [serifFile, sansFile] = await Promise.all([
    readFile(path.join(FONT_DIR, "CormorantGaramond-Medium.ttf")),
    readFile(path.join(FONT_DIR, "Outfit-Regular.ttf")),
  ]);
  return {
    serif: await pdf.embedFont(serifFile),
    sans: await pdf.embedFont(sansFile, { subset: true }),
  };
}

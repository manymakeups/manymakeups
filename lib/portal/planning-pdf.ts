const WIN: Record<string, number> = {
  "¡": 0xa1,
  "¢": 0xa2,
  "£": 0xa3,
  "¥": 0xa5,
  "§": 0xa7,
  "©": 0xa9,
  "«": 0xab,
  "¬": 0xac,
  "®": 0xae,
  "°": 0xb0,
  "±": 0xb1,
  "·": 0xb7,
  "»": 0xbb,
  "¿": 0xbf,
  À: 0xc0,
  Á: 0xc1,
  Â: 0xc2,
  Ã: 0xc3,
  Ä: 0xc4,
  Å: 0xc5,
  Æ: 0xc6,
  Ç: 0xc7,
  È: 0xc8,
  É: 0xc9,
  Ê: 0xca,
  Ë: 0xcb,
  Ì: 0xcc,
  Í: 0xcd,
  Î: 0xce,
  Ï: 0xcf,
  Ñ: 0xd1,
  Ò: 0xd2,
  Ó: 0xd3,
  Ô: 0xd4,
  Õ: 0xd5,
  Ö: 0xd6,
  Ø: 0xd8,
  Ù: 0xd9,
  Ú: 0xda,
  Û: 0xdb,
  Ü: 0xdc,
  Ý: 0xdd,
  à: 0xe0,
  á: 0xe1,
  â: 0xe2,
  ã: 0xe3,
  ä: 0xe4,
  å: 0xe5,
  æ: 0xe6,
  ç: 0xe7,
  è: 0xe8,
  é: 0xe9,
  ê: 0xea,
  ë: 0xeb,
  ì: 0xec,
  í: 0xed,
  î: 0xee,
  ï: 0xef,
  ñ: 0xf1,
  ò: 0xf2,
  ó: 0xf3,
  ô: 0xf4,
  õ: 0xf5,
  ö: 0xf6,
  ø: 0xf8,
  ù: 0xf9,
  ú: 0xfa,
  û: 0xfb,
  ü: 0xfc,
  ý: 0xfd,
  ÿ: 0xff,
  "–": 0x96,
  "—": 0x97,
  "€": 0x80,
};

function pdfString(value: string) {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 63;
    const byte = code >= 32 && code <= 126 ? code : (WIN[char] ?? 63);
    if (byte === 40 || byte === 41 || byte === 92) out += `\\${String.fromCharCode(byte)}`;
    else if (byte < 32 || byte > 126) out += `\\${byte.toString(8).padStart(3, "0")}`;
    else out += String.fromCharCode(byte);
  }
  return out;
}

function wrap(value: string, width: number) {
  const words = value.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines;
}

export function planningPdf(lines: string[]) {
  const wrapped = lines.flatMap((line) => (line.trim() ? wrap(line, 90) : [""]));
  const perPage = 40;
  const pages: string[][] = [];
  for (let index = 0; index < wrapped.length; index += perPage) {
    pages.push(wrapped.slice(index, index + perPage));
  }
  if (!pages.length) pages.push([""]);

  const objects: string[] = [];
  const pageIds: number[] = [];
  let nextId = 3;
  for (const page of pages) {
    const pageId = nextId;
    const contentId = nextId + 1;
    nextId += 2;
    pageIds.push(pageId);
    const commands = ["BT", "/F1 11 Tf", "14 TL", "48 790 Td"];
    page.forEach((line, index) => {
      if (index > 0) commands.push("T*");
      commands.push(`(${pdfString(line)}) Tj`);
    });
    commands.push("ET");
    const stream = commands.join("\n");
    objects[contentId] = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`;
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`;
  }
  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < nextId; id += 1) {
    offsets[id] = Buffer.byteLength(pdf);
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${nextId}\n`;
  pdf += "0000000000 65535 f \n";
  for (let id = 1; id < nextId; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${nextId} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

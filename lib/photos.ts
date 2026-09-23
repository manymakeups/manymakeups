import { readdir } from "node:fs/promises";
import { join } from "node:path";

export type Photo = {
  src: string;
  alt: string;
  name: string;
};

export type BeforeAfterPair = {
  before: Photo;
  after: Photo;
};

const IMAGE = /\.(jpe?g|png|webp|gif)$/i;

const FEATURED_MAIN = [
  "19.jpg",
  "2.jpg",
  "1.jpg",
  "8.jpg",
  "27.jpg",
  "32.jpeg",
  "40.JPG",
  "45.jpg",
];

function publicSrc(relativeFromPublic: string) {
  return `/${relativeFromPublic
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

function natural(a: string, b: string) {
  return a.localeCompare(b, "es", { numeric: true, sensitivity: "base" });
}

function weave<T>(base: T[], extras: T[]): T[] {
  if (!extras.length) return base;
  if (!base.length) return extras;
  const out: T[] = [];
  const stride = Math.max(2, Math.floor(base.length / extras.length));
  let extraIndex = 0;
  base.forEach((item, index) => {
    out.push(item);
    if (extraIndex < extras.length && (index + 1) % stride === 0) {
      out.push(extras[extraIndex]);
      extraIndex += 1;
    }
  });
  while (extraIndex < extras.length) {
    out.push(extras[extraIndex]);
    extraIndex += 1;
  }
  return out;
}

async function listImages(relDir: string, alt: string): Promise<Photo[]> {
  const dir = join(process.cwd(), "public", relDir);
  const entries = await readdir(dir, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isFile() && IMAGE.test(entry.name))
    .map((entry) => entry.name)
    .sort(natural);

  const nameSet = new Set(names.map((name) => name.toLowerCase()));
  const unique = names.filter((name) => {
    const copy = name.match(/^(.*) \((\d+)\)(\.[^.]+)$/);
    if (!copy) return true;
    return !nameSet.has(`${copy[1]}${copy[3]}`.toLowerCase());
  });

  return unique.map((name) => ({
    name,
    src: publicSrc(`${relDir}/${name}`),
    alt,
  }));
}

function pairBeforeAfter(files: Photo[]): BeforeAfterPair[] {
  const numbered = files
    .map((file) => {
      const match = file.name.match(/^(\d+)/);
      return match ? { file, n: Number(match[1]) } : null;
    })
    .filter((item): item is { file: Photo; n: number } => item !== null)
    .sort((a, b) => a.n - b.n);

  const pairs: BeforeAfterPair[] = [];
  for (let i = 0; i + 1 < numbered.length; i += 2) {
    pairs.push({
      before: {
        ...numbered[i].file,
        alt: "Antes del maquillaje",
      },
      after: {
        ...numbered[i + 1].file,
        alt: "Después del maquillaje",
      },
    });
  }
  return pairs;
}

const LOOKBOOK_NEW = [
  "PHOTO-2026-08-26-13-47-10.jpg",
  "PHOTO-2026-08-26-08-02-46.jpg",
  "PHOTO-2026-08-26-08-02-47.jpg",
];

export async function getPhotos() {
  const [main, bridal, hair, makeup, beforeAfter, glitter] = await Promise.all([
    listImages("photos/bridal/main", "Look de pareja, Many Makeups"),
    listImages("photos/bridal", "Pareja, Many Makeups"),
    listImages("photos/hair", "Peinado, Many Makeups"),
    listImages("photos/makeup", "Maquillaje, Many Makeups"),
    listImages("photos/before-after", "Antes y después, Many Makeups"),
    listImages("photos/glitter-bar", "Glitter Bar y beauty corner, Many Makeups"),
  ]);

  const mainNames = new Set(main.map((photo) => photo.name.toLowerCase()));
  const bridalRest = bridal.filter(
    (photo) => !mainNames.has(photo.name.toLowerCase()),
  );
  const pinnedNames = new Set(LOOKBOOK_NEW.map((name) => name.toLowerCase()));
  const pinned = LOOKBOOK_NEW.map((name) =>
    bridalRest.find((photo) => photo.name.toLowerCase() === name.toLowerCase()),
  ).filter((photo): photo is Photo => Boolean(photo));
  const newlyAdded = bridalRest.filter(
    (photo) =>
      /^nyp_/i.test(photo.name) && !pinnedNames.has(photo.name.toLowerCase()),
  );
  const bridalOlder = bridalRest.filter(
    (photo) =>
      !/^nyp_/i.test(photo.name) && !pinnedNames.has(photo.name.toLowerCase()),
  );

  const featured = FEATURED_MAIN.map((name) =>
    main.find((photo) => photo.name === name),
  ).filter((photo): photo is Photo => Boolean(photo));

  const featuredSrc = new Set(featured.map((photo) => photo.src));
  const mainRest = main.filter((photo) => !featuredSrc.has(photo.src));

  const pairs = pairBeforeAfter(beforeAfter);
  const featuredPairNames = new Set(
    ["1.jpeg", "10.jpeg", "14.jpeg", "18.jpg"].map((name) => name.toLowerCase()),
  );
  const featuredPairs = pairs.filter((pair) =>
    featuredPairNames.has(pair.before.name.toLowerCase()),
  );

  return {
    hero: featured[0] ?? main[0],
    portrait: {
      name: "corporativa.jpg",
      src: "/photos/ana/corporativa.jpg",
      alt: "Ana Zarza, estilista de Many Makeups, en su estudio de Nules",
    },
    featured,
    gallery: {
      parejas: [...pinned, ...weave([...mainRest, ...bridalOlder], newlyAdded)],
      peinado: hair,
      maquillaje: makeup,
      eventos: glitter,
    },
    beforeAfter: {
      featured: featuredPairs.length ? featuredPairs : pairs.slice(0, 4),
      rest: pairs.filter(
        (pair) => !featuredPairNames.has(pair.before.name.toLowerCase()),
      ),
      all: pairs,
    },
  };
}

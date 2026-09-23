type Photo = { src: string; alt: string };

type Pair = {
  before: Photo;
  after: Photo;
};

function FullPhoto({ photo, label }: { photo: Photo; label: string }) {
  return (
    <figure>
      <img
        src={photo.src}
        alt={photo.alt}
        className="block h-auto w-full bg-linen"
      />
      <figcaption className="mt-2 text-[0.62rem] uppercase tracking-[0.22em] text-gilt">
        {label}
      </figcaption>
    </figure>
  );
}

export function BeforeAfterPair({ pair }: { pair: Pair }) {
  return (
    <div className="grid grid-cols-2 items-start gap-3 md:gap-4">
      <FullPhoto photo={pair.before} label="Antes" />
      <FullPhoto photo={pair.after} label="Después" />
    </div>
  );
}

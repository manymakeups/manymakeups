"use client";

import { useState } from "react";
import { BeforeAfterPair } from "./BeforeAfterPair";
import { useI18n } from "@/lib/i18n/context";

type Pair = {
  before: { src: string; alt: string };
  after: { src: string; alt: string };
};

export function BeforeAfterGrid({
  featured,
  rest,
}: {
  featured: Pair[];
  rest: Pair[];
}) {
  const { messages: t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-12 grid gap-10 md:gap-14">
        {featured.map((pair) => (
          <BeforeAfterPair key={pair.before.src} pair={pair} />
        ))}
      </div>
      {open ? (
        <div className="mt-10 grid gap-10 md:gap-14">
          {rest.map((pair) => (
            <BeforeAfterPair key={pair.before.src} pair={pair} />
          ))}
        </div>
      ) : null}
      {rest.length && !open ? (
        <button type="button" className="btn-atelier mt-10" onClick={() => setOpen(true)}>
          {t.common.moreChanges}
        </button>
      ) : null}
    </>
  );
}

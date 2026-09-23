"use client";

import { useEffect, useState } from "react";
import { googleReviews, site } from "@/lib/site";
import { useI18n } from "@/lib/i18n/context";

const PREVIEW = 3;

function Stars() {
  return (
    <span className="flex gap-1 text-gilt" aria-label="5 estrellas">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          className="size-3"
          fill="currentColor"
          aria-hidden
        >
          <path d="M6 0.8 7.4 4.3 11.2 4.6 8.3 7.1 9.2 10.8 6 8.8 2.8 10.8 3.7 7.1 0.8 4.6 4.6 4.3z" />
        </svg>
      ))}
    </span>
  );
}

export function GoogleReviews() {
  const { messages: t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = googleReviews.length;
  const visible = Array.from({ length: Math.min(PREVIEW, total) }, (_, offset) => {
    const review = googleReviews[(index + offset) % total];
    return { review, key: `${review.name}-${review.role}-${offset}` };
  });

  useEffect(() => {
    if (paused || total <= PREVIEW) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, total]);

  const step = (delta: number) => {
    setIndex((current) => (current + delta + total) % total);
  };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gilt">
        {t.reviews.kicker}
      </p>
      <div className="relative mt-8">
        <div className="grid gap-6 md:grid-cols-3">
          {visible.map(({ review, key }) => (
            <figure key={key} className="flex h-full flex-col border border-ink/10 p-6 md:p-7">
              <Stars />
              <blockquote className="flex-1">
                <p className="mt-4 text-sm leading-relaxed text-ash">{review.text}</p>
              </blockquote>
              <figcaption className="mt-5 text-[0.68rem] uppercase tracking-[0.18em] text-ink">
                {review.name}
                <span className="text-ash">
                  {" "}
                  · {t.reviews.roles[review.role] ?? review.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <button
          type="button"
          className="absolute -left-2 top-1/2 z-10 hidden -translate-y-1/2 px-2 py-4 text-ink/50 transition hover:text-ink md:block lg:-left-8"
          onClick={() => step(-1)}
          aria-label={t.common.prevReviews}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            aria-hidden
          >
            <path d="M15 5 8 12l7 7" />
          </svg>
        </button>
        <button
          type="button"
          className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 px-2 py-4 text-ink/50 transition hover:text-ink md:block lg:-right-8"
          onClick={() => step(1)}
          aria-label={t.common.nextReviews}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            aria-hidden
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div
        className="mt-6 flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label={t.reviews.kicker}
      >
        <button
          type="button"
          className="px-2 py-3 text-ink/50 transition hover:text-ink md:hidden"
          onClick={() => step(-1)}
          aria-label={t.common.prevReviews}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            aria-hidden
          >
            <path d="M15 5 8 12l7 7" />
          </svg>
        </button>
        {googleReviews.map((item, i) => (
          <button
            key={`${item.name}-${item.role}`}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${t.reviews.kicker} ${i + 1} / ${total}`}
            className={`size-1.5 rounded-full transition ${
              i === index ? "bg-gilt" : "bg-ink/20 hover:bg-ink/40"
            }`}
            onClick={() => setIndex(i)}
          />
        ))}
        <button
          type="button"
          className="px-2 py-3 text-ink/50 transition hover:text-ink md:hidden"
          onClick={() => step(1)}
          aria-label={t.common.nextReviews}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            aria-hidden
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <a
        className="nav-link mt-8 inline-block text-ash hover:text-ink"
        href={site.googleReviewsUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t.reviews.google}
      </a>
    </div>
  );
}

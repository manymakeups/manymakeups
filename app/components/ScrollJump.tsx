"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";

const btnClass =
  "inline-flex items-center gap-2 border border-ink bg-porcelain px-3.5 py-3 text-[0.65rem] uppercase tracking-[0.18em] text-ink shadow-[0_10px_30px_rgba(26,22,19,0.08)] transition-[background,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:text-porcelain";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ScrollJump() {
  const { messages: t } = useI18n();
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(true);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const view = window.innerHeight;
      const max = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      setShowUp(y > 420);
      setShowDown(y + view < max - 80);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="site-jump fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 hidden flex-col gap-2 md:flex">
      {showDown ? (
        <button
          type="button"
          aria-label={t.common.scrollDown}
          className={btnClass}
          onClick={() => {
            window.scrollBy({
              top: window.innerHeight * 0.9,
              behavior: prefersReducedMotion() ? "auto" : "smooth",
            });
          }}
        >
          {t.common.scrollDown}
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            aria-hidden
          >
            <path d="M5 9l7 7 7-7" />
          </svg>
        </button>
      ) : null}
      {showUp ? (
        <button
          type="button"
          aria-label={t.common.scrollUp}
          className={btnClass}
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: prefersReducedMotion() ? "auto" : "smooth",
            });
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            aria-hidden
          >
            <path d="M5 15l7-7 7 7" />
          </svg>
          {t.common.scrollUp}
        </button>
      ) : null}
    </div>
  );
}

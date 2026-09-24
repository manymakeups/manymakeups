"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";

const btnClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 border border-ink bg-porcelain px-3 py-3 text-[0.65rem] uppercase tracking-[0.18em] text-ink shadow-[0_10px_30px_rgba(26,22,19,0.08)] transition-[background,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:text-porcelain md:min-w-0 md:px-3.5";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function viewport() {
  const view = window.visualViewport;
  return {
    y: view?.pageTop ?? window.scrollY,
    height: view?.height ?? window.innerHeight,
  };
}

export function ScrollJump() {
  const { messages: t } = useI18n();
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(true);

  useEffect(() => {
    const update = () => {
      const { y, height } = viewport();
      const max = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      setShowUp(y > Math.min(220, height * 0.3));
      setShowDown(y + height < max - 64);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div className="site-jump pointer-events-none fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 flex flex-col items-end gap-2">
      {showDown ? (
        <button
          type="button"
          aria-label={t.common.scrollDown}
          className={`pointer-events-auto ${btnClass}`}
          onClick={() => {
            window.scrollBy({
              top: viewport().height * 0.9,
              behavior: prefersReducedMotion() ? "auto" : "smooth",
            });
          }}
        >
          <span className="hidden md:inline">{t.common.scrollDown}</span>
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
          className={`pointer-events-auto ${btnClass}`}
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
          <span className="hidden md:inline">{t.common.scrollUp}</span>
        </button>
      ) : null}
    </div>
  );
}

"use client";

import { BrandLogo } from "./BrandLogo";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const WORD_MS = 3400;
const LOGO_MS = 1600;

const beats = [
  {
    type: "word" as const,
    n: "I",
    words: ["Estilismo", "Styling", "Stylisme"],
  },
  { type: "logo" as const },
  {
    type: "word" as const,
    n: "II",
    words: ["Formación", "Training", "Formation"],
  },
  { type: "logo" as const },
  {
    type: "word" as const,
    n: "III",
    words: ["Estética", "Aesthetics", "Esthétique"],
  },
  { type: "logo" as const, fly: true },
];

export function IntroSplash() {
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const logoRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const close = useCallback(() => {
    clearTimers();
    document.documentElement.classList.remove("intro-active", "intro-flying");
    setOpen(false);
  }, []);

  const flyToHeader = useCallback(() => {
    const source = logoRef.current;
    const target = document
      .getElementById("site-header-logo")
      ?.querySelector("img");
    if (!source || !target) {
      close();
      return;
    }
    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    if (!from.width || !to.width) {
      close();
      return;
    }
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const scale = to.width / from.width;
    source.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    document.documentElement.classList.add("intro-flying");
    timers.current.push(window.setTimeout(() => close(), 1900));
  }, [close]);

  useLayoutEffect(() => {
    document.documentElement.classList.remove("intro-flying");
    document.documentElement.classList.add("intro-active");
  }, []);

  useEffect(() => {
    if (!open) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (reduced) {
      timers.current.push(window.setTimeout(() => close(), 4000));
    } else {
      let delay = 0;
      beats.forEach((beat, i) => {
        timers.current.push(window.setTimeout(() => setIndex(i), delay));
        if ("fly" in beat && beat.fly) {
          timers.current.push(
            window.setTimeout(() => {
              requestAnimationFrame(() => flyToHeader());
            }, delay + 700),
          );
        }
        delay += beat.type === "word" ? WORD_MS : LOGO_MS;
      });
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      clearTimers();
    };
  }, [open, close, flyToHeader]);

  if (!open) return null;

  const beat = beats[index];
  const showWord = beat.type === "word";
  const skip = "Saltar · Skip · Passer";

  return (
    <div
      className="intro-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-heading"
    >
      <button type="button" className="intro-skip" onClick={() => close()}>
        {skip}
      </button>
      <div className="intro-stage">
        <div
          ref={logoRef}
          className={`intro-logo ${showWord ? "" : "is-in"}`}
        >
          <BrandLogo
            size="block"
            priority
            className="size-[min(52vw,11.5rem)] md:size-[16rem] xl:size-[18rem]"
          />
        </div>
        {showWord ? (
          <div key={beat.n} className="intro-slide">
            <p className="intro-kicker">{beat.n}</p>
            <p id="intro-heading" className="intro-word-stack">
              {beat.words.map((word) => (
                <span key={word} className="intro-word">
                  {word}
                </span>
              ))}
            </p>
          </div>
        ) : (
          <p id="intro-heading" className="sr-only">
            Many Makeups
          </p>
        )}
      </div>
    </div>
  );
}

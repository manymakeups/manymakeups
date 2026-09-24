"use client";

import { BrandLogo } from "./BrandLogo";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const WORD_MS = 4200;
const LOGO_MS = 2800;
const OVERLAP_MS = 480;

const dirs = ["ne", "nw", "sw", "se"] as const;

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
  const [leaving, setLeaving] = useState<number | null>(null);
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
    source.style.animation = "none";
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
        const duration = beat.type === "word" ? WORD_MS : LOGO_MS;
        timers.current.push(
          window.setTimeout(() => {
            if (i > 0) setLeaving(i - 1);
            setIndex(i);
            timers.current.push(
              window.setTimeout(() => setLeaving(null), OVERLAP_MS + 200),
            );
          }, delay),
        );
        if ("fly" in beat && beat.fly) {
          timers.current.push(
            window.setTimeout(() => {
              requestAnimationFrame(() => flyToHeader());
            }, delay + Math.round(duration * 0.52)),
          );
        }
        delay += duration - OVERLAP_MS;
      });
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      clearTimers();
    };
  }, [open, close, flyToHeader]);

  if (!open) return null;

  const current = beats[index];
  const logoIn = current.type === "logo";
  const leavingBeat = leaving !== null ? beats[leaving] : null;
  const logoIndex = logoIn
    ? index
    : leavingBeat?.type === "logo" && leaving !== null
      ? leaving
      : -1;
  const skip = "Saltar · Skip · Passer";
  const visible = [leaving, index].filter(
    (value, i, all): value is number =>
      value !== null && all.indexOf(value) === i,
  );

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
          className={
            logoIndex >= 0
              ? `intro-logo is-play is-${dirs[logoIndex % dirs.length]}`
              : "intro-logo"
          }
          style={
            logoIndex >= 0 ? { animationDuration: `${LOGO_MS}ms` } : undefined
          }
        >
          <BrandLogo
            size="block"
            priority
            className="size-[min(52vw,11.5rem)] md:size-[16rem] xl:size-[18rem]"
          />
        </div>
        {visible.map((beatIndex) => {
          const beat = beats[beatIndex];
          if (beat.type !== "word") return null;
          return (
            <div
              key={beat.n}
              className={`intro-slide is-play is-${dirs[beatIndex % dirs.length]}`}
              style={{ animationDuration: `${WORD_MS}ms` }}
            >
              <p className="intro-kicker">{beat.n}</p>
              <p
                id={beatIndex === index ? "intro-heading" : undefined}
                className="intro-word-stack"
              >
                {beat.words.map((word) => (
                  <span key={word} className="intro-word">
                    {word}
                  </span>
                ))}
              </p>
            </div>
          );
        })}
        {current.type === "logo" ? (
          <p id="intro-heading" className="sr-only">
            Many Makeups
          </p>
        ) : null}
      </div>
    </div>
  );
}

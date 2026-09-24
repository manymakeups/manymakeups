"use client";

import { BrandLogo } from "./BrandLogo";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

const WORD_MS = 2500;
const GAP_MS = 700;
const PRELUDE_MS = 700;
const HOLD_MS = 750;
const SEEN_KEY = "mm-intro-seen";


const beats = [
  {
    n: "I",
    words: ["Estilismo", "Styling", "Stylisme"],
    mark: "/photos/bridal/19.jpg",
  },
  {
    n: "II",
    words: ["Formación", "Training", "Formation"],
    mark: "/photos/atelier/formacion.jpg",
  },
  {
    n: "III",
    words: ["Estética", "Aesthetics", "Esthétique"],
    mark: "/photos/atelier/piel.jpg",
  },
  {
    n: "IV",
    words: ["Eventos", "Events", "Événements"],
    mark: "/photos/atelier/eventos.jpg",
  },
];

export function IntroSplash() {
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState<number[]>([]);
  const logoRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const close = useCallback(() => {
    clearTimers();
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore private-mode quota */
    }
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
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) {
      document.documentElement.classList.remove("intro-active", "intro-flying");
      setOpen(false);
      return;
    }
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
      let delay = PRELUDE_MS;
      beats.forEach((_, i) => {
        timers.current.push(
          window.setTimeout(() => {
            setIndex(i);
            setActive((prev) => (prev.includes(i) ? prev : [...prev, i]));
          }, delay),
        );
        timers.current.push(
          window.setTimeout(() => {
            setActive((prev) => prev.filter((item) => item !== i));
          }, delay + WORD_MS),
        );
        delay += WORD_MS + GAP_MS;
      });
      timers.current.push(
        window.setTimeout(() => {
          requestAnimationFrame(() => flyToHeader());
        }, delay - GAP_MS + HOLD_MS),
      );
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      clearTimers();
    };
  }, [open, close, flyToHeader]);

  if (!open) return null;

  const skip = "Saltar · Skip · Passer";
  const wordsOn = active.length > 0;

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
          className={`intro-logo${wordsOn ? " is-dim" : ""}`}
        >
          <BrandLogo
            size="block"
            priority
            className="size-[min(52vw,11.5rem)] md:size-[16rem] xl:size-[18rem]"
          />
        </div>
        {active.map((beatIndex) => {
          const beat = beats[beatIndex];
          return (
            <div
              key={beat.n}
              className="intro-slide is-play"
              style={{ animationDuration: `${WORD_MS}ms`, ["--intro-ms" as string]: `${WORD_MS}ms` }}
            >
              <span className="intro-mark" aria-hidden>
                <Image
                  src={beat.mark}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 22rem, 52vw"
                  className="object-cover"
                  priority={beatIndex === 0}
                />
              </span>
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
        {!wordsOn ? (
          <p id="intro-heading" className="sr-only">
            Many Makeups
          </p>
        ) : null}
      </div>
    </div>
  );
}

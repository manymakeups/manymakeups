"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type DrawFrameProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  eager?: boolean;
};

export function DrawFrame({
  children,
  className = "",
  delay = 0,
  eager = false,
}: DrawFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (eager) {
      const id = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <div
      ref={ref}
      className={`draw-frame ${visible ? "is-in" : ""} ${className}`}
      style={{ ["--draw-delay" as string]: `${delay}ms` }}
    >
      <span className="draw-frame__edge draw-frame__edge--t" />
      <span className="draw-frame__edge draw-frame__edge--r" />
      <span className="draw-frame__edge draw-frame__edge--b" />
      <span className="draw-frame__edge draw-frame__edge--l" />
      {children}
    </div>
  );
}

"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade" | "line";
  eager?: boolean;
  as?: ElementType;
} & HTMLAttributes<HTMLElement>;

export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "fade",
  eager = false,
  as: Tag = "div",
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
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
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${variant} ${visible ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {variant === "line" ? <span>{children}</span> : children}
    </Tag>
  );
}

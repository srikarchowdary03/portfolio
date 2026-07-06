"use client";

// The signature interaction: benchmark values count up once when they enter
// the viewport. Static under prefers-reduced-motion (final value renders
// immediately). The animation writes textContent imperatively — 60 renders/s
// through React state would be wasteful for pure presentation.

import { useEffect, useRef } from "react";

interface Props {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
}

function format(n: number, decimals: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function CountUp({ value, decimals = 0, prefix = "", suffix = "", durationMs = 900 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const render = (n: number) => {
      el.textContent = `${prefix}${format(n, decimals)}${suffix}`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(value);
      el.dataset.countupDone = "true";
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / durationMs, 1);
          const eased = 1 - (1 - t) ** 3; // ease-out cubic
          render(value * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
          else el.dataset.countupDone = "true";
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, decimals, prefix, suffix, durationMs]);

  // Server-rendered fallback shows the FINAL value (correct without JS);
  // the effect restarts from 0 only when the animation actually runs.
  return (
    <span ref={ref}>
      {prefix}
      {format(value, decimals)}
      {suffix}
    </span>
  );
}

"use client";

// The hero's signature visual: an abstract embedding space — points drifting
// in loose semantic clusters, near neighbors faintly connected. Pure canvas,
// no dependencies. Renders one static frame when the visitor prefers reduced
// motion.

import { useEffect, useRef } from "react";

const CLUSTERS = [
  { x: 0.22, y: 0.32, hue: "124, 92, 255" },
  { x: 0.5, y: 0.62, hue: "34, 211, 238" },
  { x: 0.78, y: 0.3, hue: "124, 92, 255" },
  { x: 0.68, y: 0.75, hue: "34, 211, 238" },
  { x: 0.32, y: 0.8, hue: "167, 139, 250" },
];
const POINTS_PER_CLUSTER = 18;
const LINK_DISTANCE = 90;

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // cluster home
  hy: number;
  hue: string;
  r: number;
}

export function EmbeddingField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let points: Point[] = [];

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      points = CLUSTERS.flatMap((cluster) =>
        Array.from({ length: POINTS_PER_CLUSTER }, (_, i) => {
          // Deterministic-ish spread using index; jitter via sin/cos keeps
          // the field organic without Math.random at module scope.
          const angle = (i / POINTS_PER_CLUSTER) * Math.PI * 2;
          const radius = 30 + ((i * 37) % 70);
          const hx = cluster.x * clientWidth + Math.cos(angle) * radius;
          const hy = cluster.y * clientHeight + Math.sin(angle) * radius;
          return {
            x: hx,
            y: hy,
            vx: 0,
            vy: 0,
            hx,
            hy,
            hue: cluster.hue,
            r: 1.2 + ((i * 13) % 10) / 7,
          };
        })
      );
    };

    const step = (t: number) => {
      const { clientWidth, clientHeight } = canvas;
      ctx.clearRect(0, 0, clientWidth, clientHeight);

      // Drift: gentle orbital wander around each point's cluster home.
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (!reduced) {
          p.x = p.hx + Math.sin(t / 4200 + i * 1.7) * 26;
          p.y = p.hy + Math.cos(t / 5100 + i * 2.3) * 22;
        }
      }

      // Faint links between near neighbors (the "semantic similarity" cue).
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            ctx.strokeStyle = `rgba(${points[i].hue}, ${(0.13 * (1 - dist / LINK_DISTANCE)).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of points) {
        ctx.fillStyle = `rgba(${p.hue}, 0.75)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced) frame = requestAnimationFrame(step);
    };

    resize();
    frame = requestAnimationFrame(step);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full opacity-60 [mask-image:radial-gradient(75%_75%_at_50%_40%,black,transparent)]"
    />
  );
}

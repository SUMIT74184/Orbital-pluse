"use client";

import { useEffect, useRef } from "react";

// Brand colours as RGB so particles and links can share one alpha.
const COLORS = ["34 229 132", "76 154 255", "177 140 255", "124 245 255"];
const LINK_DIST = 130;
const REPEL_DIST = 140;

type Particle = { x: number; y: number; vx: number; vy: number; r: number; c: string; phase: number };

/**
 * Fixed, non-interactive backdrop for the signed-in pages: drifting particles that link up when close,
 * shy away from the pointer, and fade out towards the middle so the content column stays calm.
 */
export function AmbientBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -9999, y: -9999 };
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let frame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      el.width = w * dpr;
      el.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.round((w * h) / 14000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25 - 0.05,
        r: Math.random() * 1.8 + 0.8,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        if (!still) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < REPEL_DIST && d > 0) {
            const f = (1 - d / REPEL_DIST) * 0.6;
            p.x += (dx / d) * f;
            p.y += (dy / d) * f;
          }
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;
        }
      }
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK_DIST) continue;
          ctx.strokeStyle = `rgb(${a.c} / ${(1 - d / LINK_DIST) * 0.28})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      for (const p of particles) {
        const twinkle = 0.55 + 0.4 * Math.sin(t / 900 + p.phase);
        ctx.fillStyle = `rgb(${p.c} / ${twinkle})`;
        ctx.shadowColor = `rgb(${p.c} / 0.8)`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      if (!still) frame = requestAnimationFrame(draw);
    };

    const move = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const leave = () => {
      pointer.x = pointer.y = -9999;
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="aurora absolute -left-40 top-1/4 size-[520px] rounded-full bg-pulse/[0.07] blur-3xl" />
      <div className="aurora absolute -right-40 top-2/3 size-[560px] rounded-full bg-rev/[0.08] blur-3xl [animation-delay:-7s]" />
      <div className="aurora absolute -right-24 -top-32 size-[380px] rounded-full bg-new/[0.06] blur-3xl [animation-delay:-3s]" />
      <canvas ref={canvas} className="ambient-fade absolute inset-0 size-full" />
      <div className="ambient-grain absolute inset-0" />
    </div>
  );
}

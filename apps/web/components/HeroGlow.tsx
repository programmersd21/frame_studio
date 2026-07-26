"use client";

import React, { useCallback, useRef } from "react";

export const HeroGlow = () => {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothRef = useRef({ x: 0.5, y: 0.5 });

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
    if (!rafRef.current) {
      const tick = () => {
        smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.06;
        smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.06;
        if (ref.current) {
          ref.current.style.setProperty("--gx", `${smoothRef.current.x * 100}%`);
          ref.current.style.setProperty("--gy", `${smoothRef.current.y * 100}%`);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    mouseRef.current = { x: 0.5, y: 0.5 };
  }, []);

  React.useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background:
          "radial-gradient(600px circle at var(--gx, 50%) var(--gy, 50%), rgba(0,113,227,0.08) 0%, rgba(191,90,242,0.04) 30%, transparent 60%)",
      }}
    />
  );
};

"use client";

import { useRef, useCallback, useState, type ReactNode, type CSSProperties } from "react";

interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
  variant?: "card" | "surface" | "overlay" | "thin";
  dynamic?: boolean;
  style?: CSSProperties;
  glowColor?: string;
}

const SOFT = "cubic-bezier(0.22, 1, 0.36, 1)";

const variantClass: Record<string, string> = {
  card: "lg-card",
  surface: "lg",
  overlay: "lg-overlay",
  thin: "lg-thin",
};

export const LiquidGlass = ({
  children,
  className = "",
  variant = "card",
  dynamic = false,
  style = {},
  glowColor,
}: LiquidGlassProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: -10 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number>();

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setMousePos({ x: 50, y: -10 });
  }, []);

  return (
    <div
      ref={ref}
      className={`${variantClass[variant] || "lg-card"} ${className}`}
      style={style}
      onMouseMove={dynamic ? handleMouseMove : undefined}
      onMouseEnter={dynamic ? handleMouseEnter : undefined}
      onMouseLeave={dynamic ? handleMouseLeave : undefined}
    >
      {dynamic && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
          style={{
            opacity: isHovering ? 1 : 0,
            transition: `opacity 0.6s ${SOFT}`,
            background: glowColor
              ? `radial-gradient(circle 500px at ${mousePos.x}% ${mousePos.y}%, ${glowColor} 0%, transparent 60%)`
              : `radial-gradient(circle 500px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 25%, transparent 60%)`,
            zIndex: 0,
          }}
        />
      )}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

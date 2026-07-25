"use client";

import { useEffect, useState } from "react";

type CursorVariant = "default" | "pointer" | "text" | "grabbing";

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [isClicking, setIsClicking] = useState(false);
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsTouch(!mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isTouch) return;
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      
      // Determine cursor variant based on element
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        setVariant("text");
      } else if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "SELECT" ||
        target.closest("button") ||
        target.closest("a") ||
        target.getAttribute("role") === "button" ||
        target.getAttribute("role") === "option"
      ) {
        setVariant("pointer");
      } else {
        setVariant("default");
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isTouch]);

  const getColor = () => {
    if (isClicking) return "#0071e3";
    if (variant === "pointer") return "#0071e3";
    return "#1d1d1f";
  };

  const getScale = () => {
    if (isClicking) return 0.85;
    if (variant === "pointer") return 1.15;
    if (variant === "text") return 1.05;
    return 1;
  };

  if (isTouch) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: "none",
      }}
    >
      {variant === "text" ? (
        // I-beam cursor for text input
        <svg
          width="20"
          height="24"
          viewBox="0 0 20 24"
          fill="none"
          className="transition-all duration-150 ease-out -translate-x-1/2"
          style={{
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
            transform: `scale(${getScale()}) translateX(-50%)`,
          }}
        >
          <rect x="9" y="2" width="2" height="20" fill={getColor()} />
          <rect x="6" y="1" width="8" height="2" fill={getColor()} />
          <rect x="6" y="21" width="8" height="2" fill={getColor()} />
        </svg>
      ) : (
        // Default arrow pointer
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="transition-all duration-150 ease-out"
          style={{
            filter:
              variant === "pointer"
                ? "drop-shadow(0 2px 4px rgba(0,113,227,0.3))"
                : "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
            transform: `scale(${getScale()})`,
          }}
        >
          <path
            d="M5.5 3.5L18.5 10.5L11 12.5L9 20L5.5 3.5Z"
            fill={getColor()}
            className="transition-colors duration-150"
          />
          <path
            d="M5.5 3.5L18.5 10.5L11 12.5L9 20L5.5 3.5Z"
            stroke="white"
            strokeWidth="1"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>
      )}
    </div>
  );
};

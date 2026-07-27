"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

export type ButtonState = "idle" | "pressing" | "animating" | "loading" | "success";

interface GenerateButtonProps {
  state: ButtonState;
  onClick: () => void;
  disabled?: boolean;
}

const SOFT = [0.22, 1, 0.36, 1] as const;

export const GenerateButton: React.FC<GenerateButtonProps> = ({ state, onClick, disabled }) => {
  return (
    <motion.button
      animate={
        state === "pressing" || state === "animating"
          ? { scale: [1, 1.03, 1] }
          : state
      }
      transition={{ duration: 0.35, ease: SOFT }}
      onClick={onClick}
      disabled={disabled || state !== "idle"}
      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
      className="relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-full overflow-hidden
        bg-[#1d1d1f] text-white text-[11px] sm:text-xs font-semibold min-w-[80px] sm:min-w-[120px] h-[34px] sm:h-[36px]
        shadow-[0_4px_14px_rgba(0,0,0,0.14)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.22)]"
    >
      <AnimatePresence mode="wait">
        {state === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: SOFT }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Generating\u2026</span>
          </motion.span>
        )}

        {state === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: SOFT }}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready</span>
          </motion.span>
        )}

        {(state === "idle" || state === "pressing") && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: SOFT }}
            className="flex items-center gap-2"
          >
            <span>Generate</span>
            <motion.svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </motion.svg>
          </motion.span>
        )}

        {state === "animating" && (
          <motion.span
            key="animating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center relative w-4 h-4"
          >
            <motion.div
              className="absolute inset-0 rounded-full border border-white/30"
              initial={{ scale: 0.3, opacity: 0.8 }}
              animate={{
                scale: [0.3, 2.8],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 0.55,
                ease: "easeOut",
              }}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-white/80"
              animate={{ scale: [1, 1.6, 1] }}
              transition={{
                duration: 0.55,
                ease: "easeInOut",
              }}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
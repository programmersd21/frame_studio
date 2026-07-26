"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SOFT = [0.22, 1, 0.36, 1] as const;

interface ProgressScreenProps {
  stage: string;
  percent?: number;
  onClose?: () => void;
}

interface Orb {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
}

function genOrbs(): Orb[] {
  return [
    { x: 20, y: 30, size: 300, color: "rgba(0,113,227,0.04)", delay: 0, duration: 18, driftX: 8, driftY: -5 },
    { x: 80, y: 50, size: 250, color: "rgba(191,90,242,0.03)", delay: 3, duration: 22, driftX: -6, driftY: 8 },
    { x: 50, y: 70, size: 350, color: "rgba(52,224,164,0.03)", delay: 6, duration: 15, driftX: 10, driftY: -3 },
  ];
}

export const ProgressScreen = ({ stage, percent, onClose }: ProgressScreenProps) => {
  const isDone = percent === 100;
  const orbs = useMemo(() => genOrbs(), []);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose?.(), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isClosing ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: SOFT }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-6 overflow-hidden"
      style={{
        background: "rgba(249,249,251,0.65)",
        backdropFilter: "blur(60px) saturate(180%)",
        WebkitBackdropFilter: "blur(60px) saturate(180%)",
      }}
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            marginLeft: -orb.size / 2,
            marginTop: -orb.size / 2,
            background: `radial-gradient(ellipse at center, ${orb.color} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, orb.driftX, -orb.driftX * 0.5, 0],
            y: [0, orb.driftY, -orb.driftY * 0.3, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,113,227,0.03) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(191,90,242,0.02) 0%, transparent 50%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: isClosing ? 0 : 1, scale: isClosing ? 0.92 : 1, y: isClosing ? 20 : 0 }}
        transition={{ duration: 0.4, ease: SOFT }}
        className="w-full max-w-sm relative"
      >
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.07), 0 10px 32px rgba(0,0,0,0.03), 0 1px 0 0 rgba(255,255,255,0.85) inset, 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          {onClose && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/[0.06] transition-all duration-200 group"
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#86868b] group-hover:text-[#1d1d1f] transition-colors">
                <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <div className="px-8 pt-8 pb-7 text-center">
            {/* Animated indicator ring */}
            <div className="relative w-14 h-14 mx-auto mb-5 flex items-center justify-center">
              {isDone ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-14 h-14 rounded-full bg-[#34c759] flex items-center justify-center"
                  style={{ boxShadow: "0 0 24px rgba(52,199,89,0.35)" }}
                >
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.3, ease: SOFT }}
                    width="20" height="16" viewBox="0 0 20 16" fill="none"
                  >
                    <motion.path
                      d="M2 8.5L7 13.5L18 2"
                      stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.3, ease: SOFT }}
                    />
                  </motion.svg>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: "2px solid rgba(0,113,227,0.1)",
                      borderTopColor: "#0071e3",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-[-4px] rounded-full"
                    style={{
                      border: "1.5px solid transparent",
                      borderTopColor: "rgba(0,113,227,0.15)",
                    }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#0071e3]"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    style={{ boxShadow: "0 0 12px rgba(0,113,227,0.4)" }}
                  />
                </>
              )}
            </div>

            <h3 className="text-base font-semibold text-[#1d1d1f] tracking-tight mb-1">
              {isDone ? "Complete" : "Generating video"}
            </h3>

            <div className="h-6 flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                <motion.p
                  key={stage}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: SOFT }}
                  className="text-sm text-[#86868b] font-medium"
                >
                  {stage || "Processing..."}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="mt-5 h-1.5 bg-black/[0.05] rounded-full overflow-hidden relative">
              {isDone ? (
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.5, ease: SOFT }}
                  className="absolute top-0 left-0 h-full rounded-full bg-[#34c759]"
                  style={{ boxShadow: "0 0 8px rgba(52,199,89,0.3)" }}
                />
              ) : percent === 0 || percent === undefined ? (
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <motion.div
                    className="absolute inset-y-0 rounded-full"
                    style={{
                      width: "40%",
                      background: "linear-gradient(90deg, transparent, #0071e3, transparent)",
                      filter: "blur(1px)",
                    }}
                    animate={{ x: ["-100%", "350%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="absolute inset-0 bg-black/[0.03] rounded-full" />
                </div>
              ) : (
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full rounded-full bg-[#0071e3]"
                  style={{ boxShadow: "0 0 8px rgba(0,113,227,0.3)" }}
                />
              )}
            </div>

            {percent !== undefined && percent > 0 && percent < 100 && (
              <motion.p
                key={Math.floor(percent / 10)}
                className="mt-2 text-[11px] text-[#86868b] font-mono tabular-nums"
              >
                {percent}%
              </motion.p>
            )}
          </div>

          <div className="mx-8 h-px bg-black/[0.04]" />
          <div className="px-8 py-3 flex items-center justify-between text-[11px] text-[#86868b] font-mono">
            <span>Status</span>
            <span className="flex items-center gap-1.5">
              <motion.span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: isDone ? "#34c759" : "#0071e3" }}
                animate={{ opacity: isDone ? 1 : [0.4, 1, 0.4] }}
                transition={isDone ? {} : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              {isDone ? "Done" : "Processing"}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

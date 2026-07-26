"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

const THUMBNAILS = [
  "linear-gradient(135deg, #ff2d55, #ff9f0a)",
  "linear-gradient(135deg, #0071e3, #34e0a4)",
  "linear-gradient(135deg, #bf5af2, #0071e3)",
  "linear-gradient(135deg, #34e0a4, #ff2d55)",
  "linear-gradient(135deg, #ff9f0a, #bf5af2)",
  "linear-gradient(135deg, #1d1d1f, #86868b)",
  "linear-gradient(135deg, #34c759, #0071e3)",
  "linear-gradient(135deg, #ff2d55, #bf5af2)",
  "linear-gradient(135deg, #0071e3, #ff9f0a)",
  "linear-gradient(135deg, #34e0a4, #1d1d1f)",
  "linear-gradient(135deg, #bf5af2, #34c759)",
  "linear-gradient(135deg, #ff9f0a, #0071e3)",
];

export const VideoMarquee = () => {
  const items = useMemo(
    () =>
      THUMBNAILS.map((gradient, i) => ({
        id: i,
        gradient,
        label: `frame-studio-${i + 1}.mp4`,
      })),
    []
  );

  return (
    <div className="w-full overflow-hidden">
      <div className="relative">
        <motion.div
          className="flex gap-3"
          animate={{ x: [0, -1920] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...items, ...items, ...items].map((item, i) => (
            <div
              key={i}
              className="relative shrink-0 w-44 sm:w-52 h-24 sm:h-28 rounded-xl overflow-hidden"
              style={{ background: item.gradient }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4))",
                }}
              />
              <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                </div>
                <span className="text-[9px] font-mono text-white/50 truncate ml-2">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

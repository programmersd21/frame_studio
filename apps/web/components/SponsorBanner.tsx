"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

const DISMISS_KEY = "frame-studio-sponsor-dismissed";

export const SponsorBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl mx-auto px-4 sm:px-6"
        >
          <div
            className="relative rounded-2xl overflow-hidden lg-thin"
            style={{
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.9)",
            }}
          >
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#0071e3] to-[#bf5af2] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-[#1d1d1f] truncate">
                    Sponsored by{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0071e3] to-[#bf5af2]">
                      Your Brand
                    </span>
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#86868b] truncate">
                    AI-powered motion graphics — try it free
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="#"
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors"
                >
                  Learn more
                </a>
                <button
                  onClick={dismiss}
                  className="p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.06] transition-all"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

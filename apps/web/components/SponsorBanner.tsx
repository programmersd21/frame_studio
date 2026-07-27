"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export const SponsorBanner: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    fetch("https://api.github.com/users/programmersd21")
      .then((r) => r.json())
      .then((d) => setAvatarUrl(d.avatar_url + "?s=40"))
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6"
    >
      <div
        className="relative rounded-2xl overflow-hidden lg-thin"
        style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.9)" }}
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden bg-black/[0.04] ring-2 ring-black/[0.06]">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0071e3] to-[#bf5af2]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-[#1d1d1f] truncate">
                <span className="text-[#86868b] font-normal">Sponsored by </span>
                programmersd21
              </p>
              <p className="text-[10px] sm:text-[11px] text-[#86868b] truncate">
                Support open-source motion graphics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://github.com/sponsors/programmersd21"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0060c0] transition-all duration-200"
              style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
            >
              <Heart className="w-3.5 h-3.5" strokeWidth={2.5} />
              Sponsor
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

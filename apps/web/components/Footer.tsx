"use client";

import React from "react";
import { Github, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 w-full mt-16 sm:mt-32 mb-16 md:mb-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div
          className="rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 lg-thin"
          style={{
            boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.9)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4" style={{ color: "#0071e3" }} strokeWidth={1.5} />
            <span className="text-xs font-medium text-[#86868b] font-sans">
              Frame Studio &mdash; AI motion graphics
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/programmersd21/frame_studio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#a1a1a6] hover:text-[#1d1d1f] transition-all duration-200 font-sans"
            >
              <Github className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Source</span>
            </a>
            <span className="text-[10px] text-[#c7c7cC] font-mono">&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Download, X, Check, Cloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SOFT = [0.22, 1, 0.36, 1] as const;

interface PreviewScreenProps {
  videoUrl: string;
  filename: string;
  prompt?: string;
  model?: string;
  onClose: () => void;
}

export const PreviewScreen = ({ videoUrl, filename, prompt, model, onClose }: PreviewScreenProps) => {
  const [downloadState, setDownloadState] = React.useState<"idle" | "loading" | "success">("idle");
  const [saveState, setSaveState] = React.useState<"idle" | "loading" | "saved" | "error">("idle");
  const [isClosing, setIsClosing] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setDownloadState("loading");
    setTimeout(() => setDownloadState("success"), 800);
    setTimeout(() => setDownloadState("idle"), 2400);
  };

  const handleSave = async () => {
    setSaveState("loading");
    try {
      const res = await fetch(videoUrl);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append("video", blob, filename);
      formData.append("prompt", prompt || "");
      formData.append("model", model || "");

      const uploadRes = await fetch("/api/videos/save", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to save");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 350);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isClosing ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: SOFT }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(249,249,251,0.8)", backdropFilter: "blur(40px)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: isClosing ? 0 : 1, y: isClosing ? 40 : 0 }}
        transition={{ duration: 0.35, ease: SOFT }}
        className="w-full h-full md:h-auto md:max-w-lg md:max-h-[90vh] flex flex-col"
      >
        <div
          className="flex flex-col w-full h-full md:h-auto rounded-none md:rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(40px) saturate(200%)",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.05), 0 20px 60px rgba(0,0,0,0.06)",
          }}
        >
          {/* Handle bar (mobile) */}
          <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-9 h-1 rounded-full bg-black/[0.12]" />
          </div>

          {/* Header */}
          <div className="px-5 md:px-6 pt-2 md:pt-5 pb-3 md:pb-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#34c759] shrink-0" style={{ boxShadow: "0 0 12px rgba(52,199,89,0.4)" }} />
              <span className="text-sm font-semibold text-[#1d1d1f] tracking-tight">Your video is ready</span>
            </div>
            <button onClick={handleClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.06] transition-all duration-200">
              <X className="w-3.5 h-3.5 text-[#86868b]" strokeWidth={2} />
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0 px-5 md:px-6 pb-4">
            {/* Video */}
            <div className="rounded-xl overflow-hidden bg-black/[0.03] border border-black/[0.06] aspect-video">
              <video src={videoUrl} controls autoPlay className="w-full h-full object-contain" style={{ background: "#000" }} />
            </div>

            {/* File info */}
            <div className="pt-3 pb-1">
              <p className="text-xs text-[#86868b] font-mono truncate">{filename}</p>
            </div>
          </div>

          {/* Actions — always visible */}
          <div className="mx-5 md:mx-6 h-[1px] bg-black/[0.05] shrink-0" />
          <div className="px-5 md:px-6 py-4 md:py-4 flex items-center gap-3 shrink-0">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 md:py-2.5 rounded-xl text-xs font-medium text-[#86868b] bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.06] transition-all duration-200 active:scale-95"
            >
              Close
            </button>

            {user && (
              <motion.button
                onClick={handleSave}
                disabled={saveState === "loading" || saveState === "saved"}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{
                  background: saveState === "saved" ? "rgba(52,199,89,0.15)" : saveState === "error" ? "rgba(255,59,48,0.1)" : "rgba(0,113,227,0.1)",
                  color: saveState === "saved" ? "#34c759" : saveState === "error" ? "#ff3b30" : "#0071e3",
                }}
              >
                {saveState === "loading" ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-[#0071e3]/30 border-t-[#0071e3] rounded-full" />
                ) : saveState === "saved" ? (
                  <><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Saved</>
                ) : saveState === "error" ? (
                  <span>Try again</span>
                ) : (
                  <><Cloud className="w-3.5 h-3.5" strokeWidth={2.5} /> Save</>
                )}
              </motion.button>
            )}

            <motion.a
              href={downloadState === "idle" ? videoUrl : undefined}
              download={downloadState === "idle" ? filename : undefined}
              onClick={handleDownload}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all duration-200 relative overflow-hidden cursor-pointer"
              style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
            >
              <motion.div
                initial={false}
                animate={{ opacity: downloadState === "idle" ? 1 : 0, scale: downloadState === "idle" ? 1 : 0.8 }}
                className="flex items-center gap-2 absolute"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={2.5} /> Download
              </motion.div>
              <motion.div
                initial={false}
                animate={{ opacity: downloadState === "loading" ? 1 : 0, scale: downloadState === "loading" ? 1 : 0.8 }}
                className="flex items-center gap-2 absolute"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                <span>Downloading</span>
              </motion.div>
              <motion.div
                initial={false}
                animate={{ opacity: downloadState === "success" ? 1 : 0, scale: downloadState === "success" ? 1 : 0.8 }}
                className="flex items-center gap-2 absolute"
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Check className="w-4 h-4" strokeWidth={3} />
                </motion.div>
                <span>Done</span>
              </motion.div>
              <span className="invisible flex items-center gap-2"><span className="w-4 h-4" /><span>Downloading</span></span>
            </motion.a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

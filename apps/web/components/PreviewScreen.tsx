"use client";

import React from "react";
import { motion } from "framer-motion";
import { Download, X, Check, Cloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { VideoPlayer } from "@/components/VideoPlayer";

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
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    return () => { document.documentElement.style.overflow = prev; };
  }, []);

  const handleDownload = async () => {
    setDownloadState("loading");
    try {
      const res = await fetch(videoUrl);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadState("success");
      setTimeout(() => setDownloadState("idle"), 2400);
    } catch {
      setDownloadState("idle");
    }
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
      const uploadRes = await fetch("/api/videos/save", { method: "POST", body: formData });
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
      className="fixed inset-0 z-[999] flex items-center justify-center lg-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: isClosing ? 0 : 1, y: isClosing ? 30 : 0, scale: isClosing ? 0.97 : 1 }}
        transition={{ duration: 0.35, ease: SOFT }}
        className="w-[calc(100%-2rem)] max-w-lg"
      >
        <div
          className="rounded-2xl sm:rounded-3xl overflow-hidden lg-card"
          style={{
            background: "rgba(249,250,251,0.85)",
          }}
        >
          {/* Header */}
          <div className="px-5 sm:px-6 pt-4 sm:pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#34c759] shrink-0" style={{ boxShadow: "0 0 12px rgba(52,199,89,0.4)" }} />
              <span className="text-sm font-semibold text-[#1d1d1f] tracking-tight">Your video is ready</span>
            </div>
            <button onClick={handleClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.06] active:bg-black/[0.1] transition-all">
              <X className="w-3.5 h-3.5 text-[#86868b]" strokeWidth={2} />
            </button>
          </div>

          {/* Video */}
          <div className="px-5 sm:px-6">
            <div className="rounded-xl overflow-hidden bg-black aspect-video">
              <VideoPlayer src={videoUrl} autoPlay className="w-full h-full" />
            </div>
          </div>

          {/* Buttons */}
          <div className="px-5 sm:px-6 pt-3.5 pb-5 sm:pb-6 flex items-center justify-center gap-2.5">
            <button onClick={handleClose} className="px-5 py-2.5 rounded-xl text-xs font-medium text-[#86868b] bg-black/[0.04] hover:bg-black/[0.08] active:bg-black/[0.1] border border-black/[0.06] transition-all">
              Close
            </button>
            {user && (
              <button onClick={handleSave} disabled={saveState === "loading" || saveState === "saved"}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: saveState === "saved" ? "rgba(52,199,89,0.15)" : saveState === "error" ? "rgba(255,59,48,0.1)" : "rgba(0,113,227,0.1)",
                  color: saveState === "saved" ? "#34c759" : saveState === "error" ? "#ff3b30" : "#0071e3",
                }}
              >
                {saveState === "loading" ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#0071e3]/30 border-t-[#0071e3] rounded-full animate-spin" />
                ) : saveState === "saved" ? (
                  <><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Saved</>
                ) : saveState === "error" ? "Try again" : (
                  <><Cloud className="w-3.5 h-3.5" strokeWidth={2.5} /> Save</>
                )}
              </button>
            )}
            <button onClick={handleDownload} disabled={downloadState === "loading"}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0060c0] disabled:opacity-60 transition-all cursor-pointer"
              style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
            >
              {downloadState === "loading" ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : downloadState === "success" ? (
                <><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Downloaded</>
              ) : (
                <><Download className="w-3.5 h-3.5" strokeWidth={2.5} /> Download</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

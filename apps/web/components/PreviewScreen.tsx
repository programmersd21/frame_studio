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
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    return () => { document.documentElement.style.overflow = prev; };
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
      className="fixed inset-0 z-[999]"
      style={{ background: "rgba(249,249,251,0.8)", backdropFilter: "blur(40px)" }}
    >
      {/* Desktop: centered card */}
      <div className="hidden md:flex items-center justify-center w-full h-full p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: isClosing ? 0 : 1, scale: isClosing ? 0.96 : 1 }}
          transition={{ duration: 0.35, ease: SOFT }}
          className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
          style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(40px) saturate(200%)", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}
        >
          <DesktopContent videoUrl={videoUrl} filename={filename} user={user} downloadState={downloadState} saveState={saveState} handleDownload={handleDownload} handleSave={handleSave} handleClose={handleClose} />
        </motion.div>
      </div>

      {/* Mobile: full screen */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: isClosing ? "100%" : 0 }}
        transition={{ duration: 0.4, ease: SOFT }}
        className="md:hidden fixed inset-0 flex flex-col"
        style={{ background: "#fff" }}
      >
        {/* Header */}
        <div className="shrink-0 px-5 pt-3 pb-2 flex items-center justify-between safe-top">
          <div className="w-9 h-1 rounded-full bg-black/[0.12] absolute left-1/2 -translate-x-1/2 top-2" />
          <div className="flex items-center gap-2.5 pt-2">
            <div className="w-3 h-3 rounded-full bg-[#34c759] shrink-0" style={{ boxShadow: "0 0 12px rgba(52,199,89,0.4)" }} />
            <span className="text-sm font-semibold text-[#1d1d1f] tracking-tight">Your video is ready</span>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.06] active:bg-black/[0.1] transition-all pt-2">
            <X className="w-4 h-4 text-[#86868b]" strokeWidth={2} />
          </button>
        </div>

        {/* Video — fills remaining space */}
        <div className="flex-1 min-h-0 px-4">
          <div className="h-full rounded-xl overflow-hidden bg-black border border-black/[0.06]">
            <video src={videoUrl} controls autoPlay playsInline className="w-full h-full object-contain" style={{ background: "#000" }} />
          </div>
        </div>

        {/* Filename */}
        <div className="shrink-0 px-5 pt-3 pb-2">
          <p className="text-[11px] text-[#a1a1a6] font-mono truncate">{filename}</p>
        </div>

        {/* Buttons — always at bottom */}
        <div className="shrink-0 border-t border-black/[0.05] px-5 py-3 flex items-center gap-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <button onClick={handleClose} className="flex-1 py-3 rounded-xl text-xs font-medium text-[#86868b] bg-black/[0.04] active:bg-black/[0.08] border border-black/[0.06] transition-all">
            Close
          </button>
          {user && (
            <button onClick={handleSave} disabled={saveState === "loading" || saveState === "saved"}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: saveState === "saved" ? "rgba(52,199,89,0.15)" : saveState === "error" ? "rgba(255,59,48,0.1)" : "rgba(0,113,227,0.1)",
                color: saveState === "saved" ? "#34c759" : saveState === "error" ? "#ff3b30" : "#0071e3",
              }}
            >
              {saveState === "loading" ? (
                <div className="w-4 h-4 border-2 border-[#0071e3]/30 border-t-[#0071e3] rounded-full animate-spin" />
              ) : saveState === "saved" ? (
                <><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Saved</>
              ) : saveState === "error" ? "Try again" : (
                <><Cloud className="w-3.5 h-3.5" strokeWidth={2.5} /> Save</>
              )}
            </button>
          )}
          <a href={downloadState === "idle" ? videoUrl : undefined} download={downloadState === "idle" ? filename : undefined} onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold text-white bg-[#0071e3] active:bg-[#0060c0] transition-all"
            style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2.5} /> Download
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

function DesktopContent({ videoUrl, filename, user, downloadState, saveState, handleDownload, handleSave, handleClose }: any) {
  return (
    <>
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-[#34c759] shrink-0" style={{ boxShadow: "0 0 12px rgba(52,199,89,0.4)" }} />
          <span className="text-sm font-semibold text-[#1d1d1f] tracking-tight">Your video is ready</span>
        </div>
        <button onClick={handleClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.06] transition-all">
          <X className="w-3.5 h-3.5 text-[#86868b]" strokeWidth={2} />
        </button>
      </div>

      <div className="px-6 pb-4 flex-1 min-h-0 overflow-y-auto">
        <div className="rounded-xl overflow-hidden bg-black border border-black/[0.06] aspect-video">
          <video src={videoUrl} controls autoPlay className="w-full h-full object-contain" style={{ background: "#000" }} />
        </div>
        <p className="text-xs text-[#a1a1a6] font-mono truncate mt-3">{filename}</p>
      </div>

      <div className="mx-6 h-[1px] bg-black/[0.05]" />
      <div className="px-6 py-4 flex items-center gap-3">
        <button onClick={handleClose} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium text-[#86868b] bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.06] transition-all active:scale-95">
          Close
        </button>
        {user && (
          <button onClick={handleSave} disabled={saveState === "loading" || saveState === "saved"}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: saveState === "saved" ? "rgba(52,199,89,0.15)" : saveState === "error" ? "rgba(255,59,48,0.1)" : "rgba(0,113,227,0.1)",
              color: saveState === "saved" ? "#34c759" : saveState === "error" ? "#ff3b30" : "#0071e3",
            }}
          >
            {saveState === "loading" ? (
              <div className="w-4 h-4 border-2 border-[#0071e3]/30 border-t-[#0071e3] rounded-full animate-spin" />
            ) : saveState === "saved" ? (
              <><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Saved</>
            ) : saveState === "error" ? "Try again" : (
              <><Cloud className="w-3.5 h-3.5" strokeWidth={2.5} /> Save</>
            )}
          </button>
        )}
        <a href={downloadState === "idle" ? videoUrl : undefined} download={downloadState === "idle" ? filename : undefined} onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all relative overflow-hidden cursor-pointer active:scale-95"
          style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
        >
          <motion.div initial={false} animate={{ opacity: downloadState === "idle" ? 1 : 0 }} className="flex items-center gap-2 absolute">
            <Download className="w-3.5 h-3.5" strokeWidth={2.5} /> Download
          </motion.div>
          <motion.div initial={false} animate={{ opacity: downloadState === "loading" ? 1 : 0 }} className="flex items-center gap-2 absolute">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Downloading</span>
          </motion.div>
          <motion.div initial={false} animate={{ opacity: downloadState === "success" ? 1 : 0 }} className="flex items-center gap-2 absolute">
            <Check className="w-4 h-4" strokeWidth={3} />
            <span>Done</span>
          </motion.div>
          <span className="invisible flex items-center gap-2"><span className="w-4 h-4" /><span>Downloading</span></span>
        </a>
      </div>
    </>
  );
}

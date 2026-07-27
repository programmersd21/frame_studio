"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { PromptBox } from "@/components/PromptBox";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { ProgressScreen } from "@/components/ProgressScreen";
import { PreviewScreen } from "@/components/PreviewScreen";
import { renderVideoInBrowser } from "@/lib/renderInBrowser";
import { Material3Decorations } from "@/components/Material3Decorations";
import { HeroGlow } from "@/components/HeroGlow";
import { BentoFeatures } from "@/components/BentoFeatures";
import { SponsorBanner } from "@/components/SponsorBanner";
import { X, Check, Play, Loader } from "lucide-react";

const SOFT = [0.22, 1, 0.36, 1] as const;

interface QueueItem {
  id: string;
  prompt: string;
  model: string;
  duration?: number;
  pdfContent?: string;
  status: "queued" | "generating" | "rendering" | "done" | "error";
  preview?: { url: string; filename: string };
  error?: string;
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [progressStage, setProgressStage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [preview, setPreview] = useState<{ url: string; filename: string; prompt?: string; model?: string } | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processingQueue, setProcessingQueue] = useState(false);
  const queueAbortRef = useRef(false);

  const generateSingle = async (prompt: string, model: string, duration?: number, pdfContent?: string) => {
    setIsLoading(true);
    setProgressStage("Generating your video...");
    setProgressPercent(0);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model, durationSeconds: duration, pdfContent }),
      });

      if (!res.ok) {
        let errorMessage = "Server error (" + res.status + ")";
        const contentType = res.headers.get("Content-Type") || "";
        if (contentType.includes("application/json")) {
          try { const data = await res.json(); errorMessage = data.error || errorMessage; } catch {}
        } else {
          try { const text = await res.text(); if (text.trim()) errorMessage = text; } catch {}
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      const { compiledFiles, metadata } = data;

      setProgressStage("Rendering in browser...");
      setProgressPercent(5);

      const blob = await renderVideoInBrowser(compiledFiles, metadata, (progress) => {
        setProgressPercent(progress.percent);
        setProgressStage(progress.stage);
      });

      const url = window.URL.createObjectURL(blob);
      const filename = "frame-studio-" + Date.now() + ".mp4";

      setIsLoading(false);
      setProgressPercent(0);
      setProgressStage("");
      setPreview({ url, filename, prompt, model });
    } catch (err: any) {
      alert(err.message || "Failed to generate video");
      setIsLoading(false);
      setProgressPercent(0);
      setProgressStage("");
    }
  };

  const processQueue = async () => {
    setProcessingQueue(true);
    queueAbortRef.current = false;

    for (let i = 0; i < queue.length; i++) {
      if (queueAbortRef.current) break;

      const item = queue[i];
      if (item.status === "done") continue;

        setQueue((prev) => prev.map((q, idx) => idx === i ? { ...q, status: "generating" as const } : q));
        setProgressStage("Generating video " + (i + 1) + " of " + queue.length + "...");
        setProgressPercent(0);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: item.prompt,
            model: item.model,
            durationSeconds: item.duration,
            pdfContent: item.pdfContent,
          }),
        });

        if (!res.ok) {
          let errorMessage = "Server error (" + res.status + ")";
          const contentType = res.headers.get("Content-Type") || "";
          if (contentType.includes("application/json")) {
            try { const data = await res.json(); errorMessage = data.error || errorMessage; } catch {}
          } else {
            try { const text = await res.text(); if (text.trim()) errorMessage = text; } catch {}
          }
          throw new Error(errorMessage);
        }

        const data = await res.json();
        const { compiledFiles, metadata } = data;

        setQueue((prev) => prev.map((q, idx) => idx === i ? { ...q, status: "rendering" as const } : q));
        setProgressStage("Rendering video " + (i + 1) + " of " + queue.length + "...");
        setProgressPercent(5);

        const blob = await renderVideoInBrowser(compiledFiles, metadata, (progress) => {
          setProgressPercent(progress.percent);
          setProgressStage("Rendering video " + (i + 1) + " of " + queue.length + " \u2014 " + progress.stage);
        });

        const url = window.URL.createObjectURL(blob);
        const filename = "frame-studio-" + item.prompt.slice(0, 30).replace(/\s+/g, "-") + "-" + Date.now() + ".mp4";

        setQueue((prev) => prev.map((q, idx) => idx === i ? { ...q, status: "done", preview: { url, filename } } : q));
      } catch (err: any) {
        setQueue((prev) => prev.map((q, idx) => idx === i ? { ...q, status: "error", error: err.message } : q));
      }
    }

    setProgressPercent(0);
    setProgressStage("");
    setProcessingQueue(false);
  };

  const handleGenerate = async (prompt: string, model: string, duration?: number, pdfContent?: string) => {
    await generateSingle(prompt, model, duration, pdfContent);
  };

  const handleAddToQueue = (prompt: string, model: string, duration?: number, pdfContent?: string) => {
    const item: QueueItem = {
      id: "q-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      prompt,
      model,
      duration,
      pdfContent,
      status: "queued",
    };
    setQueue((prev) => [...prev, item]);
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const handleClearQueue = () => {
    queue.forEach((q) => {
      if (q.preview) window.URL.revokeObjectURL(q.preview.url);
    });
    setQueue([]);
  };

  const handleClosePreview = useCallback(() => {
    if (preview) {
      window.URL.revokeObjectURL(preview.url);
      setPreview(null);
    }
  }, [preview]);

  const queuedCount = queue.filter((q) => q.status === "queued").length;
  const doneCount = queue.filter((q) => q.status === "done").length;
  const totalQueueCount = queue.length;

  return (
    <>
      <Material3Decorations />
      <ApiKeyModal onApiKeySet={() => setApiKeySet(true)} />

      {isLoading && <ProgressScreen stage={progressStage} percent={progressPercent} onClose={() => setIsLoading(false)} />}
      {processingQueue && (
        <ProgressScreen
          stage={progressStage}
          percent={progressPercent}
          onClose={() => { queueAbortRef.current = true; setProcessingQueue(false); setProgressStage(""); setProgressPercent(0); }}
        />
      )}
      {preview && <PreviewScreen videoUrl={preview.url} filename={preview.filename} prompt={preview.prompt} model={preview.model} onClose={handleClosePreview} />}

      <div className="px-4 sm:px-6 pt-6 sm:pt-10 md:pt-16 flex flex-col items-center relative z-10">
        <SponsorBanner />
      </div>

      <div className="px-4 sm:px-6 py-12 sm:py-16 md:py-28 flex flex-col items-center justify-center min-h-[calc(100dvh-120px)] relative z-10">
        <div className="w-full max-w-4xl mx-auto space-y-10 sm:space-y-16 text-center">
          {/* Hero */}
          <div className="relative space-y-6 sm:space-y-8 max-w-3xl mx-auto flex flex-col items-center">
            <HeroGlow />
            <Reveal delay={0.1}>
              <h1 className="text-[clamp(2.2rem,8vw,5.5rem)] sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.025em] leading-[1.05] px-4 sm:px-8">
                <span
                  className="bg-clip-text text-transparent animate-gradient-prominent"
                  style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundSize: "200% 100%",
                    backgroundImage:
                      "linear-gradient(270deg, #ff2d55 0%, #ff9f0a 17%, #bf5af2 33%, #0071e3 50%, #34e0a4 67%, #ff2d55 100%)",
                  }}
                >
                  Motion graphics
                </span>
                <br />
                <span className="font-serif italic font-semibold text-[#1d1d1f]">
                  from a prompt.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-base sm:text-lg md:text-xl text-[#86868b] font-normal leading-relaxed max-w-lg mx-auto px-4">
                Enterprise-grade video generation powered by Google Gemini.
                Write a prompt, get production-ready MP4s in seconds.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <BentoFeatures />
            </Reveal>
          </div>

          {/* Prompt Box */}
          <Reveal delay={0.35}>
            <div className="w-full px-0 sm:px-4">
              <PromptBox
                onGenerate={handleGenerate}
                onAddToQueue={handleAddToQueue}
                isLoading={isLoading || processingQueue}
              />
            </div>
          </Reveal>

          {/* Queue */}
          <AnimatePresence>
            {totalQueueCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="w-full max-w-3xl mx-auto text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#1d1d1f]">Generation Queue</h3>
                    <span className="text-[11px] text-[#86868b] font-mono">
                      {doneCount}/{totalQueueCount} done
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {queuedCount > 0 && !processingQueue && (
                      <button
                        onClick={processQueue}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors"
                      >
                        <Play className="w-3 h-3" strokeWidth={2} />
                        Generate All ({queuedCount})
                      </button>
                    )}
                    <button
                      onClick={handleClearQueue}
                      className="px-3 py-1.5 rounded-full text-[11px] font-medium text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {queue.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/70 border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    >
                      <div className="shrink-0">
                        {item.status === "done" ? (
                          <div className="w-6 h-6 rounded-full bg-[#34c759]/10 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2.5} />
                          </div>
                        ) : item.status === "error" ? (
                          <div className="w-6 h-6 rounded-full bg-[#ff3b30]/10 flex items-center justify-center">
                            <X className="w-3.5 h-3.5 text-[#ff3b30]" strokeWidth={2.5} />
                          </div>
                        ) : item.status === "generating" || item.status === "rendering" ? (
                          <div className="w-6 h-6 rounded-full border-2 border-[#0071e3]/30 border-t-[#0071e3] animate-spin" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-black/[0.04] flex items-center justify-center">
                            <span className="text-[10px] font-mono text-[#86868b]">{idx + 1}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#1d1d1f] truncate">{item.prompt}</p>
                        <p className="text-[10px] text-[#a1a1a6] mt-0.5">
                          {item.model} {item.duration ? "\u00b7 " + item.duration + "s" : ""} {item.pdfContent ? "\u00b7 PDF" : ""}
                        </p>
                      </div>

                      {item.status === "done" && item.preview && (
                        <a
                          href={item.preview.url}
                          download={item.preview.filename}
                          className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#0071e3] bg-[#0071e3]/10 hover:bg-[#0071e3]/15 transition-colors"
                        >
                          Download
                        </a>
                      )}

                      {item.status === "queued" && (
                        <button
                          onClick={() => handleRemoveFromQueue(item.id)}
                          className="shrink-0 p-1 rounded-full text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-all"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

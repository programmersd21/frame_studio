"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
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

const SOFT = [0.22, 1, 0.36, 1] as const;

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [progressStage, setProgressStage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [preview, setPreview] = useState<{ url: string; filename: string; prompt?: string; model?: string } | null>(null);

  const handleGenerate = async (prompt: string, model: string, duration?: number, pdfContent?: string) => {
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

  const handleClosePreview = useCallback(() => {
    if (preview) {
      window.URL.revokeObjectURL(preview.url);
      setPreview(null);
    }
  }, [preview]);

  return (
    <>
      <Material3Decorations />
      <ApiKeyModal onApiKeySet={() => setApiKeySet(true)} />

      {isLoading && <ProgressScreen stage={progressStage} percent={progressPercent} onClose={() => setIsLoading(false)} />}
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
                isLoading={isLoading}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}

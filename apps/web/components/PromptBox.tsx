"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GenerateButton, ButtonState } from "./GenerateButton";
import { Command, ChevronDown, Sparkles, FileText, X, Upload, Clock } from "lucide-react";

const SOFT = [0.22, 1, 0.36, 1] as const;

const PLACEHOLDERS = [
  "Describe your motion graphics concept…",
  "A futuristic city at night with neon lights…",
  "Animated infographic about climate change…",
  "Cinematic logo reveal with particle effects…",
  "3D chart animation for quarterly earnings…",
  "Kinetic typography with springy text reveals…",
];

interface PromptBoxProps {
  onGenerate: (prompt: string, model: string, duration?: number, pdfContent?: string) => void;
  isLoading?: boolean;
}

const PRESETS = [
  "Apple keynote title reveal with glass aesthetic",
  "Minimalist SaaS product launch sequence",
  "Kinetic typography with springy 120fps motion",
  "Financial dashboard intro with timeline charts",
];

const GEMINI_MODELS = [
  { id: "gemini-3.6-flash",        name: "Gemini 3.6 Flash" },
  { id: "gemini-3.5-flash",        name: "Gemini 3.5 Flash" },
  { id: "gemini-2.5-flash",        name: "Gemini 2.5 Flash" },
  { id: "gemini-3.5-flash-lite",   name: "Gemini 3.5 Flash Lite" },
  { id: "gemini-2.5-flash-lite",   name: "Gemini 2.5 Flash Lite" },
  { id: "gemini-3.1-flash-lite",   name: "Gemini 3.1 Flash Lite" },
  { id: "gemma-4-31b-it",          name: "Gemma 4 31B" },
  { id: "gemma-4-26b-a4b-it",      name: "Gemma 4 26B" },
];

const DEFAULT_MODEL = "gemini-3.6-flash";

const DURATION_PRESETS = [
  { label: "5s",  value: 5,   desc: "Teaser" },
  { label: "10s", value: 10,  desc: "Short" },
  { label: "15s", value: 15,  desc: "Standard" },
  { label: "30s", value: 30,  desc: "Full reel" },
  { label: "1m",  value: 60,  desc: "Extended" },
  { label: "2m",  value: 120, desc: "Deep dive" },
  { label: "3m",  value: 180, desc: "Presentation" },
  { label: "5m",  value: 300, desc: "Full talk" },
  { label: "10m", value: 600, desc: "Keynote" },
  { label: "15m", value: 900, desc: "Comprehensive" },
];

export const PromptBox: React.FC<PromptBoxProps> = ({ onGenerate, isLoading = false }) => {
  const [prompt, setPrompt]               = useState("");
  const [selectedModel, setSelectedModel]  = useState(DEFAULT_MODEL);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [modelOpen, setModelOpen]          = useState(false);
  const [buttonState, setButtonState]      = useState<ButtonState>("idle");
  const [isTyping, setIsTyping]            = useState(false);
  const [isFocused, setIsFocused]          = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [pdfFileName, setPdfFileName]      = useState<string | null>(null);
  const [pdfContent, setPdfContent]        = useState<string | null>(null);
  const [pdfUploading, setPdfUploading]    = useState(false);
  const [pdfError, setPdfError]            = useState("");
  const [durationOpen, setDurationOpen] = useState(false);
  const dropdownRef                        = useRef<HTMLDivElement>(null);
  const durationRef                        = useRef<HTMLDivElement>(null);
  const typingTimerRef                     = useRef<NodeJS.Timeout>();
  const textareaRef                        = useRef<HTMLTextAreaElement>(null);
  const pdfInputRef                        = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfUploading(true);
    setPdfError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to parse PDF");
      }
      const data = await res.json();
      setPdfFileName(file.name);
      setPdfContent(data.text);
    } catch (err: any) {
      setPdfError(err.message || "Failed to parse PDF");
    } finally {
      setPdfUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const removePdf = () => {
    setPdfFileName(null);
    setPdfContent(null);
    setPdfError("");
  };

  useEffect(() => {
    if (isFocused || prompt.length > 0) return;
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(id);
  }, [isFocused, prompt]);

  useEffect(() => {
    setButtonState(isLoading ? "loading" : "idle");
  }, [isLoading]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (durationRef.current && !durationRef.current.contains(e.target as Node)) {
        setDurationOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    setIsTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => setIsTyping(false), 150);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setButtonState("animating");
    setTimeout(() => onGenerate(prompt.trim(), selectedModel, selectedDuration ?? undefined, pdfContent ?? undefined), 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  const selectedLabel = GEMINI_MODELS.find((m) => m.id === selectedModel)?.name ?? "Model";

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5" style={{ fontFamily: "var(--font-display)" }}>
      <form onSubmit={handleSubmit} className="relative group">
        <motion.div
          className="absolute -inset-[4px] rounded-[22px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(0,113,227,0.12), transparent 70%)",
            transition: "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          animate={{ opacity: modelOpen ? 1 : 0 }}
        />

        <motion.div
          animate={{
            scale: isFocused ? 1.012 : 1,
          }}
          transition={{
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative rounded-2xl p-[1.5px] shadow-xl"
          style={{
            background: modelOpen
              ? "linear-gradient(135deg, rgba(0,113,227,0.25), rgba(94,92,230,0.15))"
              : "linear-gradient(135deg, rgba(0,113,227,0.08), rgba(0,0,0,0.03))",
            transition: "background 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
            boxShadow: isFocused
              ? "0 12px 48px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.9) inset"
              : "0 8px 32px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset",
          }}
        >
          <div
            className="relative rounded-[calc(1rem-1.5px)] px-6 pt-6 pb-5 lg"
            style={{ background: "rgba(249,250,251,0.82)" }}
          >
            <div className="relative">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={handlePromptChange}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  rows={3}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={{
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.015em",
                    willChange: "transform",
                  }}
                  className={`w-full bg-transparent text-[#1d1d1f] text-[15px] leading-relaxed outline-none focus:outline-none focus:ring-0 resize-none transition-transform duration-75 ${
                    isTyping ? "scale-[1.005]" : ""
                  }`}
                />

                {prompt.length === 0 && !isFocused && (
                  <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={placeholderIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: SOFT }}
                        className="block text-[15px] leading-relaxed text-[#86868b]"
                        style={{
                          fontFamily: "var(--font-display)",
                          letterSpacing: "-0.015em",
                        }}
                      >
                        {PLACEHOLDERS[placeholderIdx]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}

                {prompt.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-1 right-0 text-[10px] text-[#c7c7cC] font-mono pointer-events-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {prompt.length}
                  </motion.div>
                )}
              </div>
            </div>

            {(pdfFileName || pdfUploading) && (
              <div className="mt-2 px-1">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0071e3]/[0.04] border border-[#0071e3]/10">
                  {pdfUploading ? (
                    <div className="w-4 h-4 border-2 border-[#0071e3]/30 border-t-[#0071e3] rounded-full animate-spin shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#0071e3] shrink-0" strokeWidth={1.5} />
                  )}
                  <span className="text-xs text-[#1d1d1f] truncate flex-1">
                    {pdfUploading ? "Extracting text from PDF..." : pdfFileName}
                  </span>
                  {!pdfUploading && (
                    <button type="button" onClick={removePdf} className="shrink-0 p-0.5 rounded-full hover:bg-black/[0.06] transition-colors">
                      <X className="w-3 h-3 text-[#86868b]" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            )}
            {pdfError && (
              <p className="mt-1.5 text-[11px] text-[#ff3b30] px-1">{pdfError}</p>
            )}

            <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />

            <div className="flex items-center justify-between gap-4 pt-3 border-t border-black/[0.05] mt-2">
              <div className="flex items-center gap-3">
                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setModelOpen((v) => !v)}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                      modelOpen
                        ? "bg-[#0071e3] text-white border-[#0071e3] shadow-[0_4px_14px_rgba(0,113,227,0.28)]"
                        : "bg-black/[0.04] text-[#1d1d1f] border-black/10 hover:bg-black/[0.08] hover:border-black/20"
                    }`}
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    <motion.span
                      className="flex items-center gap-1.5"
                      animate={{ gap: modelOpen ? "6px" : "4px" }}
                    >
                      <Sparkles className="w-3 h-3" strokeWidth={2} />
                      <span>{selectedLabel}</span>
                    </motion.span>
                    <motion.span
                      animate={{ rotate: modelOpen ? 180 : 0 }}
                      transition={{ duration: 0.28, ease: SOFT }}
                    >
                      <ChevronDown className="w-3 h-3" strokeWidth={2.5} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {modelOpen && (
                      <motion.div
                        key="dropdown"
                        initial={{ opacity: 0, scale: 0.94, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 6 }}
                        transition={{ duration: 0.24, ease: SOFT }}
                        style={{
                          fontFamily: "var(--font-sans)",
                          transformOrigin: "bottom left",
                        }}
                        className="absolute bottom-[calc(100%+6px)] left-0 z-50 w-52 rounded-xl overflow-hidden lg shadow-[0_16px_40px_rgba(0,0,0,0.10),0_1px_0_rgba(255,255,255,0.9)_inset]"
                      >
                        {GEMINI_MODELS.map((model, i) => (
                          <motion.button
                            key={model.id}
                            type="button"
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                            onClick={() => { setSelectedModel(model.id); setModelOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between group/item transition-colors duration-150 ${
                              selectedModel === model.id
                                ? "text-[#0071e3] bg-[#0071e3]/[0.06]"
                                : "text-[#1d1d1f] hover:bg-black/[0.04]"
                            }`}
                          >
                            <span className="font-medium">{model.name}</span>
                            {selectedModel === model.id && (
                              <motion.span
                                layoutId="check"
                                className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"
                              />
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  className="hidden sm:flex items-center gap-1 text-[11px] text-[#a1a1a6]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <Command className="w-3 h-3" strokeWidth={1.5} />
                  <span>+ Return</span>
                </div>

                <div ref={durationRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setDurationOpen((v) => !v)}
                    disabled={isLoading}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-200 ${
                      durationOpen || selectedDuration !== null
                        ? "bg-[#0071e3] text-white border-[#0071e3] shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
                        : "bg-black/[0.03] text-[#86868b] border-black/[0.06] hover:bg-black/[0.06] hover:text-[#1d1d1f]"
                    }`}
                  >
                    <Clock className="w-3 h-3" strokeWidth={2} />
                    <span>{selectedDuration !== null ? (selectedDuration >= 60 ? selectedDuration / 60 + "m" : selectedDuration + "s") : "Auto"}</span>
                    <motion.span animate={{ rotate: durationOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-3 h-3" strokeWidth={2.5} />
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {durationOpen && (
                      <motion.div
                        key="duration-dropdown"
                        initial={{ opacity: 0, scale: 0.94, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 4 }}
                        transition={{ duration: 0.2, ease: SOFT }}
                        style={{ transformOrigin: "bottom left" }}
                        className="absolute bottom-[calc(100%+6px)] left-0 z-50 w-36 rounded-xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.10)]"
                      >
                        <div style={{ background: "rgba(249,250,251,0.95)", maxHeight: "300px", overflowY: "auto" }}>
                          <button
                            type="button"
                            onClick={() => { setSelectedDuration(null); setDurationOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                              selectedDuration === null
                                ? "text-[#0071e3] bg-[#0071e3]/[0.06]"
                                : "text-[#1d1d1f] hover:bg-black/[0.04]"
                            }`}
                          >
                            <span>Auto (AI)</span>
                            {selectedDuration === null && <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />}
                          </button>
                          {DURATION_PRESETS.map((d) => (
                            <button
                              key={d.value}
                              type="button"
                              onClick={() => { setSelectedDuration(d.value); setDurationOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                                selectedDuration === d.value
                                  ? "text-[#0071e3] bg-[#0071e3]/[0.06]"
                                  : "text-[#1d1d1f] hover:bg-black/[0.04]"
                              }`}
                            >
                              <span>{d.label}</span>
                              {selectedDuration === d.value && <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isLoading || pdfUploading}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-200 ${
                    pdfFileName
                      ? "bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20"
                      : "bg-black/[0.03] text-[#86868b] border-black/[0.06] hover:bg-black/[0.06] hover:text-[#1d1d1f]"
                  }`}
                >
                  <Upload className="w-3 h-3" strokeWidth={2} />
                  <span>PDF</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <GenerateButton state={buttonState} onClick={handleSubmit} disabled={!prompt.trim()} />
              </div>
            </div>
          </div>
        </motion.div>
      </form>

      <div className="space-y-2.5">
        <p
          className="text-[11px] tracking-wide text-[#a1a1a6] uppercase"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
        >
          Concepts
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESETS.map((preset, idx) => {
            const colors = ["#ff2d55", "#bf5af2", "#0071e3", "#34e0a4"];
            return (
              <motion.button
                key={idx}
                type="button"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.22, ease: SOFT }}
                onClick={() => {
                  setPrompt(preset);
                  textareaRef.current?.focus();
                }}
                style={{ fontFamily: "var(--font-sans)" }}
                className="group/p relative text-left px-4 py-3 rounded-xl text-xs text-[#3a3a3c] bg-white/70 hover:bg-white border border-black/[0.06] hover:border-black/[0.12] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 overflow-hidden"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl opacity-0 group-hover/p:opacity-100 transition-opacity duration-300"
                  style={{ background: colors[idx], boxShadow: `0 0 8px ${colors[idx]}40` }}
                />
                <span className="line-clamp-1 leading-relaxed pl-1 transition-transform duration-200 group-hover/p:translate-x-0.5">
                  {preset}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="w-3 h-3 shrink-0 transition-all duration-200" style={{ color: "#a1a1a6" }}>
                  <path d="M3 1.5L8.5 6L3 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

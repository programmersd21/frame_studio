"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Sparkles, Eye, EyeOff, ArrowRight } from "lucide-react";

const SOFT = [0.22, 1, 0.36, 1] as const;

interface ApiKeyModalProps {
  onApiKeySet: (apiKey: string) => void;
}

export function ApiKeyModal({ onApiKeySet }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    checkExistingApiKey();
  }, []);

  const checkExistingApiKey = async () => {
    try {
      const res = await fetch("/api/apikey");
      let data: any = {};
      try {
        const contentType = res.headers.get("Content-Type") || "";
        if (contentType.includes("application/json")) {
          data = await res.json();
        }
      } catch {
        data = {};
      }

      setShowModal(!data.hasApiKey);
    } catch {
      setShowModal(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const res = await fetch("/api/apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      let data: any = {};
      try {
        const contentType = res.headers.get("Content-Type") || "";
        if (contentType.includes("application/json")) {
          data = await res.json();
        }
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.error || `Failed to save API key (status ${res.status})`);
      }

      onApiKeySet(apiKey.trim());
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  };

  if (isChecking) return null;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: SOFT }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 lg-overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.45, ease: SOFT }}
            className="w-full max-w-md"
          >
            <div
              className="rounded-2xl overflow-hidden lg-card"
              style={{
                background: "rgba(249,250,251,0.82)",
              }}
            >
              <div className="px-7 pt-7 pb-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,113,227,0.12), rgba(0,113,227,0.04))",
                    border: "1px solid rgba(0,113,227,0.15)",
                  }}
                >
                  <KeyRound className="w-5 h-5" style={{ color: "#0071e3" }} strokeWidth={1.5} />
                </motion.div>

                <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
                  Welcome to Frame Studio
                </h2>
                <p className="mt-2 text-sm text-[#86868b] leading-relaxed max-w-xs">
                  Enter your Gemini API key to start generating. Stored securely in your browser.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="px-7 pb-7 pt-4 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="apiKey" className="text-xs font-medium text-[#86868b] tracking-wide uppercase" style={{ letterSpacing: "0.06em" }}>
                    API Key
                  </label>
                  <div className="relative group">
                    <motion.div
                      className="absolute -inset-[3px] rounded-xl pointer-events-none opacity-0 group-focus-within:opacity-100"
                      style={{
                        background: "radial-gradient(ellipse at 50% 0%, rgba(0,113,227,0.12), transparent 70%)",
                        transition: "opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    />
                    <div
                      className="relative rounded-xl p-[1px]"
                      style={{
                        background: apiKey
                          ? "linear-gradient(135deg, rgba(0,113,227,0.2), rgba(0,113,227,0.06))"
                          : "linear-gradient(135deg, rgba(0,0,0,0.06), rgba(0,0,0,0.02))",
                        transition: "background 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    >
                      <div className="relative rounded-[calc(0.75rem-1px)] bg-white flex items-center">
                        <input
                          id="apiKey"
                          type={showKey ? "text" : "password"}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          autoFocus
                          className="w-full bg-transparent text-sm text-[#1d1d1f] placeholder:text-[#a1a1a6] outline-none focus:outline-none focus:ring-0 px-4 py-3 pr-12 font-mono tracking-tight"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-black/[0.04] transition-all duration-200"
                          tabIndex={-1}
                        >
                          {showKey ? (
                            <EyeOff className="w-3.5 h-3.5 text-[#a1a1a6]" strokeWidth={1.5} />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-[#a1a1a6]" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#a1a1a6] font-sans">
                    Get a free key from{" "}
                    <a
                      href="https://aistudio.google.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0071e3] hover:text-[#0077ed] transition-colors duration-200 font-medium"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      transition={{ duration: 0.3, ease: SOFT }}
                      className="p-3 rounded-xl text-xs font-medium"
                      style={{
                        background: "rgba(255,59,48,0.08)",
                        border: "1px solid rgba(255,59,48,0.15)",
                        color: "#d32f2f",
                      }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!apiKey.trim() || isSaving}
                  className="group relative w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold overflow-hidden transition-all duration-300"
                  style={{
                    color: !apiKey.trim() || isSaving ? "#86868b" : "#ffffff",
                    background: !apiKey.trim() || isSaving
                      ? "rgba(0,0,0,0.06)"
                      : "linear-gradient(135deg, #1d1d1f, #2d2d2f)",
                    boxShadow: !apiKey.trim() || isSaving
                      ? "none"
                      : "0 4px 16px rgba(0,0,0,0.2)",
                  }}
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                      <span>Start Creating</span>
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                      </motion.span>
                    </>
                  )}
                </button>
              </form>

              <div className="mx-7 h-[1px]" style={{ background: "rgba(0,0,0,0.05)" }} />
              <div className="px-7 py-3 flex items-center gap-2 text-[11px] text-[#a1a1a6] font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse" />
                <span>End-to-end encrypted · never stored on our servers</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

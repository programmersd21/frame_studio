"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SOFT = [0.22, 1, 0.36, 1] as const;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-200px)] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: SOFT }}
        className="w-full max-w-sm"
      >
        <div
          className="rounded-2xl sm:rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.07), 0 1px 0 0 rgba(255,255,255,0.85) inset",
          }}
        >
          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: SOFT }}
              >
                <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">Check your email</h1>
                <p className="mt-1.5 text-sm text-[#34c759] font-medium">
                  We sent a reset link to {email}.
                </p>
                <p className="mt-4 text-xs text-[#86868b] leading-relaxed">
                  Didn't receive it? Check your spam folder or{" "}
                  <button onClick={() => setSent(false)} className="text-[#0071e3] hover:underline font-medium">
                    try again
                  </button>.
                </p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: SOFT }}
                >
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center gap-1 text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-4"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
                    Back to sign in
                  </Link>
                  <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">Forgot password</h1>
                  <p className="mt-1.5 text-sm text-[#86868b] font-normal">
                    Enter your email and we'll send you a reset link.
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="mt-5 sm:mt-7 space-y-3 sm:space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5, ease: SOFT }}
                  >
                    <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" strokeWidth={1.5} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl text-sm bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/30 focus:bg-black/[0.06] transition-all duration-200"
                      />
                    </div>
                  </motion.div>

                  {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-medium text-[#ff3b30]">
                      {error}
                    </motion.p>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: SOFT }}
                    className="pt-1"
                  >
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
                  style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                    </>
                  )}
                </button>
              </motion.div>
                </form>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SOFT = [0.22, 1, 0.36, 1] as const;

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/profile");
      router.refresh();
    }
  };

  const handleMagicLink = async () => {
    if (!email) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setError("Check your email for the magic link.");
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: SOFT }}
            >
              <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-[#86868b] font-normal">
                Sign in to access your videos.
              </p>
            </motion.div>

            <form onSubmit={handleSignIn} className="mt-5 sm:mt-7 space-y-3 sm:space-y-4">
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

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: SOFT }}
              >
                <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 sm:py-2.5 rounded-xl text-sm bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/30 focus:bg-black/[0.06] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs font-medium ${error.includes("Check your email") ? "text-[#34c759]" : "text-[#ff3b30]"}`}
                >
                  {error}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease: SOFT }}
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
                      Sign In
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: SOFT }}
              className="mt-3 sm:mt-4 text-center"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={loading || !email}
                  className="text-xs font-medium text-[#0071e3] hover:text-[#0077ed] transition-colors disabled:opacity-30"
                >
                  Send magic link
                </button>
                <span className="hidden sm:inline text-[#d2d2d7]">·</span>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="mx-5 sm:mx-8 h-[1px] bg-black/[0.04]" />

          <div className="px-5 sm:px-8 py-3 sm:py-4 text-center">
            <p className="text-xs text-[#86868b]">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-medium text-[#0071e3] hover:text-[#0077ed] transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SOFT = [0.22, 1, 0.36, 1] as const;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/auth/signin");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/profile"), 2000);
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
          className="rounded-2xl sm:rounded-3xl overflow-hidden lg-card"
          style={{ background: "rgba(249,250,251,0.82)" }}
        >
          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: SOFT }}
              >
                <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">Password updated</h1>
                <p className="mt-1.5 text-sm text-[#34c759] font-medium">Redirecting to your profile...</p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: SOFT }}
                >
                  <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">Set new password</h1>
                  <p className="mt-1.5 text-sm text-[#86868b] font-normal">Choose a strong password you haven't used before.</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="mt-5 sm:mt-7 space-y-3 sm:space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5, ease: SOFT }}
                  >
                    <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">New password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" strokeWidth={1.5} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        minLength={6}
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

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: SOFT }}
                  >
                    <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">Confirm password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" strokeWidth={1.5} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        required
                        minLength={6}
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
                      Update Password
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

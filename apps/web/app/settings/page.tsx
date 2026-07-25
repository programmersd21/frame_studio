"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Camera, Check, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SOFT = [0.22, 1, 0.36, 1] as const;

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [nameSaved, setNameSaved] = useState(false);

  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      setUser(user);
      setName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }
      setLoading(false);
    });
  }, []);

  const saveName = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });
    if (!error) {
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };

  const sendEmailChange = async () => {
    setEmailLoading(true);
    setEmailSent(false);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setEmailLoading(false);
    if (!error) setEmailSent(true);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setAvatarUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    setAvatarUrl(publicUrl);
    setAvatarUploading(false);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-6 h-6 border-2 border-[#0071e3]/30 border-t-[#0071e3] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] px-6 py-20">
      <div className="max-w-lg mx-auto space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: SOFT }}
          className="text-2xl font-semibold tracking-tight text-[#1d1d1f]"
        >
          Settings
        </motion.h1>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: SOFT }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.07), 0 10px 32px rgba(0,0,0,0.03), 0 1px 0 0 rgba(255,255,255,0.85) inset, 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          <div className="px-8 py-6 flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-black/[0.04] ring-2 ring-black/[0.06] flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-[#86868b]" strokeWidth={1.5} />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0071e3] text-white flex items-center justify-center shadow-md hover:bg-[#0077ed] transition-colors disabled:opacity-50"
              >
                {avatarUploading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <Camera className="w-3.5 h-3.5" strokeWidth={2.5} />
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1d1d1f]">{name || "Your name"}</p>
              <p className="text-xs text-[#86868b]">{email}</p>
            </div>
          </div>
        </motion.div>

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: SOFT }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.07), 0 10px 32px rgba(0,0,0,0.03), 0 1px 0 0 rgba(255,255,255,0.85) inset, 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          <div className="px-8 py-6">
            <h2 className="text-sm font-semibold text-[#1d1d1f] mb-4">Profile</h2>
            <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" strokeWidth={1.5} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]/30 focus:bg-black/[0.06] transition-all duration-200"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={saveName}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all duration-200"
                style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
              >
                {nameSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Saved
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: SOFT }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.07), 0 10px 32px rgba(0,0,0,0.03), 0 1px 0 0 rgba(255,255,255,0.85) inset, 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          <div className="px-8 py-6">
            <h2 className="text-sm font-semibold text-[#1d1d1f] mb-4">Email</h2>
            <p className="text-xs text-[#86868b] mb-3">Current: <span className="text-[#1d1d1f] font-medium">{email}</span></p>
            <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">New email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" strokeWidth={1.5} />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/30 focus:bg-black/[0.06] transition-all duration-200"
              />
            </div>
            {emailSent && (
              <p className="mt-2 text-xs text-[#34c759] font-medium">Confirmation email sent. Check your inbox.</p>
            )}
            <div className="mt-3 flex justify-end">
              <button
                onClick={sendEmailChange}
                disabled={emailLoading || !newEmail}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all duration-200 disabled:opacity-50"
                style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
              >
                {emailLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  "Change Email"
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: SOFT }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.07), 0 10px 32px rgba(0,0,0,0.03), 0 1px 0 0 rgba(255,255,255,0.85) inset, 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          <div className="px-8 py-6">
            <h2 className="text-sm font-semibold text-[#1d1d1f] mb-4">Password</h2>
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" strokeWidth={1.5} />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/30 focus:bg-black/[0.06] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" strokeWidth={1.5} />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/30 focus:bg-black/[0.06] transition-all duration-200"
                  />
                </div>
              </div>
              {passwordError && (
                <p className="text-xs font-medium text-[#ff3b30]">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-xs font-medium text-[#34c759]">Password updated successfully.</p>
              )}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all duration-200 disabled:opacity-50"
                  style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
                >
                  {passwordLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

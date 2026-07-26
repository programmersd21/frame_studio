"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Camera, Check, Eye, EyeOff, Trash2, AlertTriangle, X, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SOFT = [0.22, 1, 0.36, 1] as const;

const Card = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 100, damping: 20, mass: 0.6 }}
    className={`rounded-2xl sm:rounded-3xl overflow-hidden ${className}`}
    style={{
      background: "rgba(255,255,255,0.78)",
      backdropFilter: "blur(40px) saturate(200%)",
      border: "1px solid rgba(255,255,255,0.5)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.07), 0 10px 32px rgba(0,0,0,0.03), 0 1px 0 0 rgba(255,255,255,0.85) inset",
    }}
  >
    <div className="px-5 sm:px-8 py-5 sm:py-6">{children}</div>
  </motion.div>
);

const Input = ({ icon: Icon, ...props }: any) => (
  <div className="relative">
    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" strokeWidth={1.5} />
    <input
      className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl text-sm bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] placeholder:text-[#a1a1a6] outline-none transition-all duration-200 focus:border-[#0071e3]/30 focus:bg-black/[0.06] focus:shadow-[0_0_0_3px_rgba(0,113,227,0.06)]"
      {...props}
    />
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [nameSaved, setNameSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/signin"); return; }
      setUser(user);
      setName(user.user_metadata?.full_name || "");
      if (user.user_metadata?.avatar_url) setAvatarUrl(user.user_metadata.avatar_url);
      setLoading(false);
    });
  }, [router]);

  const saveName = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    if (!error) {
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) { setPasswordError("Passwords don't match"); return; }
    if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters"); return; }
    setPasswordLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) { setPasswordError(error.message); }
    else {
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
    setAvatarError("");
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;
    await supabase.storage.from("avatars").remove([
      `${user.id}/avatar.png`, `${user.id}/avatar.jpg`,
      `${user.id}/avatar.jpeg`, `${user.id}/avatar.webp`,
    ]);
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
    if (uploadError) { setAvatarError(uploadError.message); setAvatarUploading(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: urlData.publicUrl } });
    if (updateError) { setAvatarError(updateError.message); setAvatarUploading(false); return; }
    setAvatarUrl(urlData.publicUrl);
    setAvatarUploading(false);
    window.dispatchEvent(new CustomEvent("avatar-updated"));
  };

  const removeAvatar = async () => {
    setAvatarError("");
    const supabase = createClient();
    await supabase.storage.from("avatars").remove([
      `${user.id}/avatar.png`, `${user.id}/avatar.jpg`,
      `${user.id}/avatar.jpeg`, `${user.id}/avatar.webp`,
    ]);
    const { error } = await supabase.auth.updateUser({ data: { avatar_url: null } });
    if (error) { setAvatarError(error.message); return; }
    setAvatarUrl(null);
    window.dispatchEvent(new CustomEvent("avatar-updated"));
  };

  if (loading) return (
    <div className="min-h-[calc(100dvh-200px)] flex items-center justify-center">
      <div className="relative w-6 h-6">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "2px solid rgba(0,113,227,0.1)", borderTopColor: "#0071e3" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100dvh-200px)] px-4 sm:px-6 py-6 sm:py-12 md:py-20 pb-24 md:pb-12">
      <div className="max-w-lg mx-auto space-y-4 sm:space-y-5">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]"
        >
          Settings
        </motion.h1>

        {/* Avatar */}
        <Card delay={0.05}>
          <div className="flex items-center gap-4 sm:gap-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="relative shrink-0"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-black/[0.04] ring-2 ring-black/[0.06] flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-[#86868b]" strokeWidth={1.5} />
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-0.5 -right-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0071e3] text-white flex items-center justify-center shadow-lg hover:bg-[#0077ed] transition-colors disabled:opacity-50"
              >
                {avatarUploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <Camera className="w-3.5 h-3.5" strokeWidth={2.5} />
                )}
              </motion.button>
              {avatarUrl && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={removeAvatar}
                  className="absolute -top-0.5 -left-0.5 w-6 h-6 rounded-full bg-white border border-black/[0.06] text-[#86868b] hover:text-[#ff3b30] flex items-center justify-center shadow-sm transition-colors"
                >
                  <X className="w-3 h-3" strokeWidth={2} />
                </motion.button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
            </motion.div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1d1d1f] truncate">{name || "Your name"}</p>
              <p className="text-xs text-[#86868b] mt-0.5 truncate">{user?.email || ""}</p>
              <p className="text-[10px] text-[#a1a1a6] mt-1.5 font-mono">Tap the camera to change photo</p>
            </div>
          </div>
          {avatarError && <p className="text-xs font-medium text-[#ff3b30] mt-3">{avatarError}</p>}
        </Card>

        {/* Profile */}
        <Card delay={0.1}>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-[#0071e3]" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-[#1d1d1f] tracking-tight">Profile</h2>
          </div>
          <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">Display name</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                ref={nameInputRef}
                icon={User}
                type="text"
                value={name}
                onChange={(e: any) => setName(e.target.value)}
                onKeyDown={(e: any) => { if (e.key === "Enter") saveName(); }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={saveName}
              disabled={!name.trim()}
              className="flex items-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all duration-200 disabled:opacity-40 shrink-0"
              style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
            >
              <AnimatePresence mode="wait">
                {nameSaved ? (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Saved
                  </motion.span>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Save
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#a1a1a6]" strokeWidth={1.5} />
            <span className="text-xs text-[#a1a1a6] font-mono">{user?.email || ""}</span>
          </div>
        </Card>

        {/* Password */}
        <Card delay={0.15}>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-[#0071e3]" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-[#1d1d1f] tracking-tight">Password</h2>
          </div>
          <form onSubmit={changePassword} className="space-y-3 sm:space-y-4">
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
                  className="w-full pl-10 pr-10 py-3 sm:py-2.5 rounded-xl text-sm bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] placeholder:text-[#a1a1a6] outline-none transition-all duration-200 focus:border-[#0071e3]/30 focus:bg-black/[0.06] focus:shadow-[0_0_0_3px_rgba(0,113,227,0.06)]"
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
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl text-sm bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] placeholder:text-[#a1a1a6] outline-none transition-all duration-200 focus:border-[#0071e3]/30 focus:bg-black/[0.06] focus:shadow-[0_0_0_3px_rgba(0,113,227,0.06)]"
                />
              </div>
            </div>
            <AnimatePresence mode="wait">
              {passwordError && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="text-xs font-medium text-[#ff3b30]"
                >
                  {passwordError}
                </motion.p>
              )}
              {passwordSuccess && (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="text-xs font-medium text-[#34c759]"
                >
                  Password updated successfully.
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex justify-end pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all duration-200 disabled:opacity-40"
                style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
              >
                {passwordLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  "Update Password"
                )}
              </motion.button>
            </div>
          </form>
        </Card>

        {/* Danger zone */}
        <Card delay={0.2} className="!border-red-500/10">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-4 h-4 text-[#ff3b30]" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-[#ff3b30] tracking-tight">Danger zone</h2>
          </div>
          {!deleteConfirm ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-[#ff3b30] bg-[#ff3b30]/10 hover:bg-[#ff3b30]/15 transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              Delete Account
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#ff3b30]/5 border border-[#ff3b30]/15">
                <AlertTriangle className="w-4 h-4 text-[#ff3b30] mt-0.5 shrink-0" strokeWidth={2} />
                <p className="text-xs text-[#86868b] leading-relaxed">
                  This will permanently delete your account and all saved videos. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    setDeleteLoading(true);
                    try {
                      const res = await fetch("/api/auth/delete-account", { method: "POST" });
                      if (res.ok) router.push("/");
                    } catch {} finally { setDeleteLoading(false); }
                  }}
                  disabled={deleteLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#ff3b30] hover:bg-[#ff2d55] transition-all duration-200 disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    "Confirm Delete"
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deleteLoading}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#86868b] bg-black/[0.04] hover:bg-black/[0.08] transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}

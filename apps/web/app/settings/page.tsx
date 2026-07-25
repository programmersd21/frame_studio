"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Camera, Check, Eye, EyeOff, Trash2, AlertTriangle, X } from "lucide-react";
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
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/signin"); return; }
      setUser(user);
      setName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      if (user.user_metadata?.avatar_url) setAvatarUrl(user.user_metadata.avatar_url);
      setLoading(false);
    });
  }, []);

  const Card = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: SOFT }}
      className="rounded-2xl sm:rounded-3xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(40px) saturate(200%)",
        WebkitBackdropFilter: "blur(40px) saturate(200%)",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.07), 0 10px 32px rgba(0,0,0,0.03), 0 1px 0 0 rgba(255,255,255,0.85) inset, 0 0 0 1px rgba(0,0,0,0.04)",
      }}
    >
      <div className="px-5 sm:px-8 py-5 sm:py-6">{children}</div>
    </motion.div>
  );

  const Input = ({ icon: Icon, ...props }: any) => (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" strokeWidth={1.5} />
      <input className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl text-sm bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/30 focus:bg-black/[0.06] transition-all duration-200" {...props} />
    </div>
  );

  const saveName = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    if (!error) { setNameSaved(true); setTimeout(() => setNameSaved(false), 2000); }
  };

  const sendEmailChange = async () => {
    setEmailLoading(true); setEmailSent(false);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setEmailLoading(false);
    if (!error) setEmailSent(true);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(""); setPasswordSuccess(false);
    if (newPassword !== confirmPassword) { setPasswordError("Passwords don't match"); return; }
    if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters"); return; }
    setPasswordLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) { setPasswordError(error.message); }
    else { setPasswordSuccess(true); setNewPassword(""); setConfirmPassword(""); setTimeout(() => setPasswordSuccess(false), 3000); }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const supabase = createClient();
    await supabase.storage.from("avatars").remove([`${user.id}/avatar.png`, `${user.id}/avatar.jpg`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.webp`]).catch(() => {});
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { setAvatarUploading(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: urlData.publicUrl } });
    if (updateError) { setAvatarUploading(false); return; }
    setAvatarUrl(urlData.publicUrl);
    setAvatarUploading(false);
    window.dispatchEvent(new CustomEvent("avatar-updated"));
  };

  const removeAvatar = async () => {
    const supabase = createClient();
    await supabase.storage.from("avatars").remove([`${user.id}/avatar.png`, `${user.id}/avatar.jpg`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.webp`]).catch(() => {});
    await supabase.auth.updateUser({ data: { avatar_url: null } });
    setAvatarUrl(null);
    window.dispatchEvent(new CustomEvent("avatar-updated"));
  };

  if (loading) return (
    <div className="min-h-[calc(100dvh-200px)] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-[#0071e3]/30 border-t-[#0071e3] rounded-full" />
    </div>
  );

  return (
    <div className="min-h-[calc(100dvh-200px)] px-4 sm:px-6 py-6 sm:py-12 md:py-20 pb-20 md:pb-12">
      <div className="max-w-lg mx-auto space-y-4 sm:space-y-6">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: SOFT }}
          className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
          Settings
        </motion.h1>

        <Card delay={0.1}>
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-black/[0.04] ring-2 ring-black/[0.06] flex items-center justify-center">
                {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6 sm:w-7 sm:h-7 text-[#86868b]" strokeWidth={1.5} />}
              </div>
              <button onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0071e3] text-white flex items-center justify-center shadow-md hover:bg-[#0077ed] transition-colors disabled:opacity-50">
                {avatarUploading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
                ) : <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2.5} />}
              </button>
              {avatarUrl && (
                <button onClick={removeAvatar}
                  className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#ff3b30] text-white flex items-center justify-center shadow-md hover:bg-[#ff2d55] transition-colors">
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={2.5} />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1d1d1f]">{name || "Your name"}</p>
              <p className="text-xs text-[#86868b]">{email}</p>
            </div>
          </div>
        </Card>

        <Card delay={0.15}>
          <h2 className="text-sm font-semibold text-[#1d1d1f] mb-3 sm:mb-4">Profile</h2>
          <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">Name</label>
          <Input icon={User} type="text" value={name} onChange={(e: any) => setName(e.target.value)} />
          <div className="mt-3 flex justify-end">
            <button onClick={saveName}
              className="flex items-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all duration-200 active:scale-95"
              style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}>
              {nameSaved ? <><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Saved</> : "Save"}
            </button>
          </div>
        </Card>

        <Card delay={0.2}>
          <h2 className="text-sm font-semibold text-[#1d1d1f] mb-3 sm:mb-4">Email</h2>
          <p className="text-xs text-[#86868b] mb-3">Current: <span className="text-[#1d1d1f] font-medium">{email}</span></p>
          <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">New email</label>
          <Input icon={Mail} type="email" value={newEmail} onChange={(e: any) => setNewEmail(e.target.value)} placeholder="new@example.com" />
          {emailSent && <p className="mt-2 text-xs text-[#34c759] font-medium">Confirmation email sent.</p>}
          <div className="mt-3 flex justify-end">
            <button onClick={sendEmailChange} disabled={emailLoading || !newEmail}
              className="flex items-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all duration-200 disabled:opacity-50 active:scale-95"
              style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}>
              {emailLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
              ) : "Change Email"}
            </button>
          </div>
        </Card>

        <Card delay={0.25}>
          <h2 className="text-sm font-semibold text-[#1d1d1f] mb-3 sm:mb-4">Password</h2>
          <form onSubmit={changePassword} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">New password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" strokeWidth={1.5} />
                <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters" required minLength={6}
                  className="w-full pl-10 pr-10 py-3 sm:py-2.5 rounded-xl text-sm bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/30 focus:bg-black/[0.06] transition-all duration-200" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                  {showNewPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6e6e73] mb-1.5 tracking-tight">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" strokeWidth={1.5} />
                <input type={showNewPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password" required minLength={6}
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl text-sm bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/30 focus:bg-black/[0.06] transition-all duration-200" />
              </div>
            </div>
            {passwordError && <p className="text-xs font-medium text-[#ff3b30]">{passwordError}</p>}
            {passwordSuccess && <p className="text-xs font-medium text-[#34c759]">Password updated.</p>}
            <div className="flex justify-end pt-1">
              <button type="submit" disabled={passwordLoading}
                className="flex items-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all duration-200 disabled:opacity-50 active:scale-95"
                style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}>
                {passwordLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                ) : "Update Password"}
              </button>
            </div>
          </form>
        </Card>

        <Card delay={0.3}>
          <h2 className="text-sm font-semibold text-[#ff3b30] mb-3 sm:mb-4">Danger zone</h2>
          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-[#ff3b30] bg-[#ff3b30]/10 hover:bg-[#ff3b30]/15 transition-all duration-200 active:scale-95">
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#ff3b30]/5 border border-[#ff3b30]/20">
                <AlertTriangle className="w-4 h-4 text-[#ff3b30] mt-0.5 shrink-0" strokeWidth={2} />
                <p className="text-xs text-[#86868b] leading-relaxed">
                  This will permanently delete your account and all saved videos. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={async () => {
                  setDeleteLoading(true);
                  try {
                    const res = await fetch("/api/auth/delete-account", { method: "POST" });
                    if (res.ok) { router.push("/"); }
                  } catch {} finally { setDeleteLoading(false); }
                }} disabled={deleteLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#ff3b30] hover:bg-[#ff2d55] transition-all duration-200 disabled:opacity-50 active:scale-95">
                  {deleteLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : "Confirm Delete"}
                </button>
                <button onClick={() => setDeleteConfirm(false)} disabled={deleteLoading}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#86868b] bg-black/[0.04] hover:bg-black/[0.08] transition-all duration-200 disabled:opacity-50">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

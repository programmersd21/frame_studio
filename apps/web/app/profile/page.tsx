"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Video, Clock, Trash2, ExternalLink, Sparkles, User, Copy, Check, Film } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LiquidGlass } from "@/components/LiquidGlass";

const SOFT = [0.22, 1, 0.36, 1] as const;

interface VideoItem {
  id: string;
  prompt: string;
  model: string;
  filename: string;
  video_url: string;
  duration_seconds: number | null;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleCopyPrompt = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  useEffect(() => {
    const supabase = createClient();
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/signin"); return; }
      setUser(user);
      const res = await fetch("/api/videos/list");
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
      setLoading(false);
    };
    init();
    const onAvatarChange = () => {
      supabase.auth.getUser().then(({ data }) => setUser(data.user));
    };
    window.addEventListener("avatar-updated", onAvatarChange);
    return () => window.removeEventListener("avatar-updated", onAvatarChange);
  }, [router]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch("/api/videos/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setVideos((prev) => prev.filter((v) => v.id !== id));
    setDeleting(null);
    setConfirmDelete(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const latestModel = videos.length > 0
    ? videos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].model
    : null;

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-12 md:py-24 max-w-4xl mx-auto pb-24 md:pb-12">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.6 }}
        className="rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-8 lg-card"
        style={{ background: "rgba(249,250,251,0.78)" }}
      >
        <div className="px-5 sm:px-8 pt-5 sm:pt-7 pb-5 sm:pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-black/[0.04] ring-2 ring-black/[0.06] flex items-center justify-center shrink-0"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 sm:w-7 sm:h-7 text-[#86868b]" strokeWidth={1.5} />
                )}
              </motion.div>
              <div>
                <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                  {user?.user_metadata?.full_name || "Profile"}
                </h1>
                <p className="text-xs sm:text-sm text-[#86868b] mt-0.5">
                  {user?.email || ""}
                </p>
              </div>
            </div>
            <motion.a
              href="/auth/signout"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-all duration-200 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Sign out</span>
            </motion.a>
          </div>

          {/* Stats */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 100, damping: 20 }}
              className="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-black/[0.05]"
            >
              <div className="flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-[#0071e3]" strokeWidth={1.5} />
                <span className="text-xs font-medium text-[#1d1d1f]">{videos.length}</span>
                <span className="text-[11px] text-[#a1a1a6]">videos</span>
              </div>
              {videos.length > 0 && (
                <>
                  <div className="w-px h-4 bg-black/[0.06]" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#86868b]" strokeWidth={1.5} />
                    <span className="text-[11px] text-[#a1a1a6]">
                      Latest {formatDate(videos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at)}
                    </span>
                  </div>
                  {latestModel && (
                    <>
                      <div className="w-px h-4 bg-black/[0.06] hidden sm:block" />
                      <div className="items-center gap-2 hidden sm:flex">
                        <Sparkles className="w-3.5 h-3.5 text-[#86868b]" strokeWidth={1.5} />
                        <span className="text-[11px] text-[#a1a1a6]">{latestModel}</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Video section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
          <Video className="w-4 h-4 text-[#0071e3]" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold tracking-tight text-[#1d1d1f]">Your videos</h2>
          <span className="text-xs text-[#a1a1a6] font-mono">{videos.length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative w-6 h-6">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid rgba(0,113,227,0.1)", borderTopColor: "#0071e3" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        ) : videos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-14 sm:py-16 text-center lg-thin"
            style={{ background: "rgba(249,250,251,0.48)" }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-full bg-black/[0.04] flex items-center justify-center mx-auto mb-4"
            >
              <Sparkles className="w-5 h-5 text-[#a1a1a6]" strokeWidth={1.5} />
            </motion.div>
            <p className="text-sm font-medium text-[#86868b]">No videos yet</p>
            <p className="text-xs text-[#a1a1a6] mt-1">Generate your first video to see it here.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all duration-200 active:scale-95"
              style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
            >
              <Sparkles className="w-3 h-3" strokeWidth={2} />
              Generate
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 100, damping: 20, mass: 0.6 }}
                className="group rounded-xl sm:rounded-2xl overflow-hidden lg-card"
                style={{ background: "rgba(249,250,251,0.72)" }}
              >
                <div className="aspect-video bg-black relative">
                  <VideoPlayer src={video.video_url} className="w-full h-full" />
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(90deg, #0071e3, #bf5af2)",
                    }}
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-start gap-2">
                    <p className="flex-1 text-xs font-medium text-[#1d1d1f] line-clamp-2 leading-relaxed min-w-0">
                      {video.prompt || "Untitled"}
                    </p>
                    {video.prompt && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopyPrompt(video.id, video.prompt)}
                        className="shrink-0 mt-0.5 p-1.5 rounded-lg text-[#86868b] hover:text-[#0071e3] hover:bg-[#0071e3]/10 transition-all duration-200"
                      >
                        {copiedId === video.id ? (
                          <Check className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                        ) : (
                          <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                        )}
                      </motion.button>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center gap-2 text-[10px] text-[#a1a1a6] font-mono">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
                      {formatDate(video.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full text-[#86868b] hover:text-[#0071e3] hover:bg-[#0071e3]/10 transition-all duration-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </motion.a>
                      <AnimatePresence mode="wait">
                        {confirmDelete === video.id ? (
                          <motion.div
                            key="confirm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-1"
                          >
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(video.id)}
                              disabled={deleting === video.id}
                              className="p-1.5 rounded-full text-[#ff3b30] bg-[#ff3b30]/10 transition-all duration-200 disabled:opacity-30"
                            >
                              {deleting === video.id ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                  className="w-3.5 h-3.5 border-2 border-[#ff3b30]/30 border-t-[#ff3b30] rounded-full"
                                />
                              ) : (
                                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                              )}
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setConfirmDelete(null)}
                              className="p-1.5 rounded-full text-[#86868b] hover:bg-black/[0.06] transition-all duration-200"
                            >
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M2 10L10 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.button
                            key="trash"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setConfirmDelete(video.id)}
                            className="p-1.5 rounded-full text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-all duration-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Video, Clock, Trash2, ExternalLink, Sparkles, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      setUser(user);

      const res = await fetch("/api/videos/list");
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
      setLoading(false);
    };
    init();
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
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-12 md:py-24 max-w-4xl mx-auto pb-20 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: SOFT }}
        className="flex items-start justify-between mb-6 sm:mb-10"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-black/[0.04] ring-2 ring-black/[0.06] flex items-center justify-center shrink-0">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#86868b]" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
              {user?.user_metadata?.full_name || "Profile"}
            </h1>
            <p className="text-xs sm:text-sm text-[#86868b] mt-0.5">
              {user?.email || "Loading..."}
            </p>
          </div>
        </div>
        <a
          href="/auth/signout"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="hidden sm:inline">Sign out</span>
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: SOFT }}
      >
        <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
          <Video className="w-4 h-4 text-[#0071e3]" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold tracking-tight text-[#1d1d1f]">Your videos</h2>
          <span className="text-xs text-[#a1a1a6] font-mono">{videos.length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-5 h-5 border-2 border-[#0071e3]/20 border-t-[#0071e3] rounded-full"
            />
          </div>
        ) : videos.length === 0 ? (
          <div
            className="rounded-2xl px-6 sm:px-8 py-12 sm:py-16 text-center"
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <div className="w-10 h-10 rounded-full bg-black/[0.04] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-5 h-5 text-[#a1a1a6]" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-[#86868b]">No videos yet</p>
            <p className="text-xs text-[#a1a1a6] mt-1">Generate your first video to see it here.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all duration-200 active:scale-95"
              style={{ boxShadow: "0 4px 14px rgba(0,113,227,0.25)" }}
            >
              <Sparkles className="w-3 h-3" strokeWidth={2} />
              Generate
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: SOFT }}
                className="rounded-xl sm:rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.68)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03), inset 0 1px 0 0 rgba(255,255,255,0.9)",
                }}
              >
                <div className="aspect-video bg-black/[0.03] relative">
                  <video
                    src={video.video_url}
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                    style={{ background: "#000" }}
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-xs font-medium text-[#1d1d1f] line-clamp-2 leading-relaxed">
                    {video.prompt || "Untitled"}
                  </p>
                  <div className="flex items-center justify-between mt-2 sm:mt-2.5">
                    <div className="flex items-center gap-2 text-[10px] text-[#a1a1a6] font-mono">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
                      {formatDate(video.created_at)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full text-[#86868b] hover:text-[#0071e3] hover:bg-[#0071e3]/10 transition-all duration-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </a>
                      <button
                        onClick={() => handleDelete(video.id)}
                        disabled={deleting === video.id}
                        className="p-1.5 rounded-full text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-all duration-200 disabled:opacity-30"
                      >
                        {deleting === video.id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-3.5 h-3.5 border-2 border-[#ff3b30]/30 border-t-[#ff3b30] rounded-full"
                          />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        )}
                      </button>
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

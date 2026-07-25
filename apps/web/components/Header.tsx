"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Play, User, Settings, Github, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const SOFT = "cubic-bezier(0.22, 1, 0.36, 1)";

const TabIcon = ({ icon: Icon, label, active }: { icon: any; label: string; active: boolean }) => (
  <div className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${active ? "text-[#0071e3]" : "text-[#86868b]"}`}>
    <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
    <span className="text-[10px] font-medium tracking-tight">{label}</span>
  </div>
);

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAvatarUrl(data.user?.user_metadata?.avatar_url || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAvatarUrl(session?.user?.user_metadata?.avatar_url || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const tabs = [
    { href: "/", label: "Home", icon: Play },
    ...(user
      ? [
          { href: "/profile", label: "Profile", icon: User },
          { href: "/settings", label: "Settings", icon: Settings },
        ]
      : [{ href: "/auth/signin", label: "Sign in", icon: User }]),
  ];

  return (
    <>
      {/* ── Desktop header (md+) ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex fixed z-50 w-[calc(100%-2.5rem)] max-w-4xl rounded-full items-center justify-between"
        style={{
          left: "50%",
          translate: "-50% 0",
          top: scrolled ? "12px" : "24px",
          fontFamily: "var(--font-display)",
          padding: scrolled ? "8px 20px" : "12px 24px",
          background: scrolled ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.68)",
          backdropFilter: scrolled ? "blur(40px) saturate(200%)" : "blur(24px) saturate(180%)",
          WebkitBackdropFilter: scrolled ? "blur(40px) saturate(200%)" : "blur(24px) saturate(180%)",
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 0 rgba(255,255,255,0.9)"
            : "0 4px 16px rgba(0,0,0,0.03), inset 0 1px 0 0 rgba(255,255,255,0.9)",
          transition: `top 0.4s ${SOFT}, padding 0.4s ${SOFT}, background 0.4s ${SOFT}, backdrop-filter 0.4s ${SOFT}, box-shadow 0.4s ${SOFT}`,
        }}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="font-semibold tracking-tight text-[#1d1d1f]"
            style={{ fontSize: scrolled ? "13px" : "15px", transition: "font-size 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            Frame Studio
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          <Link
            href="/"
            className={`rounded-full text-xs font-medium flex items-center transition-all duration-200 ${
              pathname === "/" ? "bg-black/[0.06] text-[#1d1d1f] border border-black/10 shadow-sm" : "text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04]"
            }`}
            style={{ padding: scrolled ? "4px 12px" : "6px 16px", transition: "padding 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            <Play className="w-3 h-3 shrink-0" style={{ color: "#0071e3" }} strokeWidth={2} />
            <span
              className="overflow-hidden whitespace-nowrap"
              style={{
                maxWidth: scrolled ? "0px" : "60px",
                opacity: scrolled ? 0 : 1,
                marginLeft: scrolled ? "0px" : "6px",
                transition: `max-width 0.4s ${SOFT}, opacity 0.3s ${SOFT}, margin-left 0.4s ${SOFT}`,
              }}
            >
              Generator
            </span>
          </Link>

          <a
            href="https://github.com/programmersd21/frame_studio"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] flex items-center transition-all duration-200 cursor-pointer"
            style={{ padding: scrolled ? "4px 10px" : "6px 16px", transition: "padding 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            <Github className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span
              className="overflow-hidden whitespace-nowrap"
              style={{
                maxWidth: scrolled ? "0px" : "48px",
                opacity: scrolled ? 0 : 1,
                marginLeft: scrolled ? "0px" : "6px",
                transition: `max-width 0.4s ${SOFT}, opacity 0.3s ${SOFT}, margin-left 0.4s ${SOFT}`,
              }}
            >
              GitHub
            </span>
          </a>

          {user && (
            <Link
              href="/settings"
              className={`rounded-full text-xs font-medium flex items-center transition-all duration-200 ${
                pathname === "/settings" ? "bg-black/[0.06] text-[#1d1d1f] border border-black/10 shadow-sm" : "text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04]"
              }`}
              style={{ padding: scrolled ? "4px 10px" : "6px 14px", transition: "padding 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              <Settings className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              <span
                className="overflow-hidden whitespace-nowrap"
                style={{
                  maxWidth: scrolled ? "0px" : "52px",
                  opacity: scrolled ? 0 : 1,
                  marginLeft: scrolled ? "0px" : "5px",
                  transition: `max-width 0.4s ${SOFT}, opacity 0.3s ${SOFT}, margin-left 0.4s ${SOFT}`,
                }}
              >
                Settings
              </span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/profile"
                className="rounded-full text-xs font-medium flex items-center transition-all duration-200"
                style={{
                  padding: scrolled ? "4px 8px" : "6px 12px",
                  background: avatarUrl ? "transparent" : "rgba(0,113,227,0.1)",
                  color: "#0071e3",
                  transition: "padding 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                ) : (
                  <User className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                )}
                <span
                  className="overflow-hidden whitespace-nowrap"
                  style={{
                    maxWidth: scrolled ? "0px" : "52px",
                    opacity: scrolled ? 0 : 1,
                    marginLeft: scrolled ? "0px" : "5px",
                    transition: `max-width 0.4s ${SOFT}, opacity 0.3s ${SOFT}, margin-left 0.4s ${SOFT}`,
                  }}
                >
                  Profile
                </span>
              </Link>
              <a
                href="/auth/signout"
                className="rounded-full p-1.5 text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-all duration-200"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-full text-xs font-medium flex items-center transition-all duration-200"
              style={{ padding: scrolled ? "4px 8px" : "6px 12px", color: "#86868b" }}
            >
              <User className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              <span
                className="overflow-hidden whitespace-nowrap"
                style={{
                  maxWidth: scrolled ? "0px" : "52px",
                  opacity: scrolled ? 0 : 1,
                  marginLeft: scrolled ? "0px" : "5px",
                  transition: `max-width 0.4s ${SOFT}, opacity 0.3s ${SOFT}, margin-left 0.4s ${SOFT}`,
                }}
              >
                Sign in
              </span>
            </Link>
          )}
        </nav>
      </motion.header>

      {/* ── Mobile tab bar (below md) ── */}
      <nav className="tab-bar md:hidden">
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href === "/profile" && pathname.startsWith("/profile"));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex items-center justify-center py-2 active:scale-95 transition-transform duration-150"
            >
              {tab.href === "/profile" && avatarUrl && user ? (
                <div className="flex flex-col items-center gap-0.5">
                  <img src={avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-[#0071e3]/20" />
                  <span className={`text-[10px] font-medium tracking-tight ${active ? "text-[#0071e3]" : "text-[#86868b]"}`}>
                    Profile
                  </span>
                </div>
              ) : (
                <TabIcon icon={tab.icon} label={tab.label} active={active} />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
};

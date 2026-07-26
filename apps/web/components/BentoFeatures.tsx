"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Monitor, Zap } from "lucide-react";

const SOFT = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  {
    icon: Cpu,
    title: "No server needed",
    desc: "Everything runs in your browser. No queues, no cloud config, no waiting.",
    gradient: "linear-gradient(135deg, rgba(52,199,89,0.12), rgba(52,199,89,0.03))",
    border: "rgba(52,199,89,0.15)",
    color: "#34c759",
  },
  {
    icon: Monitor,
    title: "Browser-rendered",
    desc: "Remotion renders 120fps video directly via WebCodecs. Instant preview, zero uploads.",
    gradient: "linear-gradient(135deg, rgba(0,113,227,0.12), rgba(0,113,227,0.03))",
    border: "rgba(0,113,227,0.15)",
    color: "#0071e3",
  },
  {
    icon: Zap,
    title: "Zero infrastructure",
    desc: "No GPU queues, no render farms. Your machine is the studio. Works offline.",
    gradient: "linear-gradient(135deg, rgba(191,90,242,0.12), rgba(191,90,242,0.03))",
    border: "rgba(191,90,242,0.15)",
    color: "#bf5af2",
  },
];

export const BentoFeatures = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mx-auto">
      {FEATURES.map((feature, i) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.08, duration: 0.5, ease: SOFT }}
            className="group relative rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: feature.gradient,
              border: `1px solid ${feature.border}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
              style={{
                background: `${feature.color}15`,
                color: feature.color,
              }}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-[#1d1d1f] tracking-tight mb-1">
              {feature.title}
            </h3>
            <p className="text-[11px] text-[#86868b] leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

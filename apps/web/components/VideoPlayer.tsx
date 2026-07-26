"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Volume2,
  Volume1,
  VolumeX,
} from "lucide-react";

const SOFT = [0.22, 1, 0.36, 1] as const;
const SEEK_BAR_HEIGHT = 24;

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  className?: string;
}

export const VideoPlayer = ({ src, autoPlay = false, className = "" }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const seekRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);

  const hideControls = useCallback(() => {
    if (isPlaying && !isSeeking) {
      setShowControls(false);
    }
  }, [isPlaying, isSeeking]);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(hideControls, 3000);
  }, [hideControls]);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    cancelHide();
    if (isPlaying) scheduleHide();
  }, [isPlaying, scheduleHide, cancelHide]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.cursor = showControls || !isPlaying ? "default" : "none";
  }, [showControls, isPlaying]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    scheduleHide();
  }, [scheduleHide]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    setShowControls(true);
    cancelHide();
  }, [cancelHide]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isSeeking) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, [isSeeking]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleWaiting = useCallback(() => setIsLoading(true), []);
  const handleCanPlay = useCallback(() => setIsLoading(false), []);
  const handleError = useCallback(() => { setHasError(true); setIsLoading(false); }, []);
  const handleVolumeChange = useCallback(() => {
    if (videoRef.current) {
      setVolume(videoRef.current.volume);
      setIsMuted(videoRef.current.muted);
    }
  }, []);
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setShowControls(true);
    cancelHide();
  }, [cancelHide]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const enter = () => setIsPiP(true);
    const leave = () => setIsPiP(false);
    video.addEventListener("enterpictureinpicture", enter);
    video.addEventListener("leavepictureinpicture", leave);
    return () => {
      video.removeEventListener("enterpictureinpicture", enter);
      video.removeEventListener("leavepictureinpicture", leave);
    };
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  }, []);

  const handleVolumeChangeSlider = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.volume = x;
    videoRef.current.muted = false;
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch { /* not supported */ }
  }, []);

  const getSeekPercent = useCallback((clientX: number) => {
    if (!seekRef.current || !duration) return 0;
    const rect = seekRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, [duration]);

  const handleSeekMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsSeeking(true);
    if (!videoRef.current || !duration) return;
    const percent = getSeekPercent(e.clientX);
    videoRef.current.currentTime = percent * duration;
    setCurrentTime(percent * duration);
  }, [duration, getSeekPercent]);

  useEffect(() => {
    if (!isSeeking) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!videoRef.current || !duration) return;
      const percent = getSeekPercent(e.clientX);
      videoRef.current.currentTime = percent * duration;
      setCurrentTime(percent * duration);
    };
    const handleMouseUp = () => setIsSeeking(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSeeking, duration, getSeekPercent]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: KeyboardEvent) => {
      if (!container.contains(e.target as Node)) return;
      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (videoRef.current) { videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1); videoRef.current.muted = false; }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (videoRef.current) videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
      }
    };
    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
  }, [duration, togglePlay, toggleFullscreen, toggleMute]);

  const seekPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const pipSupported = typeof document !== "undefined" && "pictureInPictureEnabled" in document;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={`relative overflow-hidden bg-black select-none outline-none ${className}`}
      onMouseMove={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onVolumeChange={handleVolumeChange}
        onEnded={handleEnded}
      />

      <AnimatePresence>
        {!isPlaying && !isLoading && !hasError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: SOFT }}
            className="absolute inset-0 flex items-center justify-center z-10"
            onClick={togglePlay}
          >
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(16px) saturate(180%)",
                WebkitBackdropFilter: "blur(16px) saturate(180%)",
              }}
            >
              <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1" fill="white" strokeWidth={0} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
            <span className="text-xs font-medium text-white/60 font-mono">Loading</span>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
              <VolumeX className="w-5 h-5 text-white/60" />
            </div>
            <p className="text-sm font-medium text-white/80">Could not load video</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showControls && !hasError && (
          <motion.div
            ref={controlsRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: SOFT }}
            className="absolute bottom-0 left-0 right-0 z-20"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => { cancelHide(); setShowControls(true); }}
            onMouseLeave={showControlsTemporarily}
          >
            <div
              className="px-3 pb-2 pt-1"
              style={{
                background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
              }}
            >
              <div
                ref={seekRef}
                className="relative w-full cursor-pointer group"
                style={{ height: SEEK_BAR_HEIGHT }}
                onMouseDown={handleSeekMouseDown}
                onMouseEnter={() => setIsHoveringSeek(true)}
                onMouseLeave={() => setIsHoveringSeek(false)}
              >
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-0 right-0 rounded-full transition-all duration-150"
                  style={{
                    height: isHoveringSeek || isSeeking ? 6 : 4,
                    background: "rgba(255,255,255,0.25)",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                      width: `${seekPercent}%`,
                      background: "#0071e3",
                      boxShadow: isHoveringSeek || isSeeking ? "0 0 8px rgba(0,113,227,0.5)" : "none",
                    }}
                  />
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg transition-all duration-150 pointer-events-none"
                  style={{
                    left: `calc(${seekPercent}% - 6px)`,
                    opacity: isHoveringSeek || isSeeking ? 1 : 0,
                    transform: `translateY(-50%) scale(${isHoveringSeek || isSeeking ? 1 : 0.5})`,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  }}
                />
              </div>

              <div className="flex items-center gap-1.5 -mt-1">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" strokeWidth={0} /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" strokeWidth={0} />}
                </button>

                <span className="text-[11px] font-mono text-white/60 min-w-[72px] tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <div className="flex-1" />

                <div
                  className="relative flex items-center"
                  onMouseEnter={() => setShowVolume(true)}
                  onMouseLeave={() => setShowVolume(false)}
                >
                  <button
                    onClick={toggleMute}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <VolumeIcon className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <AnimatePresence>
                    {showVolume && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 64, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: SOFT }}
                        className="overflow-hidden flex items-center"
                      >
                        <div
                          className="w-[56px] h-5 flex items-center cursor-pointer mx-1"
                          onClick={handleVolumeChangeSlider}
                        >
                          <div className="relative w-full h-1 rounded-full bg-white/20">
                            <div
                              className="absolute top-0 left-0 h-full rounded-full bg-white/80"
                              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {pipSupported && (
                  <button
                    onClick={togglePiP}
                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${
                      isPiP ? "text-[#0071e3] bg-[#0071e3]/15" : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <PictureInPicture2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                )}

                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-all"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" strokeWidth={1.5} /> : <Maximize className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

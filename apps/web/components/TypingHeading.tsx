"use client";

import React from "react";

const TYPING_SPEED = 70;
const BACKSPACE_SPEED = 35;
const PAUSE_AFTER_TYPED = 2800;
const PAUSE_AFTER_DELETED = 1000;

export const TypingHeading = () => {
  const [displayed, setDisplayed] = React.useState("");
  const [phase, setPhase] = React.useState<"typing" | "pausing" | "backspacing" | "waiting">("typing");
  const [cursorVisible, setCursorVisible] = React.useState(true);
  const text = "Motion graphics";

  React.useEffect(() => {
    if (phase === "typing") {
      if (displayed.length < text.length) {
        const id = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), TYPING_SPEED);
        return () => clearTimeout(id);
      } else {
        setPhase("pausing");
      }
    } else if (phase === "pausing") {
      const id = setTimeout(() => setPhase("backspacing"), PAUSE_AFTER_TYPED);
      return () => clearTimeout(id);
    } else if (phase === "backspacing") {
      if (displayed.length > 0) {
        const id = setTimeout(() => setDisplayed(displayed.slice(0, -1)), BACKSPACE_SPEED);
        return () => clearTimeout(id);
      } else {
        setPhase("waiting");
      }
    } else if (phase === "waiting") {
      const id = setTimeout(() => setPhase("typing"), PAUSE_AFTER_DELETED);
      return () => clearTimeout(id);
    }
  }, [phase, displayed, text]);

  React.useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-baseline">
      <span
        className="bg-clip-text text-transparent animate-gradient-prominent"
        style={{
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundSize: "200% 100%",
          backgroundImage:
            "linear-gradient(270deg, #ff2d55 0%, #ff9f0a 17%, #bf5af2 33%, #0071e3 50%, #34e0a4 67%, #ff2d55 100%)",
        }}
      >
        {displayed}
      </span>
      <span
        className="inline-block w-[3px] h-[1em] ml-[2px] -mb-[2px] rounded-full"
        style={{
          background: "#1d1d1f",
          opacity: cursorVisible || phase === "typing" || phase === "backspacing" ? 1 : 0,
          transition: "opacity 0.1s",
        }}
      />
    </span>
  );
};

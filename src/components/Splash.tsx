"use client";

import { useState, useEffect } from "react";

interface SplashProps {
  onDismiss: () => void;
}

export default function Splash({ onDismiss }: SplashProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onDismiss, 800);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleClick = () => {
    setFadeOut(true);
    setTimeout(onDismiss, 800);
  };

  return (
    <div
      className={`snap-item splash flex flex-col items-center justify-center cursor-pointer ${fadeOut ? "fade-out" : "fade-in"}`}
      onClick={handleClick}
    >
      <h1 className="vertical-text text-5xl sm:text-7xl font-bold text-rose-900/80 tracking-widest mb-12">
        無限桜
      </h1>

      <div className="absolute bottom-16 flex flex-col items-center gap-2">
        <svg
          className="w-6 h-6 text-rose-400/60 bounce-up"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
        <span className="text-sm text-rose-400/60 tracking-wider">
          swipe up
        </span>
      </div>
    </div>
  );
}

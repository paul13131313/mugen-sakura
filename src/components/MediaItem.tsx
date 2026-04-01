"use client";

import { useRef, useEffect } from "react";

export interface SakuraItem {
  type: "photo" | "video";
  src: string;
  photographer?: string;
  videographer?: string;
  pexelsUrl: string;
}

interface MediaItemProps {
  item: SakuraItem;
}

export default function MediaItem({ item }: MediaItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item.type !== "video" || !videoRef.current || !containerRef.current)
      return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [item.type]);

  const credit = item.photographer || item.videographer || "";

  return (
    <div ref={containerRef} className="snap-item bg-black">
      {item.type === "photo" ? (
        <img
          src={item.src}
          alt="桜"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <video
          ref={videoRef}
          src={item.src}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}

      {/* クレジット（右下） */}
      <div className="absolute bottom-4 right-4 text-white/50 text-xs flex items-center gap-1">
        <span>{credit}</span>
        <span>·</span>
        <a
          href={item.pexelsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Pexels
        </a>
      </div>

    </div>
  );
}

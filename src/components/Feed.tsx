"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MediaItem, { SakuraItem } from "./MediaItem";
import Splash from "./Splash";

export default function Feed() {
  const [items, setItems] = useState<SakuraItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchItems = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sakura?page=${p}&type=mix`);
      const data = await res.json();
      if (data.items) {
        setItems((prev) => [...prev, ...data.items]);
        setPage(data.nextPage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回ロード
  useEffect(() => {
    fetchItems(1);
  }, [fetchItems]);

  // 無限スクロール: sentinel要素を監視
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          fetchItems(page);
        }
      },
      { root: containerRef.current, rootMargin: "300%" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [page, loading, fetchItems]);

  return (
    <div ref={containerRef} className="snap-container">
      {showSplash && <Splash onDismiss={() => setShowSplash(false)} />}

      {items.map((item, i) => (
        <MediaItem key={`${item.src}-${i}`} item={item} />
      ))}

      {/* 無限スクロール用のセンチネル */}
      <div ref={sentinelRef} className="h-1" />

      {loading && (
        <div className="snap-item bg-black flex items-center justify-center">
          <div className="text-white/30 text-sm tracking-wider">...</div>
        </div>
      )}
    </div>
  );
}

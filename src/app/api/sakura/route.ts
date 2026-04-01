import { NextRequest } from "next/server";

const QUERIES = [
  "cherry blossom",
  "sakura",
  "sakura tree",
  "cherry blossom petals",
  "spring cherry blossom",
  "hanami",
];

interface PexelsPhoto {
  id: number;
  photographer: string;
  url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    portrait: string;
  };
}

interface PexelsVideo {
  id: number;
  user: { name: string };
  url: string;
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }[];
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const type = searchParams.get("type") || "mix";

  const query = QUERIES[(page - 1) % QUERIES.length];
  const headers = { Authorization: apiKey };

  try {
    if (type === "photo") {
      const photos = await fetchPhotos(query, page, headers);
      return Response.json({ items: photos, nextPage: page + 1 });
    }

    if (type === "video") {
      const videos = await fetchVideos(query, page, headers);
      return Response.json({ items: videos, nextPage: page + 1 });
    }

    // mix: 写真と動画を両方取得してシャッフル
    const [photos, videos] = await Promise.all([
      fetchPhotos(query, page, headers),
      fetchVideos(query, page, headers),
    ]);

    const items = shuffle([...photos, ...videos]);
    return Response.json({ items, nextPage: page + 1 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

async function fetchPhotos(
  query: string,
  page: number,
  headers: Record<string, string>
) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&page=${page}&orientation=portrait`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Pexels photo API error: ${res.status}`);
  const data = await res.json();

  return (data.photos || []).map((p: PexelsPhoto) => ({
    type: "photo" as const,
    src: p.src.portrait || p.src.large2x || p.src.large,
    photographer: p.photographer,
    pexelsUrl: p.url,
  }));
}

async function fetchVideos(
  query: string,
  page: number,
  headers: Record<string, string>
) {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&page=${page}&orientation=portrait`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Pexels video API error: ${res.status}`);
  const data = await res.json();

  return (data.videos || []).map((v: PexelsVideo) => {
    // 縦向きで最も高画質なmp4を選ぶ
    const mp4Files = v.video_files
      .filter((f) => f.file_type === "video/mp4")
      .sort((a, b) => b.height - a.height);

    // モバイル向けに適切なサイズ（1080p以下）を選ぶ
    const file =
      mp4Files.find((f) => f.height <= 1080 && f.height >= 720) ||
      mp4Files[0];

    return {
      type: "video" as const,
      src: file?.link || "",
      videographer: v.user.name,
      pexelsUrl: v.url,
    };
  }).filter((v: { src: string }) => v.src);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

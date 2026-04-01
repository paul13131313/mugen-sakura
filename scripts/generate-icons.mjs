import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public");

const hiroginoPath = "/System/Library/Fonts/ヒラギノ角ゴシック W9.ttc";
if (existsSync(hiroginoPath)) {
  GlobalFonts.registerFromPath(hiroginoPath, "HiraginoKaku");
}

const fontFamily = GlobalFonts.families.some(f => f.family === "HiraginoKaku")
  ? "HiraginoKaku"
  : "sans-serif";

function generateIcon(size, fontSize, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // 桜色背景
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#FFB7C5");
  bg.addColorStop(1, "#FF91A4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // 「桜」テキスト
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillText("桜", size / 2, size / 2);

  writeFileSync(join(outDir, filename), canvas.toBuffer("image/png"));
  console.log(`Generated ${filename}`);
}

// favicon 32x32
generateIcon(32, 22, "favicon.png");

// apple-touch-icon 180x180
generateIcon(180, 120, "apple-touch-icon.png");

// PWA icons
generateIcon(192, 128, "icon-192.png");
generateIcon(512, 340, "icon-512.png");

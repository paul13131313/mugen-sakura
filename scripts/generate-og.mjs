import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// ヒラギノ明朝があればフォント登録
const hiroginoPath = "/System/Library/Fonts/ヒラギノ明朝 ProN.ttc";
if (existsSync(hiroginoPath)) {
  GlobalFonts.registerFromPath(hiroginoPath, "HiraginoMincho");
}

const W = 1200;
const H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

// 背景グラデーション（桜色）
const bg = ctx.createLinearGradient(0, 0, W, H);
bg.addColorStop(0, "#FFF0F5");
bg.addColorStop(0.5, "#FFE4E1");
bg.addColorStop(1, "#FFF0F5");
ctx.fillStyle = bg;
ctx.fillRect(0, 0, W, H);

// 装飾的な円（桜の花びらイメージ）
ctx.globalAlpha = 0.15;
const circles = [
  { x: 200, y: 150, r: 120, color: "#FFB7C5" },
  { x: 900, y: 100, r: 80, color: "#FF91A4" },
  { x: 1050, y: 450, r: 100, color: "#FFB7C5" },
  { x: 150, y: 500, r: 60, color: "#FF91A4" },
  { x: 600, y: 50, r: 40, color: "#FFB7C5" },
  { x: 700, y: 550, r: 70, color: "#FF91A4" },
];
for (const c of circles) {
  ctx.fillStyle = c.color;
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
  ctx.fill();
}
ctx.globalAlpha = 1;

// メインタイトル「無限桜」
ctx.fillStyle = "#8B2252";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

// フォント設定（ヒラギノ明朝 or serif）
const fontFamily = GlobalFonts.families.some(
  (f) => f.family === "HiraginoMincho"
)
  ? "HiraginoMincho"
  : "serif";

ctx.font = `bold 120px ${fontFamily}`;
ctx.fillText("無限桜", W / 2, H / 2 - 30);

// サブタイトル
ctx.fillStyle = "#8B2252AA";
ctx.font = `28px ${fontFamily}`;
ctx.fillText("桜が止まらない", W / 2, H / 2 + 70);

const buf = canvas.toBuffer("image/png");
writeFileSync(join(outDir, "og.png"), buf);
console.log("Generated public/og.png");

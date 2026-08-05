import type { EditableFoodItem, MealType, Totals } from "@/lib/types";

const LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

interface ShareImageInput {
  imageUrl: string;
  mealType: MealType;
  foods: EditableFoodItem[];
  totals: Totals;
  healthScore: number | null;
  summary: string;
}

export async function downloadShareImage(input: ShareImageInput) {
  const canvas = await buildCanvas(input);
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ai-calorie-tracker-${Date.now()}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function shareShareImage(input: ShareImageInput) {
  const canvas = await buildCanvas(input);
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], "meal.png", { type: "image/png" });

  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files: File[]; title?: string; text?: string }) => Promise<void>;
  };

  if (nav.canShare?.({ files: [file] }) && nav.share) {
    await nav.share({
      files: [file],
      title: "AI Calorie Tracker",
      text: "Check out my meal analysis!",
    });
    return;
  }

  await downloadShareImage(input);
  window.alert("Paylaşım bu cihazda desteklenmiyor, görsel indirildi. Manuel olarak paylaşabilirsin.");
}

async function buildCanvas(input: ShareImageInput): Promise<HTMLCanvasElement> {
  const { imageUrl, mealType, foods, totals, healthScore, summary } = input;
  const width = 1080;
  const height = 1350;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas desteklenmiyor.");

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, width, height);

  const photoHeight = 620;
  const image = await loadImage(imageUrl);
  drawCover(ctx, image, 0, 0, width, photoHeight);

  const gradient = ctx.createLinearGradient(0, photoHeight - 160, 0, photoHeight);
  gradient.addColorStop(0, "rgba(10,10,10,0)");
  gradient.addColorStop(1, "rgba(10,10,10,1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, photoHeight - 160, width, 160);

  let y = photoHeight + 60;

  ctx.fillStyle = "#a3a3a3";
  ctx.font = "600 32px system-ui, sans-serif";
  ctx.fillText(LABELS[mealType].toUpperCase(), 60, y);
  y += 56;

  ctx.fillStyle = "#fafafa";
  ctx.font = "700 44px system-ui, sans-serif";
  const foodNames = foods.map((f) => f.name).filter(Boolean).join(", ") || "Meal";
  y = wrapText(ctx, foodNames, 60, y, width - 120, 52);
  y += 20;

  ctx.fillStyle = "#e5e5e5";
  ctx.font = "500 36px system-ui, sans-serif";
  ctx.fillText(
    `${Math.round(totals.calories)} kcal   P ${Math.round(totals.protein)}g   C ${Math.round(totals.carbs)}g   F ${Math.round(totals.fat)}g`,
    60,
    y
  );
  y += 56;

  if (healthScore !== null) {
    ctx.fillStyle = "#4ade80";
    ctx.font = "600 34px system-ui, sans-serif";
    ctx.fillText(`Health Score: ${healthScore}/10`, 60, y);
    y += 50;
  }

  if (summary) {
    ctx.fillStyle = "#a3a3a3";
    ctx.font = "400 28px system-ui, sans-serif";
    wrapText(ctx, summary, 60, y, width - 120, 38);
  }

  ctx.fillStyle = "#525252";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.fillText("AI Calorie Tracker", 60, height - 60);

  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Fotoğraf yüklenemedi."));
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imageRatio = image.width / image.height;
  const targetRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;

  if (imageRatio > targetRatio) {
    sw = image.height * targetRatio;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / targetRatio;
    sy = (image.height - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }
  return cursorY;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Görsel oluşturulamadı."));
    }, "image/png");
  });
}

import { fal } from "@fal-ai/client";
import { analysisResultSchema, type AnalysisResult } from "@/lib/types";

const VISION_ENDPOINT = process.env.FAL_VISION_ENDPOINT || "openrouter/router/vision";
const VISION_MODEL = process.env.FAL_VISION_MODEL || "openai/gpt-5.6-sol-pro";

const PROMPT = `Analyze the uploaded meal image. Identify every visible food item and estimate its portion size.

Return:
- food name
- estimated quantity
- estimated calories
- protein
- carbohydrates
- fat
- total nutrition values
- a health score from 1 to 10
- a short explanation

Return only valid JSON, with no markdown code fences and no extra text, in exactly this shape:
{
  "foods": [
    { "name": string, "quantity": string, "calories": number, "protein": number, "carbs": number, "fat": number }
  ],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "healthScore": number,
  "summary": string
}

Be clear that every value is an estimate based on the visible image. Do not claim medical certainty.
You cannot know oils, sauces, sugar, or other hidden ingredients not visible in the photo with certainty — account for that in your estimate.`;

export async function analyzeMealImage(imageUrl: string): Promise<AnalysisResult> {
  if (!process.env.FAL_KEY) {
    throw new Error("FAL_KEY tanımlı değil. .env.local dosyasını kontrol et.");
  }

  fal.config({ credentials: process.env.FAL_KEY });

  const result = await fal.subscribe(VISION_ENDPOINT, {
    input: {
      model: VISION_MODEL,
      prompt: PROMPT,
      image_urls: [imageUrl],
    },
  });

  const raw = extractText(result.data);
  const json = parseJson(raw);
  const parsed = analysisResultSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(`Model çıktısı beklenen formatta değil: ${parsed.error.message}`);
  }

  return parsed.data;
}

function extractText(data: unknown): string {
  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    if (typeof obj.output === "string") return obj.output;
    if (typeof obj.text === "string") return obj.text;
    if (typeof obj.response === "string") return obj.response;

    const choices = obj.choices as Array<{ message?: { content?: string } }> | undefined;
    const choiceContent = choices?.[0]?.message?.content;
    if (typeof choiceContent === "string") return choiceContent;

    if (obj.output && typeof obj.output === "object") return JSON.stringify(obj.output);
  }

  return JSON.stringify(data);
}

function parseJson(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end >= 0 ? cleaned.slice(start, end + 1) : cleaned;

  return JSON.parse(slice);
}

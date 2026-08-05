import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeMealImage } from "@/lib/fal";
import { MEAL_TYPES } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const imageUrl = body?.imageUrl;
  const mealType = body?.mealType;

  if (typeof imageUrl !== "string" || !imageUrl) {
    return NextResponse.json({ error: "imageUrl gerekli." }, { status: 400 });
  }
  if (!MEAL_TYPES.includes(mealType)) {
    return NextResponse.json({ error: "Geçersiz meal type." }, { status: 400 });
  }

  try {
    const result = await analyzeMealImage(imageUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error("analyze error", error);
    const message = error instanceof Error ? error.message : "Analiz başarısız oldu.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

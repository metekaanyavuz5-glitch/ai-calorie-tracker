"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AnalysisResult, EditableFoodItem, Meal, MealType, Totals } from "@/lib/types";
import Navbar from "@/components/Navbar";
import LogoutButton from "@/components/LogoutButton";
import MealTypeSelector from "@/components/MealTypeSelector";
import PhotoUploader from "@/components/PhotoUploader";
import CameraCaptureModal from "@/components/CameraCaptureModal";
import ResultsPanel from "@/components/ResultsPanel";
import DailyTotals from "@/components/DailyTotals";
import MealHistory from "@/components/MealHistory";
import Disclaimer from "@/components/Disclaimer";
import { downloadShareImage, shareShareImage } from "@/lib/shareImage";

type FlowState = "idle" | "uploading" | "analyzing" | "ready" | "saving";

const EMPTY_TOTALS: Totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export default function Dashboard({
  userEmail,
  initialMeals,
}: {
  userEmail: string;
  initialMeals: Meal[];
}) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [foods, setFoods] = useState<EditableFoodItem[] | null>(null);
  const [summary, setSummary] = useState("");
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const totals = useMemo<Totals>(() => {
    if (!foods) return EMPTY_TOTALS;
    return foods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fat: acc.fat + food.fat,
      }),
      { ...EMPTY_TOTALS }
    );
  }, [foods]);

  const dailyTotals = useMemo<Totals>(() => {
    const todayKey = new Date().toDateString();
    return meals
      .filter((meal) => new Date(meal.created_at).toDateString() === todayKey)
      .reduce(
        (acc, meal) => ({
          calories: acc.calories + Number(meal.total_calories),
          protein: acc.protein + Number(meal.protein),
          carbs: acc.carbs + Number(meal.carbs),
          fat: acc.fat + Number(meal.fat),
        }),
        { ...EMPTY_TOTALS }
      );
  }, [meals]);

  function resetResults() {
    setFoods(null);
    setSummary("");
    setHealthScore(null);
    setErrorMessage(null);
    setIsEditing(false);
  }

  function handlePhotoSelected(file: File) {
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setUploadedImageUrl(null);
    resetResults();
  }

  function handleScanAgain() {
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setUploadedImageUrl(null);
    resetResults();
    setFlowState("idle");
  }

  async function handleAnalyze() {
    if (!photoFile) {
      setErrorMessage("Önce bir fotoğraf yükle veya çek.");
      return;
    }

    setErrorMessage(null);
    setFlowState("uploading");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum bulunamadı, lütfen tekrar giriş yap.");

      const extension = photoFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("meal-photos")
        .upload(path, photoFile, { upsert: false });
      if (uploadError) throw new Error(`Fotoğraf yüklenemedi: ${uploadError.message}`);

      const {
        data: { publicUrl },
      } = supabase.storage.from("meal-photos").getPublicUrl(path);
      setUploadedImageUrl(publicUrl);

      setFlowState("analyzing");
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: publicUrl, mealType }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Analiz başarısız oldu.");
      }

      const result = payload as AnalysisResult;
      setFoods(result.foods.map((food) => ({ ...food, key: crypto.randomUUID() })));
      setSummary(result.summary);
      setHealthScore(result.healthScore);
      setFlowState("ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.");
      setFlowState("idle");
    }
  }

  function updateFood(key: string, patch: Partial<EditableFoodItem>) {
    setFoods((prev) => (prev ? prev.map((food) => (food.key === key ? { ...food, ...patch } : food)) : prev));
  }

  function removeFood(key: string) {
    setFoods((prev) => (prev ? prev.filter((food) => food.key !== key) : prev));
  }

  function addFood() {
    setFoods((prev) => [
      ...(prev ?? []),
      { key: crypto.randomUUID(), name: "", quantity: "", calories: 0, protein: 0, carbs: 0, fat: 0 },
    ]);
  }

  async function handleSave() {
    if (!foods || foods.length === 0) return;
    setFlowState("saving");
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum bulunamadı, lütfen tekrar giriş yap.");

      const cleanFoods = foods.map(({ key: _key, ...rest }) => rest);

      const { data, error } = await supabase
        .from("meals")
        .insert({
          user_id: user.id,
          meal_type: mealType,
          image_url: uploadedImageUrl,
          foods: cleanFoods,
          total_calories: totals.calories,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          health_score: healthScore,
        })
        .select()
        .single();

      if (error) throw new Error(`Kaydedilemedi: ${error.message}`);

      setMeals((prev) => [data as Meal, ...prev]);
      handleScanAgain();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.");
      setFlowState("ready");
    }
  }

  async function handleDownload() {
    const image = uploadedImageUrl ?? photoPreviewUrl;
    if (!foods || !image) return;
    try {
      await downloadShareImage({ imageUrl: image, mealType, foods, totals, healthScore, summary });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Görsel oluşturulamadı.");
    }
  }

  async function handleShare() {
    const image = uploadedImageUrl ?? photoPreviewUrl;
    if (!foods || !image) return;
    try {
      await shareShareImage({ imageUrl: image, mealType, foods, totals, healthScore, summary });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Paylaşım başarısız oldu.");
    }
  }

  const isBusy = flowState === "uploading" || flowState === "analyzing" || flowState === "saving";

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 dark:bg-neutral-950">
      <Navbar>
        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-neutral-500 dark:text-neutral-400 sm:block">
            {userEmail}
          </p>
          <LogoutButton />
        </div>
      </Navbar>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_1fr_320px]">
        <section className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <MealTypeSelector value={mealType} onChange={setMealType} disabled={isBusy} />
          <PhotoUploader
            previewUrl={photoPreviewUrl}
            onFileSelected={handlePhotoSelected}
            onOpenCamera={() => setCameraOpen(true)}
            disabled={isBusy}
          />
          <button
            onClick={handleAnalyze}
            disabled={!photoFile || isBusy}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {flowState === "uploading" && "Fotoğraf yükleniyor..."}
            {flowState === "analyzing" && "Analiz ediliyor..."}
            {(flowState === "idle" || flowState === "ready" || flowState === "saving") && "Analyze Meal"}
          </button>
          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {errorMessage}
            </p>
          )}
          <Disclaimer />
        </section>

        <section className="space-y-4">
          {foods ? (
            <ResultsPanel
              mealType={mealType}
              imageUrl={uploadedImageUrl ?? photoPreviewUrl}
              foods={foods}
              totals={totals}
              healthScore={healthScore}
              summary={summary}
              isEditing={isEditing}
              onToggleEdit={() => setIsEditing((value) => !value)}
              onUpdateFood={updateFood}
              onRemoveFood={removeFood}
              onAddFood={addFood}
              onSave={handleSave}
              onScanAgain={handleScanAgain}
              onDownload={handleDownload}
              onShare={handleShare}
              isSaving={flowState === "saving"}
            />
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-neutral-300 text-sm text-neutral-400 dark:border-neutral-700">
              Sonuçlar burada görünecek.
            </div>
          )}
        </section>

        <section className="space-y-6">
          <DailyTotals totals={dailyTotals} />
          <MealHistory meals={meals} />
        </section>
      </main>

      {isCameraOpen && (
        <CameraCaptureModal
          onClose={() => setCameraOpen(false)}
          onCapture={(file) => {
            handlePhotoSelected(file);
            setCameraOpen(false);
          }}
        />
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Sparkles, UtensilsCrossed, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AnalysisResult, EditableFoodItem, FoodItem, Meal, MealType, Totals } from "@/lib/types";
import Navbar from "@/components/Navbar";
import MealTypeSelector from "@/components/MealTypeSelector";
import PhotoUploader from "@/components/PhotoUploader";
import CameraCaptureModal from "@/components/CameraCaptureModal";
import ResultsPanel from "@/components/ResultsPanel";
import DailyTotals from "@/components/DailyTotals";
import MealHistory from "@/components/MealHistory";
import Disclaimer from "@/components/Disclaimer";
import FeatureHighlights from "@/components/FeatureHighlights";
import AddMealModal from "@/components/AddMealModal";
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
  const [isAddMealOpen, setAddMealOpen] = useState(false);
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

  async function handleAddMealManually(type: MealType, manualFoods: FoodItem[]) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum bulunamadı, lütfen tekrar giriş yap.");

    const manualTotals = manualFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fat: acc.fat + food.fat,
      }),
      { ...EMPTY_TOTALS }
    );

    const { data, error } = await supabase
      .from("meals")
      .insert({
        user_id: user.id,
        meal_type: type,
        image_url: null,
        foods: manualFoods,
        total_calories: manualTotals.calories,
        protein: manualTotals.protein,
        carbs: manualTotals.carbs,
        fat: manualTotals.fat,
        health_score: null,
      })
      .select()
      .single();

    if (error) throw new Error(`Kaydedilemedi: ${error.message}`);

    setMeals((prev) => [data as Meal, ...prev]);
    setAddMealOpen(false);
  }

  async function handleDeleteMeal(id: string) {
    const previous = meals;
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
    const supabase = createClient();
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) {
      setMeals(previous);
      setErrorMessage(`Silinemedi: ${error.message}`);
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
  const isAnalyzeLoading = flowState === "uploading" || flowState === "analyzing";

  return (
    <div className="min-h-screen pb-16">
      <Navbar userEmail={userEmail} />

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[380px_1fr_340px] lg:px-8 lg:py-8">
        <section className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 lg:sticky lg:top-20">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Track Your Calories
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Snap a meal photo and get instant nutrition insights.
            </p>
          </div>
          <MealTypeSelector value={mealType} onChange={setMealType} disabled={isBusy} />
          <PhotoUploader
            previewUrl={photoPreviewUrl}
            onFileSelected={handlePhotoSelected}
            onOpenCamera={() => setCameraOpen(true)}
            onClear={handleScanAgain}
            disabled={isBusy}
          />
          <button
            onClick={handleAnalyze}
            disabled={!photoFile || isBusy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
          >
            {isAnalyzeLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
            ) : (
              <Sparkles className="h-4 w-4" strokeWidth={2.25} />
            )}
            {flowState === "uploading" && "Fotoğraf yükleniyor..."}
            {flowState === "analyzing" && "Analiz ediliyor..."}
            {(flowState === "idle" || flowState === "ready" || flowState === "saving") && "Analyze Meal"}
          </button>
          {errorMessage && (
            <p className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              {errorMessage}
            </p>
          )}
          <Disclaimer />
          <FeatureHighlights />
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
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300">
                <UtensilsCrossed className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Your results will appear here</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Upload a meal photo and tap Analyze Meal to see the nutrition breakdown.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <DailyTotals totals={dailyTotals} />
          <MealHistory meals={meals} onDeleteMeal={handleDeleteMeal} onAddManually={() => setAddMealOpen(true)} />
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

      {isAddMealOpen && (
        <AddMealModal onClose={() => setAddMealOpen(false)} onSave={handleAddMealManually} />
      )}
    </div>
  );
}

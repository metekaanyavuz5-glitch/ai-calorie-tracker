"use client";

import { Flame, Beef, Wheat, Droplet, Sparkles, Pencil, Check, RotateCcw, Download, Share2, Save, Plus } from "lucide-react";
import type { EditableFoodItem, MealType, Totals } from "@/lib/types";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from "@/lib/mealTypeMeta";
import FoodItemRow from "@/components/FoodItemRow";

function healthScoreTone(score: number) {
  if (score >= 7) return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 4) return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  return { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" };
}

export default function ResultsPanel({
  mealType,
  imageUrl,
  foods,
  totals,
  healthScore,
  summary,
  isEditing,
  onToggleEdit,
  onUpdateFood,
  onRemoveFood,
  onAddFood,
  onSave,
  onScanAgain,
  onDownload,
  onShare,
  isSaving,
}: {
  mealType: MealType;
  imageUrl: string | null;
  foods: EditableFoodItem[];
  totals: Totals;
  healthScore: number | null;
  summary: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdateFood: (key: string, patch: Partial<EditableFoodItem>) => void;
  onRemoveFood: (key: string) => void;
  onAddFood: () => void;
  onSave: () => void;
  onScanAgain: () => void;
  onDownload: () => void;
  onShare: () => void;
  isSaving: boolean;
}) {
  const MealIcon = MEAL_TYPE_ICONS[mealType];
  const tone = healthScore !== null ? healthScoreTone(healthScore) : null;

  return (
    <div className="animate-fade-in-up space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
      {imageUrl && (
        <div className="relative overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Analyzed meal" className="max-h-72 w-full object-cover" />
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
            <MealIcon className="h-3.5 w-3.5 text-indigo-500" strokeWidth={2.25} aria-hidden="true" />
            {MEAL_TYPE_LABELS[mealType]}
          </span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Detected Foods <span className="font-normal text-slate-400">({foods.length})</span>
            </h2>
            <button
              onClick={onToggleEdit}
              className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-white/10 dark:text-slate-300 dark:hover:text-indigo-300"
            >
              {isEditing ? <Check className="h-3 w-3" strokeWidth={2.5} /> : <Pencil className="h-3 w-3" strokeWidth={2.25} />}
              {isEditing ? "Done" : "Fix Results"}
            </button>
          </div>

          <div className="space-y-2">
            {foods.map((food, index) => (
              <FoodItemRow
                key={food.key}
                food={food}
                index={index}
                isEditing={isEditing}
                onChange={(patch) => onUpdateFood(food.key, patch)}
                onRemove={() => onRemoveFood(food.key)}
              />
            ))}
            {isEditing && (
              <button
                onClick={onAddFood}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/15 dark:hover:border-indigo-400/40"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                Add food
              </button>
            )}
          </div>
        </div>

        <div className="lg:border-l lg:border-slate-100 lg:pl-5 lg:dark:border-white/10">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Nutrition Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <Stat
              icon={Flame}
              tone="bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300"
              label="Calories"
              value={`${Math.round(totals.calories)}`}
              unit="kcal"
            />
            <Stat
              icon={Beef}
              tone="bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300"
              label="Protein"
              value={`${Math.round(totals.protein)}`}
              unit="g"
            />
            <Stat
              icon={Wheat}
              tone="bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-300"
              label="Carbs"
              value={`${Math.round(totals.carbs)}`}
              unit="g"
            />
            <Stat
              icon={Droplet}
              tone="bg-sky-50 text-sky-500 dark:bg-sky-500/10 dark:text-sky-300"
              label="Fat"
              value={`${Math.round(totals.fat)}`}
              unit="g"
            />
          </div>

          {healthScore !== null && tone && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Health Score</span>
                <span className={`font-semibold ${tone.text}`}>{healthScore}/10</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className={`h-full rounded-full ${tone.bar} transition-all`}
                  style={{ width: `${Math.min(100, Math.max(4, healthScore * 10))}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {summary && (
        <div className="flex items-start gap-2.5 rounded-xl bg-indigo-50/70 p-3.5 dark:bg-indigo-500/10">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-300" strokeWidth={2} aria-hidden="true" />
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{summary}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-white/10">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" strokeWidth={2.25} />
          {isSaving ? "Saving..." : "Save Meal"}
        </button>
        <button
          onClick={onScanAgain}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} />
          Scan Again
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          Download
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          <Share2 className="h-4 w-4" strokeWidth={2} />
          Share
        </button>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  tone,
  label,
  value,
  unit,
}: {
  icon: typeof Flame;
  tone: string;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-white/5">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${tone}`}>
        <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <p className="mt-2.5 truncate text-xl font-semibold leading-none text-slate-900 dark:text-white">
        {value}
        <span className="ml-1 text-xs font-normal text-slate-400">{unit}</span>
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

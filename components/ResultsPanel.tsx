"use client";

import type { EditableFoodItem, MealType, Totals } from "@/lib/types";
import FoodItemRow from "@/components/FoodItemRow";

export default function ResultsPanel({
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
  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="Analyzed meal" className="max-h-64 w-full rounded-lg object-cover" />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Detected Foods
        </h2>
        <button
          onClick={onToggleEdit}
          className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {isEditing ? "Done" : "Fix Results"}
        </button>
      </div>

      <div className="space-y-2">
        {foods.map((food) => (
          <FoodItemRow
            key={food.key}
            food={food}
            isEditing={isEditing}
            onChange={(patch) => onUpdateFood(food.key, patch)}
            onRemove={() => onRemoveFood(food.key)}
          />
        ))}
        {isEditing && (
          <button
            onClick={onAddFood}
            className="w-full rounded-lg border border-dashed border-neutral-300 py-2 text-xs text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            + Add food
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800/50 sm:grid-cols-4">
        <Stat label="Calories" value={`${Math.round(totals.calories)} kcal`} />
        <Stat label="Protein" value={`${Math.round(totals.protein)} g`} />
        <Stat label="Carbs" value={`${Math.round(totals.carbs)} g`} />
        <Stat label="Fat" value={`${Math.round(totals.fat)} g`} />
      </div>

      {healthScore !== null && (
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Health Score: <span className="font-semibold">{healthScore}/10</span>
        </p>
      )}
      {summary && <p className="text-sm text-neutral-500 dark:text-neutral-400">{summary}</p>}

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {isSaving ? "Saving..." : "Save Meal"}
        </button>
        <button
          onClick={onScanAgain}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Scan Again
        </button>
        <button
          onClick={onDownload}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Download
        </button>
        <button
          onClick={onShare}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Share
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-400 dark:text-neutral-500">{label}</p>
      <p className="font-semibold text-neutral-900 dark:text-neutral-50">{value}</p>
    </div>
  );
}

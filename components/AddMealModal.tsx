"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { FoodItem, MealType } from "@/lib/types";
import MealTypeSelector from "@/components/MealTypeSelector";

interface DraftFood {
  key: string;
  name: string;
  quantity: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

function emptyDraft(): DraftFood {
  return {
    key: crypto.randomUUID(),
    name: "",
    quantity: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  };
}

export default function AddMealModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (mealType: MealType, foods: FoodItem[]) => Promise<void>;
}) {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [drafts, setDrafts] = useState<DraftFood[]>([emptyDraft()]);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateDraft(key: string, patch: Partial<DraftFood>) {
    setDrafts((prev) => prev.map((draft) => (draft.key === key ? { ...draft, ...patch } : draft)));
  }

  function removeDraft(key: string) {
    setDrafts((prev) => (prev.length > 1 ? prev.filter((draft) => draft.key !== key) : prev));
  }

  const totalCalories = drafts.reduce((sum, draft) => sum + (Number(draft.calories) || 0), 0);

  async function handleSubmit() {
    const foods: FoodItem[] = drafts
      .filter((draft) => draft.name.trim().length > 0)
      .map((draft) => ({
        name: draft.name.trim(),
        quantity: draft.quantity.trim() || "1 serving",
        calories: Number(draft.calories) || 0,
        protein: Number(draft.protein) || 0,
        carbs: Number(draft.carbs) || 0,
        fat: Number(draft.fat) || 0,
      }));

    if (foods.length === 0) {
      setError("En az bir yiyecek adı gir.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSave(mealType, foods);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Add Meal Manually</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>

        <div className="space-y-4">
          <MealTypeSelector value={mealType} onChange={setMealType} disabled={isSaving} />

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Foods</p>
            {drafts.map((draft) => (
              <div key={draft.key} className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-white/10 sm:grid-cols-6">
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft(draft.key, { name: event.target.value })}
                  placeholder="Name"
                  className="col-span-2 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-950"
                />
                <input
                  value={draft.quantity}
                  onChange={(event) => updateDraft(draft.key, { quantity: event.target.value })}
                  placeholder="Quantity"
                  className="rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-950"
                />
                <input
                  type="number"
                  value={draft.calories}
                  onChange={(event) => updateDraft(draft.key, { calories: event.target.value })}
                  placeholder="kcal"
                  className="w-full min-w-0 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-950"
                />
                <input
                  type="number"
                  value={draft.protein}
                  onChange={(event) => updateDraft(draft.key, { protein: event.target.value })}
                  placeholder="P (g)"
                  className="w-full min-w-0 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-950"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={draft.carbs}
                    onChange={(event) => updateDraft(draft.key, { carbs: event.target.value })}
                    placeholder="C (g)"
                    className="w-full min-w-0 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-950"
                  />
                  <button
                    type="button"
                    onClick={() => removeDraft(draft.key)}
                    disabled={drafts.length === 1}
                    aria-label="Remove food"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setDrafts((prev) => [...prev, emptyDraft()])}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/15 dark:hover:border-indigo-400/40"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
              Add food
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm dark:bg-white/5">
            <span className="text-slate-500 dark:text-slate-400">Total Calories</span>
            <span className="font-semibold text-slate-900 dark:text-white">{Math.round(totalCalories)} kcal</span>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Meal"}
            </button>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

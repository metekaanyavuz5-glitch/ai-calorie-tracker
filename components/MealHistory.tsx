"use client";

import { useState } from "react";
import { Plus, UtensilsCrossed } from "lucide-react";
import type { Meal } from "@/lib/types";
import MealCard from "@/components/MealCard";

const COLLAPSED_COUNT = 4;

export default function MealHistory({
  meals,
  onDeleteMeal,
  onAddManually,
}: {
  meals: Meal[];
  onDeleteMeal?: (id: string) => void;
  onAddManually?: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleMeals = showAll ? meals : meals.slice(0, COLLAPSED_COUNT);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Meal History</h2>
        {meals.length > COLLAPSED_COUNT && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {showAll ? "Show less" : "View All"}
          </button>
        )}
      </div>

      {meals.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-white/10">
          <UtensilsCrossed className="h-5 w-5 text-slate-300 dark:text-slate-600" strokeWidth={1.75} aria-hidden="true" />
          <p className="text-sm text-slate-400 dark:text-slate-500">Henüz kayıtlı öğün yok.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {visibleMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onDelete={onDeleteMeal} />
          ))}
        </div>
      )}

      {onAddManually && (
        <button
          type="button"
          onClick={onAddManually}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-white/15 dark:text-slate-300 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
          Add Meal Manually
        </button>
      )}
    </div>
  );
}

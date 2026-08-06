"use client";

import { MEAL_TYPES, type MealType } from "@/lib/types";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from "@/lib/mealTypeMeta";

export default function MealTypeSelector({
  value,
  onChange,
  disabled,
}: {
  value: MealType;
  onChange: (value: MealType) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Meal Type</p>
      <div className="grid grid-cols-4 gap-2">
        {MEAL_TYPES.map((type) => {
          const Icon = MEAL_TYPE_ICONS[type];
          const isActive = value === type;
          return (
            <button
              key={type}
              type="button"
              disabled={disabled}
              onClick={() => onChange(type)}
              aria-pressed={isActive}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/15 dark:text-indigo-300"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
              {MEAL_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

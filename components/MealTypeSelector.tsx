"use client";

import { MEAL_TYPES, type MealType } from "@/lib/types";

const LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

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
      <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Meal Type</p>
      <div className="grid grid-cols-4 gap-2">
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onChange(type)}
            className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
              value === type
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}

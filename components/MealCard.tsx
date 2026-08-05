import type { Meal, MealType } from "@/lib/types";

const LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export default function MealCard({ meal }: { meal: Meal }) {
  const date = new Date(meal.created_at);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-100 p-2 dark:border-neutral-800">
      {meal.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={meal.image_url} alt={meal.meal_type} className="h-12 w-12 rounded-md object-cover" />
      ) : (
        <div className="h-12 w-12 rounded-md bg-neutral-100 dark:bg-neutral-800" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">
          {LABELS[meal.meal_type] ?? meal.meal_type}
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          {date.toLocaleDateString()} ·{" "}
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        {Math.round(Number(meal.total_calories))} kcal
      </p>
    </div>
  );
}

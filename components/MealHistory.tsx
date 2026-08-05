import type { Meal } from "@/lib/types";
import MealCard from "@/components/MealCard";

export default function MealHistory({ meals }: { meals: Meal[] }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Meal History
      </h2>
      {meals.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">Henüz kayıtlı öğün yok.</p>
      ) : (
        <div className="space-y-2">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}

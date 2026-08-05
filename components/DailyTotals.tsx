import type { Totals } from "@/lib/types";

export default function DailyTotals({ totals }: { totals: Totals }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Daily Totals
      </h2>
      <div className="space-y-2 text-sm">
        <Row label="Total Calories" value={`${Math.round(totals.calories)} kcal`} />
        <Row label="Total Protein" value={`${Math.round(totals.protein)} g`} />
        <Row label="Total Carbs" value={`${Math.round(totals.carbs)} g`} />
        <Row label="Total Fat" value={`${Math.round(totals.fat)} g`} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="font-semibold text-neutral-900 dark:text-neutral-50">{value}</span>
    </div>
  );
}

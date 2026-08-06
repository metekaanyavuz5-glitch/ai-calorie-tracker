import { Flame, Beef, Wheat, Droplet } from "lucide-react";
import type { Totals } from "@/lib/types";

const ROWS = [
  { key: "calories", icon: Flame, tone: "bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300", label: "Total Calories", unit: "kcal" },
  { key: "protein", icon: Beef, tone: "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300", label: "Total Protein", unit: "g" },
  { key: "carbs", icon: Wheat, tone: "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-300", label: "Total Carbs", unit: "g" },
  { key: "fat", icon: Droplet, tone: "bg-sky-50 text-sky-500 dark:bg-sky-500/10 dark:text-sky-300", label: "Total Fat", unit: "g" },
] as const;

export default function DailyTotals({ totals }: { totals: Totals }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Daily Totals</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-white/10 dark:text-slate-400">
          Today
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ROWS.map((row) => (
          <div key={row.key} className="rounded-xl bg-slate-50 p-3.5 dark:bg-white/5">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${row.tone}`}>
              <row.icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <p className="mt-2.5 text-xl font-semibold leading-none text-slate-900 dark:text-white">
              {Math.round(totals[row.key])}
              <span className="ml-1 text-xs font-normal text-slate-400">{row.unit}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{row.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

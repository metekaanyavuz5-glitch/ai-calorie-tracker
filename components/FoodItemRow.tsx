"use client";

import { Utensils, Trash2 } from "lucide-react";
import type { EditableFoodItem } from "@/lib/types";

const ICON_TONES = [
  "bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300",
  "bg-sky-50 text-sky-500 dark:bg-sky-500/10 dark:text-sky-300",
  "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-300",
  "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300",
  "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300",
  "bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-300",
];

export default function FoodItemRow({
  food,
  index,
  isEditing,
  onChange,
  onRemove,
}: {
  food: EditableFoodItem;
  index: number;
  isEditing: boolean;
  onChange: (patch: Partial<EditableFoodItem>) => void;
  onRemove: () => void;
}) {
  if (!isEditing) {
    const tone = ICON_TONES[index % ICON_TONES.length];
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-sm transition hover:border-slate-200 hover:bg-slate-50/60 dark:border-white/10 dark:hover:bg-white/5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone}`}>
          <Utensils className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-900 dark:text-white">{food.name || "Untitled item"}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{food.quantity}</p>
        </div>
        <p className="shrink-0 font-semibold text-slate-700 dark:text-slate-200">
          {Math.round(food.calories)} kcal
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-white/10 sm:grid-cols-6">
      <input
        value={food.name}
        onChange={(event) => onChange({ name: event.target.value })}
        placeholder="Name"
        className="col-span-2 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-900"
      />
      <input
        value={food.quantity}
        onChange={(event) => onChange({ quantity: event.target.value })}
        placeholder="Quantity"
        className="rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-900"
      />
      <NumberField label="kcal" value={food.calories} onChange={(value) => onChange({ calories: value })} />
      <NumberField label="P (g)" value={food.protein} onChange={(value) => onChange({ protein: value })} />
      <NumberField label="C (g)" value={food.carbs} onChange={(value) => onChange({ carbs: value })} />
      <div className="flex items-center gap-1">
        <NumberField label="F (g)" value={food.fat} onChange={(value) => onChange({ fat: value })} />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove food item"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200 text-rose-500 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value) || 0)}
      placeholder={label}
      className="w-full min-w-0 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-900"
    />
  );
}

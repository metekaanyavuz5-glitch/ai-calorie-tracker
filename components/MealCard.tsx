"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import type { Meal } from "@/lib/types";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from "@/lib/mealTypeMeta";

export default function MealCard({
  meal,
  onDelete,
}: {
  meal: Meal;
  onDelete?: (id: string) => void;
}) {
  const date = new Date(meal.created_at);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const Icon = MEAL_TYPE_ICONS[meal.meal_type];

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClickAway(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [isMenuOpen]);

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    await onDelete(meal.id);
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-slate-100 p-2 transition hover:border-slate-200 hover:bg-slate-50/60 dark:border-white/10 dark:hover:bg-white/5">
      {meal.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={meal.image_url} alt={meal.meal_type} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500">
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
          {MEAL_TYPE_LABELS[meal.meal_type] ?? meal.meal_type}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {Math.round(Number(meal.total_calories))} kcal
      </p>
      {onDelete && (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Meal options"
            aria-expanded={isMenuOpen}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 group-hover:opacity-100 dark:hover:bg-white/10 dark:hover:text-slate-200"
          >
            <MoreVertical className="h-4 w-4" strokeWidth={2} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-10 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-slate-800">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import type { EditableFoodItem } from "@/lib/types";

export default function FoodItemRow({
  food,
  isEditing,
  onChange,
  onRemove,
}: {
  food: EditableFoodItem;
  isEditing: boolean;
  onChange: (patch: Partial<EditableFoodItem>) => void;
  onRemove: () => void;
}) {
  if (!isEditing) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2 text-sm dark:border-neutral-800">
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-50">{food.name}</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">{food.quantity}</p>
        </div>
        <p className="text-neutral-600 dark:text-neutral-300">{Math.round(food.calories)} kcal</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-700 sm:grid-cols-6">
      <input
        value={food.name}
        onChange={(event) => onChange({ name: event.target.value })}
        placeholder="Name"
        className="col-span-2 rounded border border-neutral-200 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <input
        value={food.quantity}
        onChange={(event) => onChange({ quantity: event.target.value })}
        placeholder="Quantity"
        className="rounded border border-neutral-200 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <NumberField label="kcal" value={food.calories} onChange={(value) => onChange({ calories: value })} />
      <NumberField label="P" value={food.protein} onChange={(value) => onChange({ protein: value })} />
      <NumberField label="C" value={food.carbs} onChange={(value) => onChange({ carbs: value })} />
      <NumberField label="F" value={food.fat} onChange={(value) => onChange({ fat: value })} />
      <button
        type="button"
        onClick={onRemove}
        className="col-span-2 rounded border border-red-200 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 sm:col-span-6"
      >
        Remove
      </button>
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
      className="rounded border border-neutral-200 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
    />
  );
}

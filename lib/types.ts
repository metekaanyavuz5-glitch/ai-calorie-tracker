import { z } from "zod";

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const foodItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().min(1),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});
export type FoodItem = z.infer<typeof foodItemSchema>;

export interface EditableFoodItem extends FoodItem {
  key: string;
}

export const analysisResultSchema = z.object({
  foods: z.array(foodItemSchema).min(1),
  totalCalories: z.number().nonnegative(),
  totalProtein: z.number().nonnegative(),
  totalCarbs: z.number().nonnegative(),
  totalFat: z.number().nonnegative(),
  healthScore: z.number().min(1).max(10),
  summary: z.string().min(1),
});
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  user_id: string;
  meal_type: MealType;
  image_url: string | null;
  foods: FoodItem[];
  total_calories: number;
  protein: number;
  carbs: number;
  fat: number;
  health_score: number | null;
  created_at: string;
}

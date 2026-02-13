export type DietType =
  | 'All'
  | 'Vegetarian'
  | 'Vegan'
  | 'Keto'
  | 'Paleo'
  | 'Gluten-Free'
  | 'Low-Carb';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface Meal {
  id: string;
  name: string;
  mealType: MealType;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  calories?: number;
  dietaryTags: DietType[];
}

export interface DayPlan {
  day: string;
  date: string;
  meals: Meal[];
}

export interface ExtractedRecipe {
  id: string;
  title: string;
  sourceUrl: string;
  sourceTitle?: string;
  description: string;
  servings?: number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  estimatedTime?: string;
  cuisine?: string;
  ingredientCount?: number;
  ingredients: GroceryItem[];
  instructions: string[];
  tips?: string[];
  extractedAt: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: GroceryCategory;
  isChecked: boolean;
  notes?: string;
}

export type GroceryCategory =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Bakery'
  | 'Pantry Staples'
  | 'Spices & Seasonings'
  | 'Frozen'
  | 'Beverages'
  | 'Other';

export interface VideoExtractionResult {
  recipe: ExtractedRecipe;
  groceryList: GroceryItem[];
  totalEstimatedCost?: string;
}

export interface Cookbook {
  id: string;
  title: string;
  author: string;
  coverColor?: string;
  addedAt: string;
  recipeCount?: number;
  notes?: string;
}

export interface RecipeMatch {
  id: string;
  title: string;
  cookbookTitle: string;
  cookbookAuthor: string;
  matchedIngredients: string[];
  missingIngredients: string[];
  matchPercentage: number;
  description: string;
  estimatedTime?: string;
  pageNumber?: string;
}

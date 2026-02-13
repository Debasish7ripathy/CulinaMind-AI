import { create } from 'zustand';
import { ExtractedRecipe, GroceryItem } from '../types/recipe';

interface RecipeState {
  // Video/URL extraction state
  savedUrls: string[];
  extractedRecipes: ExtractedRecipe[];
  currentGroceryList: GroceryItem[];
  isExtracting: boolean;
  extractionError: string | null;
  totalEstimatedCost: string | null;

  // Actions
  addUrl: (url: string) => void;
  removeUrl: (url: string) => void;
  clearUrls: () => void;
  setExtractedRecipes: (recipes: ExtractedRecipe[]) => void;
  addExtractedRecipe: (recipe: ExtractedRecipe) => void;
  setCurrentGroceryList: (list: GroceryItem[]) => void;
  toggleGroceryItem: (id: string) => void;
  clearGroceryList: () => void;
  setIsExtracting: (val: boolean) => void;
  setExtractionError: (err: string | null) => void;
  setTotalEstimatedCost: (cost: string | null) => void;
  getCheckedCount: () => number;
  getUncheckedItems: () => GroceryItem[];
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  savedUrls: [],
  extractedRecipes: [],
  currentGroceryList: [],
  isExtracting: false,
  extractionError: null,
  totalEstimatedCost: null,

  addUrl: (url) =>
    set((state) => ({
      savedUrls: state.savedUrls.includes(url)
        ? state.savedUrls
        : [...state.savedUrls, url],
    })),
  removeUrl: (url) =>
    set((state) => ({
      savedUrls: state.savedUrls.filter((u) => u !== url),
    })),
  clearUrls: () => set({ savedUrls: [] }),

  setExtractedRecipes: (recipes) => set({ extractedRecipes: recipes }),
  addExtractedRecipe: (recipe) =>
    set((state) => ({
      extractedRecipes: [...state.extractedRecipes, recipe],
    })),

  setCurrentGroceryList: (list) => set({ currentGroceryList: list }),
  toggleGroceryItem: (id) =>
    set((state) => ({
      currentGroceryList: state.currentGroceryList.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item,
      ),
    })),
  clearGroceryList: () =>
    set({ currentGroceryList: [], extractedRecipes: [], totalEstimatedCost: null }),

  setIsExtracting: (val) => set({ isExtracting: val }),
  setExtractionError: (err) => set({ extractionError: err }),
  setTotalEstimatedCost: (cost) => set({ totalEstimatedCost: cost }),

  getCheckedCount: () => get().currentGroceryList.filter((i) => i.isChecked).length,
  getUncheckedItems: () => get().currentGroceryList.filter((i) => !i.isChecked),
}));

import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────

export interface HistoryRecipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  matchScore: number;
  imageBase64?: string;       // generated image (data uri)
  imageLoading?: boolean;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  cuisine: string;
  timestamp: number;           // Date.now()
  recipes: HistoryRecipe[];
}

export interface CookedEntry {
  id: string;
  recipeId: string;
  recipeTitle: string;
  cuisine: string;
  imageBase64?: string;
  cookedAt: number;            // Date.now()
}

// ─── Store ────────────────────────────────────────────────────────────

interface HistoryState {
  searchHistory: SearchHistoryEntry[];
  cookedItems: CookedEntry[];

  // Actions
  addSearchEntry: (entry: Omit<SearchHistoryEntry, 'id' | 'timestamp'>) => void;
  removeSearchEntry: (id: string) => void;
  clearSearchHistory: () => void;

  updateRecipeImage: (searchId: string, recipeId: string, imageBase64: string) => void;
  setRecipeImageLoading: (searchId: string, recipeId: string, loading: boolean) => void;

  markAsCooked: (recipe: {
    recipeId: string;
    recipeTitle: string;
    cuisine: string;
    imageBase64?: string;
  }) => void;
  removeCooked: (id: string) => void;
  clearCookedItems: () => void;

  isCooked: (recipeId: string) => boolean;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  searchHistory: [],
  cookedItems: [],

  addSearchEntry: (entry) =>
    set((state) => ({
      searchHistory: [
        {
          ...entry,
          id: `search-${Date.now()}`,
          timestamp: Date.now(),
        },
        ...state.searchHistory,
      ].slice(0, 50), // keep max 50 entries
    })),

  removeSearchEntry: (id) =>
    set((state) => ({
      searchHistory: state.searchHistory.filter((s) => s.id !== id),
    })),

  clearSearchHistory: () => set({ searchHistory: [] }),

  updateRecipeImage: (searchId, recipeId, imageBase64) =>
    set((state) => ({
      searchHistory: state.searchHistory.map((s) => {
        if (s.id !== searchId) return s;
        return {
          ...s,
          recipes: s.recipes.map((r) =>
            r.id === recipeId ? { ...r, imageBase64, imageLoading: false } : r,
          ),
        };
      }),
    })),

  setRecipeImageLoading: (searchId, recipeId, loading) =>
    set((state) => ({
      searchHistory: state.searchHistory.map((s) => {
        if (s.id !== searchId) return s;
        return {
          ...s,
          recipes: s.recipes.map((r) =>
            r.id === recipeId ? { ...r, imageLoading: loading } : r,
          ),
        };
      }),
    })),

  markAsCooked: (recipe) =>
    set((state) => ({
      cookedItems: [
        {
          id: `cooked-${Date.now()}`,
          ...recipe,
          cookedAt: Date.now(),
        },
        ...state.cookedItems,
      ],
    })),

  removeCooked: (id) =>
    set((state) => ({
      cookedItems: state.cookedItems.filter((c) => c.id !== id),
    })),

  clearCookedItems: () => set({ cookedItems: [] }),

  isCooked: (recipeId) =>
    get().cookedItems.some((c) => c.recipeId === recipeId),
}));

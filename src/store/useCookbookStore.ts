import { create } from 'zustand';
import { Cookbook, RecipeMatch } from '../types/cookbook';

interface CookbookState {
  cookbooks: Cookbook[];
  recipeMatches: RecipeMatch[];
  isSearching: boolean;
  searchError: string | null;
  addCookbook: (cookbook: Cookbook) => void;
  removeCookbook: (id: string) => void;
  updateCookbook: (id: string, updates: Partial<Cookbook>) => void;
  setRecipeMatches: (matches: RecipeMatch[]) => void;
  setIsSearching: (val: boolean) => void;
  setSearchError: (err: string | null) => void;
  clearMatches: () => void;
}

const sampleCookbooks: Cookbook[] = [
  {
    id: 'cb-1',
    title: 'Salt, Fat, Acid, Heat',
    author: 'Samin Nosrat',
    coverColor: '#E8D5B7',
    addedAt: '2026-01-15',
    recipeCount: 100,
  },
  {
    id: 'cb-2',
    title: 'The Food Lab',
    author: 'J. Kenji López-Alt',
    coverColor: '#2D4A3E',
    addedAt: '2026-01-20',
    recipeCount: 300,
  },
  {
    id: 'cb-3',
    title: 'Ottolenghi Simple',
    author: 'Yotam Ottolenghi',
    coverColor: '#F5E6CC',
    addedAt: '2026-02-01',
    recipeCount: 130,
  },
];

export const useCookbookStore = create<CookbookState>((set) => ({
  cookbooks: sampleCookbooks,
  recipeMatches: [],
  isSearching: false,
  searchError: null,
  addCookbook: (cookbook) =>
    set((state) => ({ cookbooks: [...state.cookbooks, cookbook] })),
  removeCookbook: (id) =>
    set((state) => ({
      cookbooks: state.cookbooks.filter((c) => c.id !== id),
    })),
  updateCookbook: (id, updates) =>
    set((state) => ({
      cookbooks: state.cookbooks.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })),
  setRecipeMatches: (matches) => set({ recipeMatches: matches }),
  setIsSearching: (val) => set({ isSearching: val }),
  setSearchError: (err) => set({ searchError: err }),
  clearMatches: () => set({ recipeMatches: [], searchError: null }),
}));

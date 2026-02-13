import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  estimatedPrice: number;
  isChecked: boolean;
  recipeName: string;
  recipeId: string;
  notes?: string;
}

export interface CartRecipeGroup {
  recipeId: string;
  recipeName: string;
  items: CartItem[];
  totalEstimatedCost: number;
}

interface CartState {
  items: CartItem[];
  addItemsForRecipe: (recipeId: string, recipeName: string, items: Omit<CartItem, 'recipeId' | 'recipeName' | 'isChecked'>[]) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  removeRecipeItems: (recipeId: string) => void;
  clearCart: () => void;
  clearChecked: () => void;
  getGroupedByRecipe: () => CartRecipeGroup[];
  getGroupedByCategory: () => Record<string, CartItem[]>;
  getTotalCost: () => number;
  getItemCount: () => number;
  getCheckedCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItemsForRecipe: (recipeId, recipeName, newItems) =>
    set((state) => {
      // Remove existing items for this recipe to avoid duplicates
      const filtered = state.items.filter((i) => i.recipeId !== recipeId);
      const itemsToAdd: CartItem[] = newItems.map((item) => ({
        ...item,
        recipeId,
        recipeName,
        isChecked: false,
      }));
      return { items: [...filtered, ...itemsToAdd] };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  toggleItem: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, isChecked: !i.isChecked } : i
      ),
    })),

  removeRecipeItems: (recipeId) =>
    set((state) => ({
      items: state.items.filter((i) => i.recipeId !== recipeId),
    })),

  clearCart: () => set({ items: [] }),

  clearChecked: () =>
    set((state) => ({
      items: state.items.filter((i) => !i.isChecked),
    })),

  getGroupedByRecipe: () => {
    const items = get().items;
    const groups: Record<string, CartRecipeGroup> = {};
    for (const item of items) {
      if (!groups[item.recipeId]) {
        groups[item.recipeId] = {
          recipeId: item.recipeId,
          recipeName: item.recipeName,
          items: [],
          totalEstimatedCost: 0,
        };
      }
      groups[item.recipeId].items.push(item);
      groups[item.recipeId].totalEstimatedCost += item.estimatedPrice;
    }
    return Object.values(groups);
  },

  getGroupedByCategory: () => {
    const items = get().items;
    const groups: Record<string, CartItem[]> = {};
    for (const item of items) {
      const cat = item.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  },

  getTotalCost: () =>
    get().items.reduce((sum, i) => sum + i.estimatedPrice, 0),

  getItemCount: () => get().items.length,

  getCheckedCount: () => get().items.filter((i) => i.isChecked).length,
}));

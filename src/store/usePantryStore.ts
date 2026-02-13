import { create } from 'zustand';
import { Ingredient } from '../types/ingredient';

type PantryFilter = 'All' | 'Expiring' | 'Surplus';

interface PantryState {
  ingredients: Ingredient[];
  filter: PantryFilter;
  searchQuery: string;
  setFilter: (filter: PantryFilter) => void;
  setSearchQuery: (query: string) => void;
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  clearPantry: () => void;
  getFilteredIngredients: () => Ingredient[];
}

// Placeholder mock data
const mockIngredients: Ingredient[] = [
  {
    id: '1',
    name: 'Tomatoes',
    quantity: 6,
    unit: 'pieces',
    expiryDate: '2026-02-16',
    category: 'Vegetables',
    isSurplus: false,
    addedAt: '2026-02-10',
  },
  {
    id: '2',
    name: 'Milk',
    quantity: 1,
    unit: 'liters',
    expiryDate: '2026-02-14',
    category: 'Dairy',
    isSurplus: false,
    addedAt: '2026-02-11',
  },
  {
    id: '3',
    name: 'Chicken Breast',
    quantity: 500,
    unit: 'g',
    expiryDate: '2026-02-15',
    category: 'Meat',
    isSurplus: false,
    addedAt: '2026-02-12',
  },
  {
    id: '4',
    name: 'Brown Rice',
    quantity: 2,
    unit: 'kg',
    expiryDate: '2026-06-01',
    category: 'Grains',
    isSurplus: true,
    addedAt: '2026-01-20',
  },
  {
    id: '5',
    name: 'Spinach',
    quantity: 1,
    unit: 'bunch',
    expiryDate: '2026-02-14',
    category: 'Vegetables',
    isSurplus: false,
    addedAt: '2026-02-12',
  },
  {
    id: '6',
    name: 'Greek Yogurt',
    quantity: 3,
    unit: 'cups',
    expiryDate: '2026-02-20',
    category: 'Dairy',
    isSurplus: true,
    addedAt: '2026-02-08',
  },
];

export const usePantryStore = create<PantryState>((set, get) => ({
  ingredients: mockIngredients,
  filter: 'All',
  searchQuery: '',
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addIngredient: (ingredient) =>
    set((state) => ({ ingredients: [...state.ingredients, ingredient] })),
  removeIngredient: (id) =>
    set((state) => ({
      ingredients: state.ingredients.filter((i) => i.id !== id),
    })),
  updateIngredient: (id, updates) =>
    set((state) => ({
      ingredients: state.ingredients.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    })),
  clearPantry: () => set({ ingredients: [] }),
  getFilteredIngredients: () => {
    const { ingredients, filter, searchQuery } = get();
    let filtered = ingredients;

    if (searchQuery) {
      filtered = filtered.filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (filter) {
      case 'Expiring':
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        filtered = filtered.filter(
          (i) => new Date(i.expiryDate) <= threeDaysFromNow
        );
        break;
      case 'Surplus':
        filtered = filtered.filter((i) => i.isSurplus);
        break;
    }

    return filtered;
  },
}));

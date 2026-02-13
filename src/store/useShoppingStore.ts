import { create } from 'zustand';
import { ShoppingItem, ShoppingCategory } from '../types/shoppingItem';

interface ShoppingState {
  items: ShoppingItem[];
  addItem: (item: ShoppingItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
  getGroupedItems: () => Record<ShoppingCategory, ShoppingItem[]>;
  getTotalEstimate: () => number;
}

const mockItems: ShoppingItem[] = [
  { id: '1', name: 'Organic Tomatoes', quantity: 6, unit: 'pieces', category: 'Produce', isChecked: false, estimatedPrice: 4.99 },
  { id: '2', name: 'Fresh Basil', quantity: 1, unit: 'bunch', category: 'Produce', isChecked: false, estimatedPrice: 2.49 },
  { id: '3', name: 'Mozzarella', quantity: 200, unit: 'g', category: 'Dairy', isChecked: true, estimatedPrice: 5.99 },
  { id: '4', name: 'Whole Wheat Bread', quantity: 1, unit: 'loaf', category: 'Bakery', isChecked: false, estimatedPrice: 3.49 },
  { id: '5', name: 'Salmon Fillet', quantity: 400, unit: 'g', category: 'Meat & Seafood', isChecked: false, estimatedPrice: 12.99 },
  { id: '6', name: 'Almond Milk', quantity: 1, unit: 'liter', category: 'Beverages', isChecked: false, estimatedPrice: 4.29 },
  { id: '7', name: 'Olive Oil', quantity: 500, unit: 'ml', category: 'Pantry', isChecked: true, estimatedPrice: 8.99 },
  { id: '8', name: 'Greek Yogurt', quantity: 500, unit: 'g', category: 'Dairy', isChecked: false, estimatedPrice: 3.99 },
];

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: mockItems,
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  toggleItem: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, isChecked: !i.isChecked } : i
      ),
    })),
  clearChecked: () =>
    set((state) => ({ items: state.items.filter((i) => !i.isChecked) })),
  clearAll: () => set({ items: [] }),
  getGroupedItems: () => {
    const { items } = get();
    return items.reduce((groups, item) => {
      const category = item.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as Record<ShoppingCategory, ShoppingItem[]>);
  },
  getTotalEstimate: () => {
    const { items } = get();
    return items
      .filter((i) => !i.isChecked)
      .reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);
  },
}));

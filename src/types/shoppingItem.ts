export type ShoppingCategory =
  | 'Produce'
  | 'Dairy'
  | 'Meat & Seafood'
  | 'Bakery'
  | 'Pantry'
  | 'Frozen'
  | 'Beverages'
  | 'Household'
  | 'Other';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingCategory;
  isChecked: boolean;
  estimatedPrice?: number;
}

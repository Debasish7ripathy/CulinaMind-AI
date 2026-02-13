export type IngredientCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Dairy'
  | 'Meat'
  | 'Grains'
  | 'Spices'
  | 'Beverages'
  | 'Snacks'
  | 'Frozen'
  | 'Other';

export type UnitType =
  | 'kg'
  | 'g'
  | 'lbs'
  | 'oz'
  | 'liters'
  | 'ml'
  | 'cups'
  | 'tbsp'
  | 'tsp'
  | 'pieces'
  | 'dozen'
  | 'bunch';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
  expiryDate: string;
  category: IngredientCategory;
  isSurplus: boolean;
  addedAt: string;
  imageUrl?: string;
  daysUntilExpiry?: number;
}

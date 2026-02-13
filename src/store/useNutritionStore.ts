import { create } from 'zustand';

export interface DailyNutrition {
  date: string; // YYYY-MM-DD
  recipeName: string;
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber: number; // g
  sodium: number; // mg
}

export interface WeeklyAggregation {
  totalCalories: number;
  avgDailyCalories: number;
  proteinGoalPercent: number;
  sodiumAlerts: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSodium: number;
}

interface NutritionState {
  entries: DailyNutrition[];
  weeklyGoal: {
    calories: number;
    protein: number; // g per day
    sodium: number; // mg per day max
  };

  addEntry: (entry: DailyNutrition) => void;
  removeEntry: (date: string, recipeName: string) => void;
  clearEntries: () => void;
  getWeeklyAggregation: () => WeeklyAggregation;
  getDailyTotals: () => { date: string; calories: number; protein: number; carbs: number; fat: number }[];
}

const today = new Date();
const mockEntries: DailyNutrition[] = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - (6 - i));
  const dateStr = d.toISOString().split('T')[0];
  return [
    {
      date: dateStr,
      recipeName: ['Grilled Chicken Salad', 'Oatmeal Bowl', 'Pasta Primavera', 'Salmon Teriyaki', 'Greek Bowl', 'Stir Fry', 'Avocado Toast'][i],
      calories: [520, 380, 610, 480, 440, 550, 350][i],
      protein: [42, 14, 18, 38, 22, 32, 12][i],
      carbs: [28, 52, 72, 34, 48, 42, 38][i],
      fat: [22, 10, 20, 18, 16, 24, 14][i],
      fiber: [6, 8, 4, 2, 5, 7, 4][i],
      sodium: [680, 220, 820, 540, 380, 900, 310][i],
    },
    {
      date: dateStr,
      recipeName: 'Snack / Side',
      calories: [280, 190, 320, 210, 250, 180, 300][i],
      protein: [8, 6, 10, 12, 8, 5, 9][i],
      carbs: [32, 24, 38, 18, 30, 26, 34][i],
      fat: [12, 8, 14, 10, 10, 8, 14][i],
      fiber: [2, 3, 1, 2, 3, 2, 2][i],
      sodium: [180, 120, 240, 160, 200, 140, 220][i],
    },
  ];
}).flat();

export const useNutritionStore = create<NutritionState>((set, get) => ({
  entries: mockEntries,
  weeklyGoal: {
    calories: 2200,
    protein: 120,
    sodium: 2300,
  },

  addEntry: (entry) =>
    set((state) => ({
      entries: [...state.entries, entry],
    })),

  removeEntry: (date, recipeName) =>
    set((state) => ({
      entries: state.entries.filter(
        (e) => !(e.date === date && e.recipeName === recipeName)
      ),
    })),

  clearEntries: () => set({ entries: [] }),

  getWeeklyAggregation: () => {
    const entries = get().entries;
    const goal = get().weeklyGoal;
    const totalCalories = entries.reduce((s, e) => s + e.calories, 0);
    const totalProtein = entries.reduce((s, e) => s + e.protein, 0);
    const totalCarbs = entries.reduce((s, e) => s + e.carbs, 0);
    const totalFat = entries.reduce((s, e) => s + e.fat, 0);
    const totalFiber = entries.reduce((s, e) => s + e.fiber, 0);
    const totalSodium = entries.reduce((s, e) => s + e.sodium, 0);
    const days = new Set(entries.map((e) => e.date)).size || 1;
    const avgDailyCalories = Math.round(totalCalories / days);
    const avgDailyProtein = totalProtein / days;
    const proteinGoalPercent = Math.min(
      100,
      Math.round((avgDailyProtein / goal.protein) * 100)
    );
    const dailyTotals = get().getDailyTotals();
    const sodiumAlerts = dailyTotals.filter((d) => {
      const daySodium = entries
        .filter((e) => e.date === d.date)
        .reduce((s, e) => s + e.sodium, 0);
      return daySodium > goal.sodium;
    }).length;

    return {
      totalCalories,
      avgDailyCalories,
      proteinGoalPercent,
      sodiumAlerts,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      totalSodium,
    };
  },

  getDailyTotals: () => {
    const entries = get().entries;
    const byDate: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
    for (const e of entries) {
      if (!byDate[e.date]) byDate[e.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      byDate[e.date].calories += e.calories;
      byDate[e.date].protein += e.protein;
      byDate[e.date].carbs += e.carbs;
      byDate[e.date].fat += e.fat;
    }
    return Object.entries(byDate)
      .map(([date, vals]) => ({ date, ...vals }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
}));

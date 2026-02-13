import { create } from 'zustand';
import { DayPlan, Meal, DietType } from '../types/meal';

interface MealPlanState {
  weekPlan: DayPlan[];
  selectedDiet: DietType;
  setSelectedDiet: (diet: DietType) => void;
  addMeal: (day: string, meal: Meal) => void;
  removeMeal: (day: string, mealId: string) => void;
  clearDay: (day: string) => void;
  clearAll: () => void;
}

const generateWeekPlan = (): DayPlan[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  return days.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      day,
      date: date.toISOString().split('T')[0],
      meals: [],
    };
  });
};

// Mock meals
const mockMeals: Meal[] = [
  {
    id: '1',
    name: 'Avocado Toast',
    mealType: 'Breakfast',
    ingredients: ['Bread', 'Avocado', 'Eggs', 'Salt'],
    instructions: ['Toast bread', 'Mash avocado', 'Top with egg'],
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    calories: 350,
    dietaryTags: ['Vegetarian'],
  },
  {
    id: '2',
    name: 'Grilled Chicken Salad',
    mealType: 'Lunch',
    ingredients: ['Chicken', 'Lettuce', 'Tomato', 'Olive Oil'],
    instructions: ['Grill chicken', 'Chop vegetables', 'Toss together'],
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    calories: 420,
    dietaryTags: ['Keto', 'Low-Carb'],
  },
  {
    id: '3',
    name: 'Pasta Primavera',
    mealType: 'Dinner',
    ingredients: ['Pasta', 'Bell Peppers', 'Zucchini', 'Garlic'],
    instructions: ['Cook pasta', 'Sauté vegetables', 'Combine'],
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    calories: 520,
    dietaryTags: ['Vegetarian'],
  },
];

export const useMealPlanStore = create<MealPlanState>((set) => {
  const weekPlan = generateWeekPlan();
  // Pre-fill some days with mock meals
  weekPlan[0].meals = [mockMeals[0], mockMeals[1]];
  weekPlan[1].meals = [mockMeals[2]];
  weekPlan[3].meals = [mockMeals[0], mockMeals[2]];

  return {
    weekPlan,
    selectedDiet: 'All',
    setSelectedDiet: (diet) => set({ selectedDiet: diet }),
    addMeal: (day, meal) =>
      set((state) => ({
        weekPlan: state.weekPlan.map((d) =>
          d.day === day ? { ...d, meals: [...d.meals, meal] } : d
        ),
      })),
    removeMeal: (day, mealId) =>
      set((state) => ({
        weekPlan: state.weekPlan.map((d) =>
          d.day === day
            ? { ...d, meals: d.meals.filter((m) => m.id !== mealId) }
            : d
        ),
      })),
    clearDay: (day) =>
      set((state) => ({
        weekPlan: state.weekPlan.map((d) =>
          d.day === day ? { ...d, meals: [] } : d
        ),
      })),
    clearAll: () => set({ weekPlan: generateWeekPlan() }),
  };
});

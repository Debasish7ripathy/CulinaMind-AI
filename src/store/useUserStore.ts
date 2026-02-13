import { create } from 'zustand';
import { User, UserPreferences, EcoImpactStats } from '../types/user';

interface UserState {
  user: User;
  isOnboarded: boolean;
  setOnboarded: (value: boolean) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  setUser: (user: Partial<User>) => void;
  logout: () => void;
}

const defaultUser: User = {
  id: '1',
  name: 'Alex Chef',
  email: 'alex@culinamind.com',
  profilePictureUrl: undefined,
  preferences: {
    dietaryPreferences: ['Vegetarian', 'Low-Carb'],
    allergies: ['Peanuts'],
    householdSize: 2,
    notificationsEnabled: true,
  },
  ecoImpact: {
    foodSaved: 12.5,
    co2Reduced: 8.3,
    waterSaved: 450,
    mealsShared: 5,
  },
  joinedAt: '2025-06-01',
};

export const useUserStore = create<UserState>((set) => ({
  user: defaultUser,
  isOnboarded: false,
  setOnboarded: (value) => set({ isOnboarded: value }),
  updatePreferences: (prefs) =>
    set((state) => ({
      user: {
        ...state.user,
        preferences: { ...state.user.preferences, ...prefs },
      },
    })),
  setUser: (updates) =>
    set((state) => ({
      user: { ...state.user, ...updates },
    })),
  logout: () => set({ user: defaultUser, isOnboarded: false }),
}));

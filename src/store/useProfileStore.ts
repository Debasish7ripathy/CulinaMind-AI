import { create } from 'zustand';

export type DietPreference =
  | 'No Preference'
  | 'Vegetarian'
  | 'Vegan'
  | 'Keto'
  | 'Paleo'
  | 'Mediterranean'
  | 'Low-Carb'
  | 'High-Protein'
  | 'Gluten-Free';

export type FitnessGoal =
  | 'Lose Weight'
  | 'Build Muscle'
  | 'Maintain Weight'
  | 'Improve Health'
  | 'Athletic Performance';

export interface UserProfile {
  name: string;
  weight: number; // kg
  height: number; // cm
  age: number;
  dietPreference: DietPreference;
  fitnessGoal: FitnessGoal;
  dailyCalorieTarget: number;
  allergies: string[];
}

interface ProfileState {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addAllergy: (allergy: string) => void;
  removeAllergy: (allergy: string) => void;
  resetProfile: () => void;
}

const defaultProfile: UserProfile = {
  name: 'Alex Chef',
  weight: 72,
  height: 175,
  age: 28,
  dietPreference: 'No Preference',
  fitnessGoal: 'Maintain Weight',
  dailyCalorieTarget: 2200,
  allergies: ['Peanuts'],
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: defaultProfile,

  updateProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),

  addAllergy: (allergy) =>
    set((state) => ({
      profile: {
        ...state.profile,
        allergies: state.profile.allergies.includes(allergy)
          ? state.profile.allergies
          : [...state.profile.allergies, allergy],
      },
    })),

  removeAllergy: (allergy) =>
    set((state) => ({
      profile: {
        ...state.profile,
        allergies: state.profile.allergies.filter((a) => a !== allergy),
      },
    })),

  resetProfile: () => set({ profile: defaultProfile }),
}));

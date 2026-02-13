export interface EcoImpactStats {
  foodSaved: number;       // in kg
  co2Reduced: number;      // in kg
  waterSaved: number;      // in liters
  mealsShared: number;
}

export interface UserPreferences {
  dietaryPreferences: string[];
  allergies: string[];
  householdSize: number;
  notificationsEnabled: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  preferences: UserPreferences;
  ecoImpact: EcoImpactStats;
  joinedAt: string;
}

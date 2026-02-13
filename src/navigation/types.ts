import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';

export type BottomTabParamList = {
  Home: undefined;
  Pantry: undefined;
  Import: undefined;
  AskAI: undefined;
  Nutrition: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  VoiceAssistant: undefined;
  AddIngredient: undefined;
  ShoppingList: undefined;
  RecipeDetails: { recipeId: string };
  Paywall: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof BottomTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<BottomTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

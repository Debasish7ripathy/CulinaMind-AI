import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import VoiceAssistantScreen from '../screens/VoiceAssistantScreen';
import AddIngredientScreen from '../screens/AddIngredientScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import RecipeDetailsScreen from '../screens/RecipeDetailsScreen';
import PaywallScreen from '../screens/PaywallScreen';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="VoiceAssistant"
        component={VoiceAssistantScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="AddIngredient"
        component={AddIngredientScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="RecipeDetails"
        component={RecipeDetailsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

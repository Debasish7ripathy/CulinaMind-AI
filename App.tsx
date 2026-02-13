import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/useThemeStore';
import { useSubscriptionStore } from './src/store/useSubscriptionStore';
import { colors } from './src/theme/colors';
import {
  configureRevenueCat,
  getCustomerInfo,
  onCustomerInfoUpdated,
} from './src/services/revenueCat';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const CulinaDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.backgroundDark,
    card: colors.cardDark,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};

const CulinaLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.backgroundLight,
    card: colors.cardLight,
    text: colors.textDark,
    border: colors.borderLight,
    notification: colors.primary,
  },
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const updateFromCustomerInfo = useSubscriptionStore(
    (s) => s.updateFromCustomerInfo,
  );
  const setLoading = useSubscriptionStore((s) => s.setLoading);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        });

        // Configure RevenueCat
        await configureRevenueCat();

        // Fetch initial customer info
        try {
          const info = await getCustomerInfo();
          updateFromCustomerInfo(info);
        } catch {
          setLoading(false);
        }
      } catch (e) {
        console.warn('App prepare error:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Listen for real-time subscription changes
  useEffect(() => {
    const unsubscribe = onCustomerInfoUpdated((info) => {
      updateFromCustomerInfo(info);
    });
    return unsubscribe;
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={
            isDarkMode ? colors.backgroundDark : colors.backgroundLight
          }
        />
        <NavigationContainer
          theme={isDarkMode ? CulinaDarkTheme : CulinaLightTheme}
        >
          <AppNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

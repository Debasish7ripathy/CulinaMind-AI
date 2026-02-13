import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackScreenProps } from '../navigation/types';
import { useUserStore } from '../store/useUserStore';

const SplashScreen = ({ navigation }: RootStackScreenProps<'Splash'>) => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;
  const isOnboarded = useUserStore((s) => s.isOnboarded);

  useEffect(() => {
    // Logo fade in + scale
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Tagline slide up
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(taglineTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    // Navigate after splash
    const timer = setTimeout(() => {
      if (isOnboarded) {
        navigation.replace('MainTabs', { screen: 'Home' });
      } else {
        navigation.replace('Onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0F172A']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🧠</Text>
        </View>
        <Text style={[typography.h1, styles.logoText]}>
          Culina<Text style={styles.logoAccent}>Mind</Text>
        </Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: taglineOpacity,
          transform: [{ translateY: taglineTranslateY }],
        }}
      >
        <Text style={[typography.body, styles.tagline]}>
          AI-Powered Kitchen Intelligence
        </Text>
      </Animated.View>

      <View style={styles.bottomDots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  logoEmoji: {
    fontSize: 48,
  },
  logoText: {
    color: colors.textPrimary,
    fontSize: 36,
  },
  logoAccent: {
    color: colors.primary,
  },
  tagline: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  bottomDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 60,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary + '40',
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
});

export default SplashScreen;

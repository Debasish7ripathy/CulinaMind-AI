import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { RootStackScreenProps } from '../navigation/types';
import { useUserStore } from '../store/useUserStore';
import OnboardingSlide from '../components/OnboardingSlide';
import { hapticLight } from '../utils/haptics';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Smart Pantry\nManagement',
    description:
      'Track your ingredients, get expiry alerts, and never waste food again. AI-powered suggestions keep your kitchen organized.',
    emoji: '🥘',
  },
  {
    id: '2',
    title: 'AI Meal\nPlanning',
    description:
      'Get personalized meal plans based on what you have. Save time, eat healthy, and reduce waste with intelligent recipes.',
    emoji: '🤖',
  },
  {
    id: '3',
    title: 'Share &\nSave Together',
    description:
      'Connect with your community to share surplus food. Reduce waste, help neighbors, and track your positive eco impact.',
    emoji: '🌍',
  },
];

const OnboardingScreen = ({
  navigation,
}: RootStackScreenProps<'Onboarding'>) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const setOnboarded = useUserStore((s) => s.setOnboarded);

  const handleNext = () => {
    hapticLight();
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    hapticLight();
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setOnboarded(true);
    navigation.replace('MainTabs', { screen: 'Home' });
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Skip button */}
      <Animated.View entering={FadeIn.delay(300)} style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={[typography.button, styles.skipText]}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => (
          <OnboardingSlide
            title={item.title}
            description={item.description}
            emoji={item.emoji}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        bounces={false}
      />

      {/* Bottom controls */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(400)}
        style={styles.bottomContainer}
      >
        {/* Page indicators */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex
                      ? colors.primary
                      : colors.textSecondary + '40',
                  width: index === currentIndex ? 28 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[typography.button, styles.nextButtonText]}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    zIndex: 10,
  },
  skipText: {
    color: colors.textSecondary,
  },
  bottomContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 50,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 22,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 17,
  },
});

export default OnboardingScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Sparkles, ChevronDown } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { useMealPlanStore } from '../store/useMealPlanStore';
import { TabScreenProps } from '../navigation/types';
import Header from '../components/Header';
import DayCard from '../components/DayCard';
import FilterChip from '../components/FilterChip';
import { hapticMedium, hapticLight } from '../utils/haptics';
import { DietType } from '../types/meal';

const dietFilters: DietType[] = [
  'All', 'Vegetarian', 'Vegan', 'Keto', 'Low-Carb', 'Gluten-Free',
];

const MealPlannerScreen = ({
  navigation,
}: any) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const { weekPlan, selectedDiet, setSelectedDiet } = useMealPlanStore();
  const [showDietDropdown, setShowDietDropdown] = useState(false);

  const bg = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Header title="Meal Planner" showProfile={false} showNotification={false} />

      {/* Diet Filter Row */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(300)}
        style={styles.filterSection}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {dietFilters.map((diet) => (
            <FilterChip
              key={diet}
              label={diet}
              isActive={selectedDiet === diet}
              onPress={() => setSelectedDiet(diet)}
            />
          ))}
        </ScrollView>
      </Animated.View>

      {/* Week View */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(300)}
        style={styles.weekSection}
      >
        <View style={styles.weekHeader}>
          <Text style={[typography.subtitle, { color: textColor }]}>
            This Week
          </Text>
          <Text
            style={[typography.caption, { color: colors.textSecondary }]}
          >
            {weekPlan[0]?.date} — {weekPlan[6]?.date}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayCardsScroll}
          decelerationRate="fast"
          snapToInterval={296}
        >
          {weekPlan.map((dayPlan, index) => (
            <Animated.View
              key={dayPlan.day}
              entering={FadeInDown.delay(300 + index * 80).duration(300)}
            >
              <DayCard
                dayPlan={dayPlan}
                isToday={dayPlan.date === today}
                onAddMeal={(day) => {
                  hapticLight();
                  // placeholder — would navigate to add meal
                }}
              />
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Generate Plan Button */}
      <Animated.View
        entering={FadeInDown.delay(600).duration(300)}
        style={styles.generateContainer}
      >
        <TouchableOpacity
          style={[styles.generateButton, getShadow('glow')]}
          activeOpacity={0.8}
          onPress={() => {
            hapticMedium();
            // placeholder — would trigger AI meal generation
          }}
        >
          <Sparkles size={20} color={colors.white} />
          <Text
            style={[typography.button, { color: colors.white, marginLeft: 8 }]}
          >
            Generate AI Meal Plan
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterSection: {
    marginBottom: spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
  },
  weekSection: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  dayCardsScroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  generateContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: 24,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 22,
  },
});

export default MealPlannerScreen;

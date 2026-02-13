import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { DayPlan } from '../types/meal';
import { hapticLight } from '../utils/haptics';
import MealCard from './MealCard';

interface DayCardProps {
  dayPlan: DayPlan;
  isToday?: boolean;
  onAddMeal?: (day: string) => void;
  onMealPress?: (mealId: string) => void;
}

const DayCard: React.FC<DayCardProps> = ({
  dayPlan,
  isToday = false,
  onAddMeal,
  onMealPress,
}) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDarkMode ? colors.cardDark : colors.cardLight,
            borderColor: isToday ? colors.primary : 'transparent',
            borderWidth: isToday ? 2 : 0,
          },
          getShadow('small'),
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text
              style={[
                typography.subtitle,
                {
                  color: isToday
                    ? colors.primary
                    : isDarkMode
                    ? colors.textPrimary
                    : colors.textDark,
                },
              ]}
            >
              {dayPlan.day}
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary },
              ]}
            >
              {dayPlan.date}
            </Text>
          </View>
          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={[typography.caption, { color: colors.white, fontFamily: 'Inter-SemiBold' }]}>
                Today
              </Text>
            </View>
          )}
        </View>

        {dayPlan.meals.length > 0 ? (
          <View style={styles.meals}>
            {dayPlan.meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                compact
                onPress={() => onMealPress?.(meal.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, textAlign: 'center' },
              ]}
            >
              No meals planned
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            hapticLight();
            onAddMeal?.(dayPlan.day);
          }}
          activeOpacity={0.7}
        >
          <Plus size={16} color={colors.primary} />
          <Text
            style={[
              typography.buttonSmall,
              { color: colors.primary, marginLeft: 4 },
            ]}
          >
            Add Meal
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    width: 280,
    marginRight: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  todayBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  meals: {
    marginBottom: spacing.sm,
  },
  emptyState: {
    paddingVertical: spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border + '40',
  },
});

export default DayCard;
